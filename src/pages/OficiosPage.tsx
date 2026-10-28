import { useMemo, useState } from 'react'
import { getOficios, Receita } from '../api/site'
import { Busca, CabecalhoPagina, Carregando, Erro, useDados, useTitulo } from '../components/ui'

type Col = 'nome' | 'oficio' | 'categoria' | 'requisito'
const POR_PAGINA = 60

export default function OficiosPage() {
  useTitulo('Ofícios')
  const d = useDados(getOficios)
  const [busca, setBusca] = useState('')
  const [oficio, setOficio] = useState('')
  const [maxReq, setMaxReq] = useState(120)
  const [ordem, setOrdem] = useState<{ col: Col; asc: boolean }>({ col: 'requisito', asc: true })
  const [limite, setLimite] = useState(POR_PAGINA)

  const itens = d.dados?.itens ?? []
  const oficios = useMemo(() => Array.from(new Set(itens.map(i => i.oficio))).sort(), [itens])
  const lista = useMemo(() => {
    const t = busca.toLowerCase()
    const mat = (r: Receita) => (r.materiais ?? []).map(m => m.nome).join(' ')
    return itens
      .filter(r => !oficio || r.oficio === oficio)
      .filter(r => (r.requisito ?? 0) <= maxReq)
      .filter(r => !t || (r.nome + ' ' + (r.categoria ?? '') + ' ' + mat(r)).toLowerCase().includes(t))
      .sort((a, b) => {
        const va = a[ordem.col] ?? '', vb = b[ordem.col] ?? ''
        const c = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb))
        return ordem.asc ? c : -c
      })
  }, [itens, busca, oficio, maxReq, ordem])
  const info = oficio ? d.dados?.oficios?.[oficio] : undefined

  const Th = ({ col, children, num }: { col: Col; children: React.ReactNode; num?: boolean }) => (
    <th className={num ? 'num' : ''} aria-sort={ordem.col === col ? (ordem.asc ? 'ascending' : 'descending') : 'none'}>
      <button onClick={() => setOrdem(o => ({ col, asc: o.col === col ? !o.asc : true }))}>{children}{ordem.col === col ? (ordem.asc ? ' ▲' : ' ▼') : ''}</button>
    </th>
  )

  return (
    <div className="pagina pagina-larga">
      <CabecalhoPagina sobre="Jogador" titulo="Ofícios">
        Tudo o que se fabrica em Tybar: perícia exigida, materiais e onde fazer. Só leitura, tirado direto das tabelas do jogo.
      </CabecalhoPagina>
      {d.carregando && <Carregando />}
      {d.erro && <Erro erro={d.erro} tentar={d.carregar} />}
      {d.dados && (
        <>
          <div className="linha" style={{ marginBottom: 12 }}>
            <Busca valor={busca} mudar={v => { setBusca(v); setLimite(POR_PAGINA) }} rotulo="Buscar item ou material" />
            <label className="campo" style={{ minWidth: 180 }}><span className="sr-only">Ofício</span>
              <select className="entrada" value={oficio} onChange={e => { setOficio(e.target.value); setLimite(POR_PAGINA) }}>
                <option value="">Todos os ofícios</option>
                {oficios.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
            <label className="linha" style={{ gap: 8, fontSize: 15 }}>
              <span className="texto-2">Perícia até <b className="titulo">{maxReq}</b></span>
              <input type="range" min={0} max={120} step={5} value={maxReq} onChange={e => setMaxReq(+e.target.value)} style={{ accentColor: 'var(--ouro)' }} aria-label="Perícia máxima exigida" />
            </label>
          </div>
          {info && (
            <div className="painel painel-fino" style={{ marginBottom: 14, fontSize: 16 }}>
              <b className="titulo">{oficio}</b> · perícia {info.pericia}
              {info.chance && <div className="texto-2">Chance: {info.chance}</div>}
              {!!info.variantes?.length && <div className="texto-2">Materiais: {info.variantes.map(v => `${v.nome} (${v.requisito})`).join(' · ')}</div>}
            </div>
          )}
          <p className="discreto" aria-live="polite" style={{ marginBottom: 8 }}>{lista.length} receitas</p>
          <div className="tabela-envolve">
            <table className="tabela">
              <thead><tr><Th col="nome">Item</Th><Th col="oficio">Ofício</Th><Th col="categoria">Categoria</Th><Th col="requisito" num>Perícia</Th><th>Materiais</th><th>Onde</th></tr></thead>
              <tbody>
                {lista.slice(0, limite).map(r => (
                  <tr key={r.id}>
                    <td><b style={{ color: 'var(--pergaminho)', fontWeight: 600 }}>{r.nome}</b>{r.resultado && r.resultado > 1 ? <span className="discreto"> ×{r.resultado}</span> : null}</td>
                    <td>{r.oficio}</td>
                    <td className="texto-2">{r.categoria}</td>
                    <td className="num">{r.requisito ?? '—'}{r.pericia ? <div className="discreto">{r.pericia}</div> : null}</td>
                    <td>{(r.materiais ?? []).map(m => `${m.quantidade}× ${m.nome}`).join(', ') || '—'}</td>
                    <td className="texto-2">{r.estacao ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {lista.length > limite && <div style={{ textAlign: 'center', marginTop: 16 }}><button className="btn btn-2" onClick={() => setLimite(l => l + POR_PAGINA)}>Mostrar mais ({lista.length - limite})</button></div>}
          {!lista.length && <div className="vazio">Nada encontrado.</div>}
        </>
      )}
    </div>
  )
}
