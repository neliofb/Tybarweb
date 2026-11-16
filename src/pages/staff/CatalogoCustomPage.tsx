import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import semArteLista from './semArteNoPatch.json'
import { Busca, CabecalhoPagina, Carregando, Erro, Modal, useTitulo } from '../../components/ui'

// Catalogo de conteudo custom recebido de outros shards (staff). Os dados e as miniaturas NAO entram no build:
// ficam numa pasta servida a parte (dev: plugin do vite.config; casa: Caddy em /catalogo-custom/).
const BASE = (import.meta.env.VITE_CATALOGO_URL as string | undefined) || '/catalogo-custom'
const CEL = 80, COLS = 12, POR_PAGINA = 120

const CATS: { id: string; nome: string; desc: string }[] = [
  { id: 'itens', nome: 'Itens', desc: 'Arte de item (art). "Vestível" = tem animação no corpo.' },
  { id: 'terrenos', nome: 'Terrenos', desc: 'Tiles de chão (art 0x0000–0x3FFF).' },
  { id: 'gumps', nome: 'Gumps de interface', desc: 'Gumps abaixo de 50000.' },
  { id: 'paperdoll', nome: 'Roupas/equip paperdoll', desc: 'Gumps 50000+ (masc.) e 60000+ (fem.).' },
  { id: 'cabelos', nome: 'Cabelos/barbas', desc: 'Gumps de paperdoll de itens nas camadas de cabelo e barba.' },
  { id: 'monstros', nome: 'Monstros/criaturas', desc: 'Animação: 1 quadro + andando (clique).' },
  { id: 'montarias', nome: 'Animais/montarias', desc: 'Corpos de animal (65 grupos / ANIMAL). Não dá para saber pelos arquivos quais são montáveis.' },
  { id: 'roupas_anim', nome: 'Roupas animadas no corpo', desc: 'Corpos humanos/equipamento (175 grupos).' },
  { id: 'multis', nome: 'Multis', desc: 'Casas, navios e construções montadas com a arte do patch.' },
  { id: 'hues', nome: 'Hues', desc: 'Cores do hues.mul diferentes do vanilla.' },
  { id: 'outros', nome: 'Outros', desc: 'Imagens soltas sem ID no nome.' },
]

interface Dados { campos: string[]; folhas: string[]; origens: string[]; linhas: unknown[][] }
interface Entrada {
  id: number | string; o: string; n: string; st: string; ty: number; f: string; c: number; w: number; h: number
  a?: string; arq?: string; corpos?: number[]; x?: string; v?: number; an?: number; sexo?: string; solto?: number; cat: string
}

const hex = (id: number | string, cat: string) => typeof id !== 'number' ? String(id)
  : (cat === 'hues' || ANIM.has(cat)) ? `${id}` : '0x' + id.toString(16).toUpperCase().padStart(4, '0')
const ANIM = new Set(['monstros', 'montarias', 'roupas_anim'])
const chave = (e: Entrada) => `${e.cat}|${e.o}|${e.arq ?? ''}|${e.id}|${e.f}|${e.c}`
// vestiveis importados sem paperdoll proprio no patch (16/11/2026): retirados do jogo (Data/Tybar/CatalogoSemArte.txt)
const SEM_ARTE = new Set<string>(semArteLista as string[])
const ST: Record<string, string> = { n: 'novo', s: 'substitui vanilla', '?': 'sem comparação' }
const ST_DICA: Record<string, string> = {
  n: 'Novo: não existia no UO vanilla.',
  s: 'Substitui vanilla: o patch de origem redesenhou um ID original do UO.',
  '?': 'Sem comparação: arquivo solto, sem ID conhecido.',
}
const TY = ['', 'já no Tybar', 'ID ocupado no Tybar']

