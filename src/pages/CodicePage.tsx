import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getCapitulo, getCodice, Capitulo, CapituloResumo, msgErro } from '../api/site'
import { Busca, CabecalhoPagina, Carregando, Erro, useDados, useTitulo } from '../components/ui'

// Cache dos capítulos já lidos (para a busca no texto)
const cache = new Map<string, Capitulo>()
async function lerCapitulo(id: string) {
  if (!cache.has(id)) cache.set(id, (await getCapitulo(id)).data)
  return cache.get(id)!
}
const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const textoPuro = (html: string) => {
  const d = document.createElement('div'); d.innerHTML = html; return d.textContent ?? ''
}
// Nome de seção a partir do id quando a API não manda "secao"
const ROTULOS_SECAO: [number, string][] = [[0, 'O Mundo'], [20, 'Povos'], [29, 'Caminhos'], [40, 'Kits'], [49, 'Perícias'], [60, 'Magia']]
function secaoDe(c: CapituloResumo) {
  if (c.secao) return c.secao
  const n = parseInt(c.id, 10)
  if (isNaN(n)) return 'Capítulos'
  let r = ROTULOS_SECAO[0][1]
  for (const [lim, nome] of ROTULOS_SECAO) if (n >= lim) r = nome
  return r
}

function marcar(html: string, termo: string) {
  if (!termo) return html
  const re = new RegExp('(' + termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi')
  // só fora das tags
  return html.replace(/>([^<]+)</g, (_m, t: string) => '>' + t.replace(re, '<mark>$1</mark>') + '<')
}

export default function CodicePage() {
  const { id } = useParams()
  const [q, setQ] = useSearchParams()
  const busca = q.get('busca') ?? ''
  const navigate = useNavigate()
  const indice = useDados(getCodice)
  const [cap, setCap] = useState<Capitulo | null>(null)
  const [erroCap, setErroCap] = useState('')
  const [carregandoCap, setCarregandoCap] = useState(false)
  const [resultados, setResultados] = useState<{ c: CapituloResumo; trecho: string }[] | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [indiceFechado, setIndiceFechado] = useState(true)
  const topo = useRef<HTMLDivElement>(null)

  const lista = useMemo(() => [...(indice.dados ?? [])].sort((a, b) => a.ordem - b.ordem), [indice.dados])
  const grupos = useMemo(() => {
    const g: { secao: string; caps: CapituloResumo[] }[] = []
    for (const c of lista) {
      const s = secaoDe(c)
      const ult = g[g.length - 1]
      if (ult && ult.secao === s) ult.caps.push(c); else g.push({ secao: s, caps: [c] })
    }
    return g
  }, [lista])
  const atualId = id ?? lista[0]?.id
  const pos = lista.findIndex(c => c.id === atualId)
  useTitulo(cap?.titulo ? cap.titulo + ' · Códice' : 'Códice')

  useEffect(() => {
    if (!atualId) return
    setCarregandoCap(true); setErroCap('')
    lerCapitulo(atualId).then(setCap).catch(e => setErroCap(msgErro(e))).finally(() => setCarregandoCap(false))
    setIndiceFechado(true)
    if (id) topo.current?.scrollIntoView({ block: 'start' })
  }, [atualId, id])

  // Busca: títulos na hora; no texto, lê os capítulos (uma vez só, depois fica em cache)
  useEffect(() => {
    const t = semAcento(busca.trim())
    if (t.length < 3 || !lista.length) { setResultados(null); return }
    let vivo = true
    setBuscando(true)
    const tm = setTimeout(async () => {
      const out: { c: CapituloResumo; trecho: string }[] = []
      await Promise.all(lista.map(c => lerCapitulo(c.id).catch(() => null)))
      for (const c of lista) {
        const cp = cache.get(c.id)
        const txt = cp ? textoPuro(cp.html) : ''
        const i = semAcento(txt).indexOf(t)
        if (semAcento(c.titulo).includes(t) || i >= 0) {
          const ini = Math.max(0, i - 70)
          out.push({ c, trecho: i >= 0 ? (ini > 0 ? '…' : '') + txt.slice(ini, i + t.length + 110) + '…' : '' })
        }
      }
      if (vivo) { setResultados(out); setBuscando(false) }
    }, 250)
    return () => { vivo = false; clearTimeout(tm) }
  }, [busca, lista])

  const termoBusca = busca.trim().length >= 3 ? busca.trim() : ''

  return (
    <div className="pagina pagina-larga" ref={topo}>
      <CabecalhoPagina sobre="O livro do mundo" titulo="Códice de Tybar">
        Tudo o que o manual do jogo ensina, na íntegra: o mundo, os povos, os caminhos, os kits, as perícias e a magia.
      </CabecalhoPagina>
      {indice.erro && <Erro erro={indice.erro} tentar={indice.carregar} />}
      {indice.carregando && <Carregando />}
      {!!lista.length && (
        <div className="codice">
          <aside className="painel painel-fino codice-indice" data-fechado={indiceFechado} aria-label="Índice do Códice">
            <Busca valor={busca} mudar={v => setQ(v ? { busca: v } : {}, { replace: true })} rotulo="Buscar no Códice" placeholder="Buscar (3 letras ou mais)…" />
            <button className="btn btn-2 btn-p menu-indice" style={{ width: '100%', marginTop: 10 }} aria-expanded={!indiceFechado} onClick={() => setIndiceFechado(f => !f)}>
              {indiceFechado ? 'Mostrar índice' : 'Esconder índice'}
            </button>
            <div className="codice-lista">
              {grupos.map(g => (
                <div key={g.secao}>
                  <h4>{g.secao}</h4>
                  <ul>
                    {g.caps.map(c => (
                      <li key={c.id}><Link to={'/codice/' + c.id} className={c.id === atualId ? 'ativo' : ''} aria-current={c.id === atualId ? 'page' : undefined}>{c.titulo}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </aside>

          <div>
            {busca.trim().length >= 3 && (
              <section className="painel" style={{ marginBottom: 20, padding: 0 }} aria-live="polite">
                <div className="linha linha-entre" style={{ padding: '12px 16px' }}>
                  <strong className="titulo" style={{ fontSize: 15 }}>{buscando ? 'Procurando…' : `${resultados?.length ?? 0} capítulo(s) com “${busca.trim()}”`}</strong>
                  <button className="btn-link" onClick={() => setQ({}, { replace: true })}>Limpar busca</button>
                </div>
                {resultados?.map(r => (
                  <Link key={r.c.id} className="resultado-busca" to={'/codice/' + r.c.id + '?busca=' + encodeURIComponent(busca)}>
                    <strong>{r.c.titulo}</strong>
                    {r.trecho && <span dangerouslySetInnerHTML={{ __html: marcar('>' + r.trecho.replace(/</g, '&lt;') + '<', termoBusca).slice(1, -1) }} />}
                  </Link>
                ))}
              </section>
            )}
            {carregandoCap && <Carregando texto="Virando as páginas…" />}
            {erroCap && <Erro erro={erroCap} />}
            {cap && !carregandoCap && (
              <article className="pergaminho">
                {cap.secao && <div className="sobretitulo" style={{ textAlign: 'center', color: '#8a5a22' }}>{cap.secao}</div>}
                <h1>{cap.titulo}</h1>
                {/* O HTML vem do servidor (convertido dos capítulos do jogo) */}
                <div dangerouslySetInnerHTML={{ __html: marcar(cap.html, termoBusca) }} />
              </article>
            )}
            {pos >= 0 && (
              <nav className="codice-nav" aria-label="Capítulos vizinhos">
                {pos > 0 ? <button className="btn btn-2" onClick={() => navigate('/codice/' + lista[pos - 1].id)}>← {lista[pos - 1].titulo}</button> : <span />}
                {pos < lista.length - 1 && <button className="btn btn-2" onClick={() => navigate('/codice/' + lista[pos + 1].id)}>{lista[pos + 1].titulo} →</button>}
              </nav>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
