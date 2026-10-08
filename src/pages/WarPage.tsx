import { useEffect, useState, useCallback, useRef } from 'react'
import {
  getWarState, getMyMoves, submitWarMove,
  WarState, Territory, WarFaction, MyMove
} from '../api/client'

// ── Paleta de cores por facção ─────────────────────────────────────────
const FACTION_PALETTE = [
  '#3a6ea8', '#8b2020', '#2a7a3a', '#8b6014',
  '#5a2a8a', '#1a7a7a', '#8a4a1a', '#4a4a8a',
]
const NEUTRAL_COLOR = '#2a2620'

function factionColor(factionId: number, factions: WarFaction[]): string {
  if (factionId === 0) return NEUTRAL_COLOR
  const idx = factions.findIndex(f => f.id === factionId)
  return idx >= 0 ? FACTION_PALETTE[idx % FACTION_PALETTE.length] : '#555'
}

function factionName(factionId: number, factions: WarFaction[]): string {
  if (factionId === 0) return 'Neutro'
  return factions.find(f => f.id === factionId)?.name ?? ('Facção ' + factionId)
}

// ── Badge de território (imagem com fallback colorido) ────────────────
function TerritoryBadge({
  imagePath, name, size, color, filter, selected,
}: {
  imagePath: string
  name: string
  size: number
  color: string
  filter: string
  selected: boolean
}) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    // Fallback: círculo colorido quando a imagem não existe ainda
    return (
      <div style={{
        width:        size,
        height:       size * 0.55,
        background:   color,
        opacity:      0.85,
        borderRadius: 6,
        border:       selected ? '2px solid #f0d060' : '1px solid rgba(255,255,255,0.25)',
        margin:       '0 auto',
        boxShadow:    `0 0 10px ${color}`,
      }} />
    )
  }

  return (
    <img
      src={`/territories/${imagePath}`}
      alt={name}
      onError={() => setFailed(true)}
      style={{
        width:        size,
        height:       'auto',
        display:      'block',
        margin:       '0 auto',
        filter,
        outline:      selected ? '2px solid #f0d060' : 'none',
        outlineOffset: 2,
        borderRadius:  4,
      }}
    />
  )
}