// Os arquivos do catalogo sao protegidos pelo Caddy: ele confere este cookie (copia do token do login) na mini-API da casa.
function cookieDoLogin() {
  const t = localStorage.getItem('token')
  if (t) document.cookie = `tybar_cat=${encodeURIComponent(t)}; Path=/catalogo-custom; Max-Age=86400; SameSite=Strict${location.protocol === 'https:' ? '; Secure' : ''}`
}
cookieDoLogin()

function Miniatura({ e, zoom = 1 }: { e: Entrada; zoom?: number }) {
  const x = (e.c % COLS) * CEL, y = Math.floor(e.c / COLS) * CEL
  return <div role="img" aria-label={hex(e.id, e.cat)} style={{
    width: CEL * zoom, height: CEL * zoom, backgroundImage: `url(${BASE}/folhas/${e.f})`,
    backgroundPosition: `-${x * zoom}px -${y * zoom}px`, backgroundSize: zoom === 1 ? undefined : `${CEL * COLS * zoom}px auto`,
    imageRendering: 'pixelated', backgroundColor: 'rgba(0,0,0,.25)', borderRadius: 4,
  }} />
}

export default function CatalogoCustomPage() {
  useTitulo('Catálogo custom (staff)')
  const [params, setParams] = useSearchParams()
  const cat = params.get('cat') || 'itens'
  const [dados, setDados] = useState<Entrada[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [resumo, setResumo] = useState<Record<string, number>>({})
  const [busca, setBusca] = useState(''), [origem, setOrigem] = useState(''), [status, setStatus] = useState('')
  const [tybar, setTybar] = useState('todos'), [vest, setVest] = useState(false), [soSemArte, setSoSemArte] = useState(false)
  const [pag, setPag] = useState(0)
  const [aberta, setAberta] = useState<Entrada | null>(null)
  useEffect(() => { fetch(`${BASE}/dados/resumo.json`).then(r => r.json()).then(setResumo).catch(() => {}) }, [])
  useEffect(() => {
    setDados(null); setErro(null); setPag(0)
    fetch(`${BASE}/dados/${cat}.json`).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json() }).then((d: Dados) => {
      setDados(d.linhas.map(l => {
        const e: Record<string, unknown> = { cat }
        d.campos.forEach((c, i) => { if (l[i] !== null && l[i] !== undefined) e[c] = l[i] })
        e.f = d.folhas[e.f as number]; e.o = d.origens[e.o as number]
        return e as unknown as Entrada
      }))
    }).catch(e => setErro(`Não carregou ${BASE}/dados/${cat}.json (${e.message}). A pasta do catálogo está sendo servida?`))
  }, [cat])
  useEffect(() => setPag(0), [busca, origem, status, tybar, vest, soSemArte])

  const origens = useMemo(() => [...new Set((dados || []).map(e => e.o))].sort(), [dados])
  const visiveis = useMemo(() => {
    if (!dados) return []
    const q = busca.trim().toLowerCase()
    const qn = q.startsWith('0x') ? parseInt(q, 16) : /^\d+$/.test(q) ? parseInt(q, 10) : NaN
    return dados.filter(e =>
      (!origem || e.o === origem) && (!status || e.st === status) &&
      (tybar === 'todos' || (tybar === 'esconder' ? e.ty !== 1 : e.ty === 1)) &&
      (!vest || e.v) && (!soSemArte || SEM_ARTE.has(chave(e))) &&
      (!q || e.id === qn || (e.corpos || []).includes(qn) || hex(e.id, cat).toLowerCase().includes(q) || (e.n || '').toLowerCase().includes(q)))
  }, [dados, busca, origem, status, tybar, vest, soSemArte, cat])
  const paginas = Math.max(1, Math.ceil(visiveis.length / POR_PAGINA))
  const pagina = visiveis.slice(pag * POR_PAGINA, (pag + 1) * POR_PAGINA)
  const info = CATS.find(c => c.id === cat)
  return (
    <div className="pagina">
      <CabecalhoPagina sobre="Staff" titulo="Catálogo de conteúdo custom">
        Arte de outros shards (só o que não é vanilla). Conteúdo de terceiros, alguns com licença que proíbe repassar: só para a staff, não divulgue.
      </CabecalhoPagina>
      <div className="painel painel-fino" style={{ margin: '8px 0', fontSize: 14 }}>
        <strong>Só consulta:</strong> os itens bons dos patches já foram inseridos direto no jogo (painel <code>[itenscatalogo</code>). A seleção/importação pelo site foi encerrada em 16/11/2026.
      </div>
      <nav className="linha" style={{ gap: 6, flexWrap: 'wrap', margin: '8px 0' }} aria-label="Categorias">
        {CATS.map(c => (
          <button key={c.id} className={'btn btn-2' + (c.id === cat ? '' : ' btn-p')} aria-current={c.id === cat ? 'page' : undefined}
            onClick={() => setParams({ cat: c.id })}>
            {c.nome}{resumo[c.id] !== undefined ? ` (${resumo[c.id].toLocaleString('pt-BR')})` : ''}
          </button>
        ))}
      </nav>
      {info && <p className="discreto" style={{ margin: '4px 0 10px' }}>{info.desc}</p>}
      <div className="linha" style={{ display: 'flex', gap: 10, margin: '10px 0', flexWrap: 'wrap', alignItems: 'center' }}>
        <Busca valor={busca} mudar={setBusca} rotulo="Buscar" placeholder="ID (0x1F2C ou decimal), corpo ou nome" />
        <select className="entrada" style={{ width: 'auto' }} value={origem} onChange={e => setOrigem(e.target.value)} aria-label="Origem">
          <option value="">Todas as origens</option>{origens.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <select className="entrada" style={{ width: 'auto' }} value={status} onChange={e => setStatus(e.target.value)} aria-label="Status">
          <option value="">Novo e substitui</option><option value="n">Só novos</option><option value="s">Só substitui vanilla</option><option value="?">Sem comparação</option>
        </select>
        <select className="entrada" style={{ width: 'auto' }} value={tybar} onChange={e => setTybar(e.target.value)} aria-label="Tybar">
          <option value="esconder">Esconder o que já está no Tybar</option><option value="todos">Mostrar tudo</option><option value="so">Só o que já está no Tybar</option>
        </select>
        {cat === 'itens' && <label><input type="checkbox" checked={vest} onChange={e => setVest(e.target.checked)} /> só vestíveis</label>}
        {cat === 'itens' && <label title="Vestíveis importados que não têm paperdoll próprio no patch: retirados do jogo"><input type="checkbox" checked={soSemArte} onChange={e => { setSoSemArte(e.target.checked); if (e.target.checked) setTybar('todos') }} /> só “sem arte no patch” ({SEM_ARTE.size})</label>}
        <span className="discreto">{visiveis.length.toLocaleString('pt-BR')} nesta categoria</span>
      </div>
      {erro ? <Erro erro={erro} tentar={() => setParams({ cat })} /> : !dados ? <Carregando /> : (<>
        <Paginas pag={pag} total={paginas} mudar={setPag} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
          {pagina.map(e => {
            const k = chave(e)
            return (
              <div key={k} className="painel painel-fino" style={{ padding: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textAlign: 'center' }}>
                <button onClick={() => setAberta(e)} title="Ampliar" style={{ background: 'none', border: 0, padding: 0, cursor: 'zoom-in' }}><Miniatura e={e} /></button>
                <strong style={{ fontSize: 13 }}>{hex(e.id, cat)}{e.arq ? <span className="discreto"> · {e.arq}</span> : null}</strong>
                {e.corpos && e.corpos.length > 0 && <span className="discreto" style={{ fontSize: 11 }}>corpo {e.corpos.slice(0, 3).join(', ')}</span>}
                {e.n && <span style={{ fontSize: 11, lineHeight: 1.2, wordBreak: 'break-word' }}>{e.n.length > 60 ? e.n.slice(0, 60) + '…' : e.n}</span>}
                <span className="discreto" style={{ fontSize: 11 }}>{e.o}</span>
                <span style={{ fontSize: 11 }}>
                  <span className={'selo ' + (e.st === 's' ? 'selo-pendente' : '')} title={ST_DICA[e.st]}>{ST[e.st] || e.st}</span>
                  {e.ty ? <> <span className="selo">{TY[e.ty]}</span></> : null}
                </span>
                {SEM_ARTE.has(k) && <span className="selo" title="Vestível sem paperdoll próprio no patch: retirado do jogo (não é mais criado)" style={{ fontSize: 11, background: '#b3261e', color: '#fff' }}>sem arte no patch</span>}
              </div>
            )
          })}
        </div>
        <Paginas pag={pag} total={paginas} mudar={setPag} />
      </>)}
      {aberta && (
        <Modal titulo={`${info?.nome} ${hex(aberta.id, cat)}`} aberto fechar={() => setAberta(null)}>
          <div className="linha" style={{ gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <Miniatura e={aberta} zoom={3} />
            {aberta.a && <img src={`${BASE}/${aberta.a}`} alt="andando" style={{ imageRendering: 'pixelated', minWidth: 160, background: 'rgba(0,0,0,.25)', borderRadius: 4 }} />}
          </div>
          <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2px 12px', marginTop: 12, fontSize: 14 }}>
            <dt>ID</dt><dd>{hex(aberta.id, cat)}{typeof aberta.id === 'number' ? ` (${aberta.id})` : ''}</dd>
            <dt>Origem</dt><dd>{aberta.o}{aberta.arq ? ` · ${aberta.arq}` : ''}</dd>
            {aberta.corpos && <><dt>Corpos</dt><dd>{aberta.corpos.join(', ') || '—'}</dd></>}
            {aberta.n && <><dt>Nome/nota</dt><dd>{aberta.n}</dd></>}
            <dt>Tamanho</dt><dd>{aberta.w}×{aberta.h}</dd>
            <dt>Situação</dt><dd>{SEM_ARTE.has(chave(aberta)) && <><strong style={{ color: '#d93025' }}>Sem arte no patch: retirado do jogo.</strong><br /></>}{ST[aberta.st] || aberta.st}{aberta.ty ? ` · ${TY[aberta.ty]}` : ''}<br /><span className="discreto">{ST_DICA[aberta.st]}</span></dd>
            {aberta.an !== undefined && <><dt>Animação</dt><dd>{aberta.an}{aberta.sexo ? ` (${aberta.sexo})` : ''}</dd></>}
            {aberta.x && <><dt>Obs.</dt><dd>{aberta.x}</dd></>}
          </dl>
        </Modal>
      )}
    </div>
  )
}

function Paginas({ pag, total, mudar }: { pag: number; total: number; mudar: (p: number) => void }) {
  if (total <= 1) return null
  return (
    <div className="linha" style={{ gap: 6, justifyContent: 'center', margin: '10px 0', alignItems: 'center' }}>
      <button className="btn btn-2 btn-p" disabled={pag === 0} onClick={() => mudar(0)}>«</button>
      <button className="btn btn-2 btn-p" disabled={pag === 0} onClick={() => mudar(pag - 1)}>‹ Anterior</button>
      <span>Página <input className="entrada" type="number" min={1} max={total} value={pag + 1} style={{ width: 70 }}
        onChange={e => { const v = parseInt(e.target.value, 10); if (v >= 1 && v <= total) mudar(v - 1) }} aria-label="Página" /> de {total}</span>
      <button className="btn btn-2 btn-p" disabled={pag >= total - 1} onClick={() => mudar(pag + 1)}>Próxima ›</button>
      <button className="btn btn-2 btn-p" disabled={pag >= total - 1} onClick={() => mudar(total - 1)}>»</button>
    </div>
  )
}
