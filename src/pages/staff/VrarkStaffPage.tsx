import { useEffect, useMemo, useState } from 'react'
import { getVrark, salvarVrark } from '../../api/vrark'
import { msgErro } from '../../api/site'
import { Busca, CabecalhoPagina, Carregando, Erro, useDados, useTitulo } from '../../components/ui'
import { ComoUsar } from '../../components/LootUi'
import lista from '../../data/vrark.json'
import links from '../../data/vrark-links.json'

// corpo -> link da entrada original no Vrark Art
const LINKS = links as Record<string, string>

// [corpo, nome, tipo (H monstro, L animal), grande (1 = vai no anim2.mul)]
const TODAS = lista as [number, string, 'H' | 'L', number][]
type Filtro = 'todos' | 'H' | 'L' | 'marcados'

export default function VrarkStaffPage() {
  useTitulo('Animações Vrark (staff)')
  const d = useDados(getVrark)
  const [sel, setSel] = useState<Set<number>>(new Set())
  const [busca, setBusca] = useState(''), [filtro, setFiltro] = useState<Filtro>('todos')
  const [sujo, setSujo] = useState(false), [salvando, setSalvando] = useState(false)
  const [aberta, setAberta] = useState<[number, string, 'H' | 'L', number] | null>(null)
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null)

  useEffect(() => { if (d.dados) { setSel(new Set(d.dados.selecionadas)); setSujo(false) } }, [d.dados])

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return TODAS.filter(([c, n, t]) =>
      (filtro === 'todos' || (filtro === 'marcados' ? sel.has(c) : filtro === t)) && (!q || n.toLowerCase().includes(q) || String(c) === q))
  }, [busca, filtro, sel])

  const alternar = (c: number) => { setSel(s => { const n = new Set(s); n.has(c) ? n.delete(c) : n.add(c); return n }); setSujo(true); setAviso(null) }
  const marcarVisiveis = (v: boolean) => { setSel(s => { const n = new Set(s); visiveis.forEach(([c]) => v ? n.add(c) : n.delete(c)); return n }); setSujo(true); setAviso(null) }
  const salvar = async () => {
    setSalvando(true); setAviso(null)
    try {
      const r = await salvarVrark([...sel].sort((a, b) => a - b))
      setSel(new Set(r.data.selecionadas)); setSujo(false)
      setAviso({ ok: true, texto: 'Salvo. Vale no jogo depois de aplicar a seleção e reiniciar (o "Publicar Tybar" faz isso).' })
    } catch (e) { setAviso({ ok: false, texto: msgErro(e) }) } finally { setSalvando(false) }
  }

  if (d.carregando) return <Carregando />
  if (d.erro || !d.dados) return <Erro erro={d.erro || 'Sem dados.'} tentar={d.carregar} />

  return (
    <div>
      <CabecalhoPagina sobre="Staff" titulo="Animações Vrark">Criaturas da Vrark Art prontas para o cliente. Marque as que o servidor deve usar.</CabecalhoPagina>
      <ComoUsar>
        <ol>
          <li><strong>Buscar / filtrar:</strong> pelo nome ou número do corpo; H são monstros, L são animais, “Marcados” mostra só as escolhidas.</li>
          <li><strong>Usar no servidor:</strong> marque a caixa de cada criatura (ou “Marcar visíveis” para o filtro atual).</li>
          <li><strong>Salvar:</strong> grava a lista com backup e histórico. Só entra no jogo quando o “Publicar Tybar” aplicar a seleção no pacote e o servidor reiniciar.</li>
          <li><strong>Corpo:</strong> é o número para usar no jogo (<code>[add</code> / BaseSoundID / Body). “Grande” = animação pesada, vai em arquivo à parte, sem diferença para você.</li>
        </ol>
      </ComoUsar>
      <div className="linha" style={{ gap: 10, margin: '10px 0', flexWrap: 'wrap' }}>
        <Busca valor={busca} mudar={setBusca} rotulo="Buscar animação" placeholder="Nome ou corpo" />
        <select className="entrada" value={filtro} onChange={e => setFiltro(e.target.value as Filtro)} aria-label="Tipo">
          <option value="todos">Todos os tipos</option><option value="H">H (monstros)</option><option value="L">L (animais)</option><option value="marcados">Só marcados</option>
        </select>
        <span className="discreto">{visiveis.length} de {TODAS.length} · {sel.size} marcadas</span>
        <button className="btn btn-2 btn-p" onClick={() => marcarVisiveis(true)}>Marcar visíveis</button>
        <button className="btn btn-2 btn-p" onClick={() => marcarVisiveis(false)}>Desmarcar visíveis</button>
        {sujo && <span className="selo selo-pendente">Alterações não salvas</span>}
        <button className="btn" onClick={salvar} disabled={salvando || !sujo}>{salvando ? 'Salvando…' : 'Salvar'}</button>
      </div>
      {aviso && <div className={'aviso ' + (aviso.ok ? 'aviso-ok' : 'aviso-erro')} role={aviso.ok ? 'status' : 'alert'} style={{ marginBottom: 10 }}>{aviso.texto}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
        {visiveis.map(([c, n, t, g]) => (
          <label key={c} className="painel painel-fino" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 8, cursor: 'pointer', textAlign: 'center', outline: sel.has(c) ? '2px solid var(--ouro, #c9a227)' : 'none' }}>
            <img src={`/media/vrark/${c}.webp`} alt={n} loading="lazy" width={150} height={150} title="Clique para ampliar" onClick={e => { e.preventDefault(); setAberta([c, n, t, g]) }} style={{ objectFit: 'contain', imageRendering: 'pixelated', cursor: 'zoom-in' }} />
            <strong style={{ fontSize: 13, lineHeight: 1.2 }}>{n}</strong>
            <span className="discreto" style={{ fontSize: 12 }}>corpo {c} · {t === 'H' ? 'monstro' : 'animal'}{g ? ' · grande' : ''}</span>
            <span><input type="checkbox" checked={sel.has(c)} onChange={() => alternar(c)} /> usar no servidor</span>
          </label>
        ))}
      </div>
      {aberta && (
        <div role="dialog" aria-modal="true" aria-label={aberta[1]} onClick={() => setAberta(null)} onKeyDown={e => e.key === 'Escape' && setAberta(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="painel" onClick={e => e.stopPropagation()} style={{ padding: 16, textAlign: 'center', maxWidth: 560, width: '100%' }}>
            <img src={`/media/vrark/grande/${aberta[0]}.webp`} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = `/media/vrark/${aberta[0]}.webp` }}
              alt={aberta[1]} style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', imageRendering: 'pixelated', background: '#111' }} />
            <h3 style={{ margin: '8px 0 2px' }}>{aberta[1]}</h3>
            <p className="discreto">corpo {aberta[0]} · slot {aberta[2]} ({aberta[2] === 'H' ? 'monstro' : 'animal'}){aberta[3] ? ' · grande' : ''}</p>
            <div className="linha" style={{ gap: 10, justifyContent: 'center' }}>
              {LINKS[aberta[0]] && <a className="btn btn-2" href={LINKS[aberta[0]]} target="_blank" rel="noopener noreferrer">Ver no Vrark Art</a>}
              <button className="btn" autoFocus onClick={() => setAberta(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