// ── Componente principal ───────────────────────────────────────────────
export default function WarPage() {
  const [warState,    setWarState]    = useState<WarState | null>(null)
  const [myMoves,     setMyMoves]     = useState<MyMove[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [fromId,      setFromId]      = useState<number | null>(null)
  const [toId,        setToId]        = useState<number | null>(null)
  const [troops,      setTroops]      = useState(10)
  const [moveMsg,     setMoveMsg]     = useState('')
  const [moveSending, setMoveSending] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const mapRef = useRef<HTMLDivElement>(null)
  const myFactionId = Number(localStorage.getItem('factionId') ?? 0)

  // Monitora mudança de estado fullscreen do navegador
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      mapRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const reload = useCallback(async () => {
    try {
      const [warRes, movesRes] = await Promise.all([getWarState(), getMyMoves()])
      setWarState(warRes.data)
      setMyMoves(movesRes.data.moves)
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Erro ao carregar estado da guerra.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  async function handleSubmitMove() {
    if (!fromId || !toId) return
    setMoveSending(true)
    setMoveMsg('')
    try {
      const res = await submitWarMove(fromId, toId, troops)
      setMoveMsg(res.data.message)
      setFromId(null)
      setToId(null)
      setTroops(10)
      const [warRes, movesRes] = await Promise.all([getWarState(), getMyMoves()])
      setWarState(warRes.data)
      setMyMoves(movesRes.data.moves)
    } catch (e: any) {
      setMoveMsg(e.response?.data?.message ?? 'Erro ao enviar movimento.')
    } finally {
      setMoveSending(false)
    }
  }

  function handleTileClick(t: Territory) {
    if (!fromId) {
      if (t.factionOwner !== myFactionId) {
        setMoveMsg('Selecione primeiro um território da sua facção como origem.')
        return
      }
      setFromId(t.id)
      setMoveMsg('')
    } else if (t.id === fromId) {
      setFromId(null)
      setToId(null)
      setMoveMsg('')
    } else {
      setToId(t.id)
      setMoveMsg('')
    }
  }

  if (loading) return <Page><p style={{ color: '#7a6a4a' }}>Carregando mapa de guerra...</p></Page>
  if (error)   return <Page><p style={{ color: '#e07070' }}>{error}</p></Page>
  if (!warState) return null

  const nextTurn = new Date(warState.nextTurnAt)

  // Tamanho dos emblemas: pequeno no mapa normal, maior no fullscreen
  const badgeSize = isFullscreen ? 80 : 42
  const labelSize = isFullscreen ? 11 : 8

  function renderMap() {
    return (
      <>
        <img
          src="/world-map.png"
          alt="Mapa do Mundo"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {warState!.territories.map(t => {
          const isFrom        = fromId === t.id
          const isTo          = toId   === t.id
          const color         = factionColor(t.factionOwner, warState!.warFactions)
          const pendingTroops = warState!.pendingMoves
            .filter(m => m.toId === t.id)
            .reduce((sum, m) => sum + m.troops, 0)

          const glowParts = [`drop-shadow(0 0 8px ${color})`]
          if (isFrom) glowParts.push('drop-shadow(0 0 5px #f0d060) drop-shadow(0 0 5px #f0d060)')
          if (isTo)   glowParts.push('drop-shadow(0 0 5px #fff) drop-shadow(0 0 5px #fff)')

          return (
            <div
              key={t.id}
              onClick={() => handleTileClick(t)}
              style={{
                position:   'absolute',
                left:       `${t.mapX}%`,
                top:        `${t.mapY}%`,
                transform:  'translate(-50%, -50%)',
                cursor:     'pointer',
                textAlign:  'center',
                userSelect: 'none',
                zIndex:     (isFrom || isTo) ? 10 : 1,
              }}
            >
              <TerritoryBadge
                imagePath={t.imagePath}
                name={t.name}
                size={badgeSize}
                color={color}
                filter={glowParts.join(' ')}
                selected={isFrom || isTo}
              />
              <div style={{
                color:        '#f0e8d0',
                fontSize:     labelSize,
                fontFamily:   'Georgia, serif',
                fontWeight:   'bold',
                marginTop:    1,
                whiteSpace:   'nowrap',
                lineHeight:   1.3,
                background:   'rgba(0,0,0,0.65)',
                borderRadius: 3,
                padding:      '1px 4px',
              }}>
                {t.name}
              </div>
              <div style={{
                color:        t.factionOwner === 0 ? '#c8b89a' : '#f0e8d0',
                fontSize:     labelSize - 1,
                fontFamily:   'Georgia, serif',
                whiteSpace:   'nowrap',
                lineHeight:   1.3,
                background:   'rgba(0,0,0,0.65)',
                borderRadius: 3,
                padding:      '1px 4px',
                marginTop:    1,
              }}>
                {factionName(t.factionOwner, warState!.warFactions)}
              </div>
              {pendingTroops > 0 && (
                <div style={{
                  color:        '#f0c040',
                  fontSize:     labelSize,
                  fontWeight:   'bold',
                  background:   'rgba(0,0,0,0.65)',
                  borderRadius: 3,
                  padding:      '1px 4px',
                  marginTop:    1,
                }}>
                  ⚔{pendingTroops}
                </div>
              )}
            </div>
          )
        })}
      </>
    )
  }

  return (
    <Page>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <h2 style={{ color: '#c8a84b', fontSize: 18, letterSpacing: 2 }}>Mapa de Guerra</h2>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: '#7a6a4a', fontSize: 12 }}>Próximo turno</p>
          <p style={{ color: '#d4c5a9', fontSize: 14 }}>
            {nextTurn.toLocaleDateString('pt-BR', { weekday: 'long' })}{' '}
            {nextTurn.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(500px, 720px) 1fr', gap: 24, alignItems: 'start' }}>

        {/* ── Mapa ── */}
        <div>
          {/* Wrapper que recebe o fullscreen do navegador */}
          <div
            ref={mapRef}
            style={{
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              background:      isFullscreen ? '#000' : 'transparent',
              width:           isFullscreen ? '100vw' : 'auto',
              height:          isFullscreen ? '100vh' : 'auto',
            }}
          >
            {/* Container do mapa com aspect-ratio fixo */}
            <div style={{
              position:     'relative',
              // Fullscreen: limita pela altura da tela mantendo proporção
              height:       isFullscreen ? '100vh' : 'auto',
              width:        isFullscreen ? 'auto'  : '100%',
              maxWidth:     isFullscreen ? undefined : 720,
              aspectRatio:  '1369 / 888',
              background:   '#06100e',
              borderRadius: isFullscreen ? 0 : 6,
              border:       isFullscreen ? 'none' : '1px solid #3a2e18',
              overflow:     'hidden',
            }}>
              {renderMap()}

              {/* Botão fullscreen dentro do mapa */}
              <button
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
                style={{
                  position:   'absolute',
                  bottom:     10,
                  right:      10,
                  background: 'rgba(0,0,0,0.7)',
                  border:     '1px solid #5a4a2a',
                  borderRadius: 4,
                  color:      '#c8a84b',
                  fontSize:   16,
                  cursor:     'pointer',
                  padding:    '4px 8px',
                  zIndex:     20,
                  lineHeight: 1,
                }}
              >
                {isFullscreen ? '✕' : '⛶'}
              </button>
            </div>
          </div>

          {/* Legenda */}
          <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
            <LegendItem color={NEUTRAL_COLOR} label="Neutro" />
            {warState.warFactions.map((f, i) => (
              <LegendItem key={f.id} color={FACTION_PALETTE[i % FACTION_PALETTE.length]} label={f.name} />
            ))}
          </div>
        </div>

        {/* ── Painel lateral ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {myFactionId > 0 ? (
            <div style={panelStyle}>
              <h3 style={panelTitleStyle}>Enviar Tropas</h3>
              <p style={{ color: '#7a6a4a', fontSize: 12, marginBottom: 12 }}>
                Clique em um território seu (●) e depois no destino (◎).
              </p>
              <InfoRow label="Origem"  value={fromId ? (warState.territories.find(t => t.id === fromId)?.name ?? '?') : '—'} />
              <InfoRow label="Destino" value={toId   ? (warState.territories.find(t => t.id === toId)?.name   ?? '?') : '—'} />
              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>Tropas (custo: {troops * warState.copperPerTroop} cobre)</label>
                <input
                  type="number"
                  min={1}
                  max={warState.maxTroops}
                  value={troops}
                  onChange={e => setTroops(Math.max(1, Math.min(warState.maxTroops, Number(e.target.value))))}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button
                  onClick={handleSubmitMove}
                  disabled={!fromId || !toId || moveSending}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    background: (!fromId || !toId) ? '#2a2010' : 'linear-gradient(180deg, #7a5810 0%, #5a4010 100%)',
                    border: '1px solid #c8a84b',
                    borderRadius: 4,
                    color: (!fromId || !toId) ? '#5a4a2a' : '#f0dda0',
                    cursor: (!fromId || !toId) ? 'not-allowed' : 'pointer',
                    fontSize: 13,
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  {moveSending ? 'Enviando...' : 'Confirmar'}
                </button>
                <button
                  onClick={() => { setFromId(null); setToId(null); setMoveMsg('') }}
                  style={{ padding: '8px 14px', background: 'transparent', border: '1px solid #3a2e18', borderRadius: 4, color: '#7a6a4a', cursor: 'pointer', fontSize: 13 }}
                >
                  Cancelar
                </button>
              </div>
              {moveMsg && (
                <p style={{ marginTop: 10, fontSize: 12, color: moveMsg.startsWith('Selecione') || moveMsg.startsWith('Erro') ? '#e07070' : '#70c070' }}>
                  {moveMsg}
                </p>
              )}
            </div>
          ) : (
            <div style={panelStyle}>
              <p style={{ color: '#7a6a4a', fontSize: 13 }}>Entre em uma facção para participar da guerra.</p>
            </div>
          )}

          <div style={panelStyle}>
            <h3 style={panelTitleStyle}>Meus Movimentos ({myMoves.length})</h3>
            {myMoves.length === 0 ? (
              <p style={{ color: '#5a4a2a', fontSize: 13 }}>Nenhum movimento esta semana.</p>
            ) : (
              myMoves.map((m, i) => (
                <div key={i} style={{ borderBottom: '1px solid #2a2010', paddingBottom: 8, marginBottom: 8 }}>
                  <p style={{ color: '#d4c5a9', fontSize: 13 }}>{m.from} → {m.to}</p>
                  <p style={{ color: '#7a6a4a', fontSize: 11 }}>{m.troops} tropas · {m.submittedAt}</p>
                </div>
              ))
            )}
          </div>

          <div style={panelStyle}>
            <h3 style={panelTitleStyle}>Histórico</h3>
            {warState.history.length === 0 ? (
              <p style={{ color: '#5a4a2a', fontSize: 13 }}>Nenhuma batalha ainda.</p>
            ) : (
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {[...warState.history].reverse().map((h, i) => (
                  <p key={i} style={{ color: '#8a7a5a', fontSize: 12, marginBottom: 4, fontFamily: 'monospace' }}>{h}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Page>
  )
}

// ── Sub-componentes ───────────────────────────────────────────────────

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      {children}
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 10, height: 10, borderRadius: 2, background: color, border: '1px solid #3a2e18' }} />
      <span style={{ color: '#7a6a4a', fontSize: 11 }}>{label}</span>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ color: '#5a4a2a', fontSize: 12 }}>{label}</span>
      <span style={{ color: '#d4c5a9', fontSize: 12 }}>{value}</span>
    </div>
  )
}

const panelStyle: React.CSSProperties = {
  background: '#12100c',
  border: '1px solid #3a2e18',
  borderRadius: 6,
  padding: 16,
}

const panelTitleStyle: React.CSSProperties = {
  color: '#c8a84b',
  fontSize: 12,
  letterSpacing: 1,
  textTransform: 'uppercase',
  marginBottom: 12,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#7a6a4a',
  fontSize: 11,
  marginBottom: 4,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 10px',
  background: '#0e0c08',
  border: '1px solid #3a2e18',
  borderRadius: 4,
  color: '#d4c5a9',
  fontSize: 14,
  fontFamily: 'Georgia, serif',
}
