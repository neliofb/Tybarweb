import { useEffect, useState } from 'react'
import { getFactions, getFactionById, FactionSummary, FactionDetail } from '../api/client'

// Converte o Hue do ServUO para uma cor HTML aproximada
function hueToColor(hue: number): string {
  if (hue <= 0) return '#6a6a6a'
  // Mapeamento dos hues mais comuns do UO para cores web
  const map: Record<number, string> = {
    1150: '#7ab0d0', // azul claro (padrão controller)
    33:   '#ff4040', // vermelho
    68:   '#40ff40', // verde
    88:   '#4040ff', // azul
    1153: '#d0c090', // bege
    2213: '#ffd040', // dourado
    1653: '#c87850', // cobre
  }
  return map[hue] ?? '#a09070'
}

export default function FactionsPage() {
  const [factions, setFactions] = useState<FactionSummary[]>([])
  const [selected, setSelected] = useState<FactionDetail | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => {
    getFactions()
      .then(r => setFactions(r.data.factions))
      .catch(e => setError(e.response?.data?.error ?? 'Erro ao carregar facções.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSelect(id: number) {
    if (selected?.id === id) { setSelected(null); return }
    setDetailLoading(true)
    try {
      const r = await getFactionById(id)
      setSelected(r.data)
    } catch {
      setSelected(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const roleLabel: Record<string, string> = {
    Member: 'Membro', Officer: 'Oficial', SubLeader: 'Sub-Líder', Leader: 'Líder',
  }

  if (loading) return <Page><p style={{ color: '#7a6a4a' }}>Carregando...</p></Page>
  if (error)   return <Page><p style={{ color: '#e07070' }}>{error}</p></Page>

  return (
    <Page>
      <h2 style={{ color: '#c8a84b', fontSize: 18, letterSpacing: 2, marginBottom: 24 }}>
        Facções
      </h2>

      {factions.length === 0 && (
        <p style={{ color: '#7a6a4a' }}>Nenhuma facção criada ainda.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {factions.map(f => (
          <div key={f.id}>
            {/* Cabeçalho da facção */}
            <div
              onClick={() => handleSelect(f.id)}
              style={{
                background: selected?.id === f.id ? '#1e1a10' : '#12100c',
                border: '1px solid ' + (selected?.id === f.id ? '#c8a84b' : '#3a2e18'),
                borderRadius: selected?.id === f.id ? '6px 6px 0 0' : 6,
                padding: '14px 18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              {/* Indicador de cor da facção */}
              <div style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: hueToColor(f.hue),
                flexShrink: 0,
              }} />

              <div style={{ flex: 1 }}>
                <span style={{ color: '#d4c5a9', fontSize: 15 }}>{f.name}</span>
                {f.parentId > 0 && (
                  <span style={{ color: '#5a4a2a', fontSize: 11, marginLeft: 8 }}>
                    sub-facção #{f.parentId}
                  </span>
                )}
              </div>

              <span style={{ color: '#7a6a4a', fontSize: 13 }}>
                {f.memberCount} membro{f.memberCount !== 1 ? 's' : ''}
              </span>

              <span style={{ color: '#5a4a2a', fontSize: 13 }}>
                {f.bankBalance.toLocaleString('pt-BR')} ⟁
              </span>

              <span style={{ color: '#5a4a2a', fontSize: 11 }}>
                {selected?.id === f.id ? '▲' : '▼'}
              </span>
            </div>

            {/* Detalhe expandido */}
            {selected?.id === f.id && (
              <div style={{
                background: '#0e0c08',
                border: '1px solid #c8a84b',
                borderTop: 'none',
                borderRadius: '0 0 6px 6px',
                padding: '16px 18px',
              }}>
                {detailLoading ? (
                  <p style={{ color: '#7a6a4a', fontSize: 13 }}>Carregando detalhes...</p>
                ) : (
                  <>
                    {selected.description && (
                      <p style={{ color: '#9a8a6a', fontSize: 13, marginBottom: 16, fontStyle: 'italic' }}>
                        "{selected.description}"
                      </p>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      {/* Membros */}
                      <div>
                        <h4 style={{ color: '#c8a84b', fontSize: 12, letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' }}>
                          Membros ({selected.members.length})
                        </h4>
                        {selected.members.length === 0 && (
                          <p style={{ color: '#5a4a2a', fontSize: 13 }}>Nenhum membro</p>
                        )}
                        {selected.members.map((m, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ color: m.online ? '#d4c5a9' : '#5a4a2a', fontSize: 13 }}>
                              {m.online ? '🟢' : '⚫'} {m.name}
                            </span>
                            <span style={{ color: '#7a6a4a', fontSize: 12 }}>
                              {roleLabel[m.role] ?? m.role}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Ledger do banco */}
                      <div>
                        <h4 style={{ color: '#c8a84b', fontSize: 12, letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' }}>
                          Extrato do Banco
                        </h4>
                        <div style={{ fontFamily: 'monospace', fontSize: 11 }}>
                          {selected.ledger.length === 0 && (
                            <p style={{ color: '#5a4a2a' }}>Sem movimentações</p>
                          )}
                          {[...selected.ledger].reverse().slice(0, 10).map((entry, i) => (
                            <div key={i} style={{
                              color: entry.startsWith('+') ? '#50a050' : '#a05050',
                              marginBottom: 3,
                              wordBreak: 'break-all',
                            }}>
                              {entry}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </Page>
  )
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
      {children}
    </div>
  )
}
