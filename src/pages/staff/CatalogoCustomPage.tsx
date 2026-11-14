import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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
const ST: Record<string, string> = { n: 'novo', s: 'substitui vanilla', '?': 'sem comparação' }
const ST_DICA: Record<string, string> = {
  n: 'Novo: não existe no jogo. Entra com um ID livre (se o ID estiver ocupado no Tybar, ganha outro e o ID final fica registrado).',
  s: 'Substitui vanilla: já existe um item/animação original do UO com este ID e o desenho dele será TROCADO por este (afeta tudo no jogo que usa esse ID).',
  '?': 'Sem comparação: arquivo solto, sem ID conhecido. Ainda não entra automaticamente.',
}
const TY = ['', 'já no Tybar', 'ID ocupado no Tybar']

type Marcada = Entrada & { quem?: string; quando?: string }
const API_SEL = BASE + '/api/selecao'
function lerAntiga(): Record<string, Entrada> {
  try { return JSON.parse(localStorage.getItem('catalogo-custom-sel') || '{}') } catch { return {} }
}
// Os arquivos do catalogo sao protegidos pelo Caddy: ele confere este cookie (copia do token do login) na mini-API da casa.
function cookieDoLogin() {
  const t = localStorage.getItem('token')
  if (t) document.cookie = `tybar_cat=${encodeURIComponent(t)}; Path=/catalogo-custom; Max-Age=86400; SameSite=Strict${location.protocol === 'https:' ? '; Secure' : ''}`
}
cookieDoLogin()
async function chamarSel(corpo?: unknown): Promise<Record<string, Marcada>> {
  cookieDoLogin()
  const t = localStorage.getItem('token')
  const r = await fetch(API_SEL, {
    method: corpo ? 'POST' : 'GET', credentials: 'same-origin',
    headers: { ...(t ? { Authorization: `Bearer ${t}` } : {}), ...(corpo ? { 'Content-Type': 'application/json' } : {}) },
    body: corpo ? JSON.stringify(corpo) : undefined,
  })
  if (!r.ok) throw new Error(r.status === 401 ? 'faça login de novo' : r.status === 403 ? 'só staff' : 'HTTP ' + r.status)
  return ((await r.json()).itens || {}) as Record<string, Marcada>
}

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
  const [tybar, setTybar] = useState('esconder'), [vest, setVest] = useState(false), [soMarc, setSoMarc] = useState(false)
  const [pag, setPag] = useState(0)
  // salvas: o que esta no servidor (todos da staff veem); mudancas: o que este navegador marcou/desmarcou e ainda nao salvou
  const [salvas, setSalvas] = useState<Record<string, Marcada>>({})
  const [mudancas, setMudancas] = useState<Record<string, Entrada | null>>(() => lerAntiga())
  const [msgSel, setMsgSel] = useState<string | null>(null), [salvando, setSalvando] = useState(false)
  const sel = useMemo(() => {
    const n: Record<string, Marcada> = { ...salvas }
    for (const [k, v] of Object.entries(mudancas)) { if (v) n[k] = n[k] || v; else delete n[k] }
    return n
  }, [salvas, mudancas])
  const nMud = Object.keys(mudancas).length
  const [aberta, setAberta] = useState<Entrada | null>(null)
  const [exportar, setExportar] = useState<'json' | 'csv' | null>(null)

  useEffect(() => { chamarSel().then(setSalvas).catch(e => setMsgSel('Não carregou a seleção salva (' + e.message + ').')) }, [])
  const salvar = async () => {
    setSalvando(true); setMsgSel(null)
    const marcar = Object.entries(mudancas).filter(([, v]) => v).map(([k, v]) => ({ ...v, chave: k }))
    const desmarcar = Object.entries(mudancas).filter(([, v]) => !v).map(([k]) => k)
    try {
      setSalvas(await chamarSel({ marcar, desmarcar })); setMudancas({})
      try { localStorage.removeItem('catalogo-custom-sel') } catch { /* sem armazenamento */ }
      setMsgSel('Salvo no servidor. Entra no jogo no próximo "Publicar Tybar".')
    } catch (e) { setMsgSel('Não salvou: ' + (e as Error).message) }
    setSalvando(false)
  }
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
  useEffect(() => setPag(0), [busca, origem, status, tybar, vest, soMarc])

  const origens = useMemo(() => [...new Set((dados || []).map(e => e.o))].sort(), [dados])
  const visiveis = useMemo(() => {
    if (!dados) return []
    const q = busca.trim().toLowerCase()
    const qn = q.startsWith('0x') ? parseInt(q, 16) : /^\d+$/.test(q) ? parseInt(q, 10) : NaN
    return dados.filter(e =>
      (!origem || e.o === origem) && (!status || e.st === status) &&
      (tybar === 'todos' || (tybar === 'esconder' ? e.ty !== 1 : e.ty === 1)) &&
      (!vest || e.v) && (!soMarc || sel[chave(e)]) &&
      (!q || e.id === qn || (e.corpos || []).includes(qn) || hex(e.id, cat).toLowerCase().includes(q) || (e.n || '').toLowerCase().includes(q)))
  }, [dados, busca, origem, status, tybar, vest, soMarc, sel, cat])
  const paginas = Math.max(1, Math.ceil(visiveis.length / POR_PAGINA))
  const pagina = visiveis.slice(pag * POR_PAGINA, (pag + 1) * POR_PAGINA)
  const nSel = Object.keys(sel).length

  // marcar/desmarcar so mexe nas mudancas; se voltar ao estado salvo, a mudanca some
  const definir = (n: Record<string, Entrada | null>, e: Entrada, v: boolean) => {
    const k = chave(e)
    if (!!salvas[k] === v) delete n[k]; else n[k] = v ? e : null
  }
  const alternar = (e: Entrada) => setMudancas(m => { const n = { ...m }; definir(n, e, !sel[chave(e)]); return n })
  const marcarPagina = (v: boolean) => setMudancas(m => { const n = { ...m }; pagina.forEach(e => definir(n, e, v)); return n })

  const lista = Object.values(sel).map(e => ({
    categoria: e.cat, id: typeof e.id === 'number' ? hex(e.id, e.cat) : e.id, id_decimal: typeof e.id === 'number' ? e.id : null,
    origem: e.o, arquivo: e.arq ?? null, corpos: e.corpos ?? null, nome: e.n || '', status: ST[e.st] || e.st, tybar: TY[e.ty] || '',
  }))
  const textoExport = exportar === 'json' ? JSON.stringify(lista, null, 1)
    : ['categoria;id;id_decimal;origem;arquivo;corpos;nome;status;tybar', ...lista.map(l =>
      [l.categoria, l.id, l.id_decimal ?? '', l.origem, l.arquivo ?? '', (l.corpos || []).join(' '), l.nome.replace(/;/g, ','), l.status, l.tybar].join(';'))].join('\n')
  const baixar = () => {
    const b = new Blob([textoExport], { type: exportar === 'json' ? 'application/json' : 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'catalogo_custom_escolhidos.' + exportar; a.click()
  }

  const info = CATS.find(c => c.id === cat)
  return (
    <div className="pagina">
      <CabecalhoPagina sobre="Staff" titulo="Catálogo de conteúdo custom">
        Arte de outros shards (só o que não é vanilla). Conteúdo de terceiros, alguns com licença que proíbe repassar: só para a staff, não divulgue.
      </CabecalhoPagina>
      <div className="painel painel-fino" style={{ margin: '8px 0', fontSize: 14 }}>
        <strong>Como usar:</strong> 1) marque <em>trazer</em> no que vale a pena; 2) clique em <strong>Salvar no servidor</strong>
        (a marcação fica com seu nome e a data, e toda a staff vê); 3) entra no jogo no próximo <strong>Publicar Tybar</strong> do dono,
        que importa sozinho o que foi marcado e ainda não foi importado.
        <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
          <li><strong>Novo</strong> = item/animação que não existe no jogo; entra com um ID livre (se o ID dele já estiver ocupado no Tybar, ganha outro e o ID final fica registrado).</li>
          <li><strong>Substitui vanilla</strong> = já existe um item/animação original do UO com esse ID e o desenho dele será <strong>TROCADO</strong> por este. Afeta tudo no jogo que usa esse ID.</li>
          <li><strong>Já no Tybar</strong> = já temos; não precisa marcar.</li>
        </ul>
        <p className="discreto" style={{ margin: '6px 0 0' }}>Importação automática hoje: itens, gumps, paperdoll, cabelos/barbas e hues. Terrenos, animações, multis e “outros” podem ser marcados, mas ainda entram à mão (o Publicar avisa).</p>
      </div>
      <nav className="linha" style={{ gap: 6, flexWrap: 'wrap', margin: '8px 0' }} aria-label="Categorias">
        {CATS.map(c => (
          <button key={c.id} className={'btn btn-2' + (c.id === cat ? '' : ' btn-p')} aria-current={c.id === cat ? 'page' : undefined}
            onClick={() => { setParams({ cat: c.id }); setSoMarc(false) }}>
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
        <label><input type="checkbox" checked={soMarc} onChange={e => setSoMarc(e.target.checked)} /> só marcados</label>
      </div>
      <div className="linha" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
        <span className="discreto">{visiveis.length.toLocaleString('pt-BR')} nesta categoria · {nSel} marcados no total</span>
        <button className="btn" disabled={!nMud || salvando} onClick={salvar}>{salvando ? 'Salvando…' : `Salvar no servidor${nMud ? ` (${nMud} alteraç${nMud === 1 ? 'ão' : 'ões'})` : ''}`}</button>
        {nMud > 0 && <button className="btn btn-2 btn-p" onClick={() => setMudancas({})}>Desfazer alterações</button>}
        {msgSel && <span role="status" style={{ fontSize: 13 }}>{msgSel}</span>}
        <button className="btn btn-2 btn-p" onClick={() => marcarPagina(true)}>Marcar página</button>
        <button className="btn btn-2 btn-p" onClick={() => marcarPagina(false)}>Desmarcar página</button>
        <button className="btn btn-2" disabled={!nSel} onClick={() => setExportar('json')}>Exportar JSON</button>
        <button className="btn btn-2" disabled={!nSel} onClick={() => setExportar('csv')}>Exportar CSV</button>
      </div>
      {erro ? <Erro erro={erro} tentar={() => setParams({ cat })} /> : !dados ? <Carregando /> : (<>
        <Paginas pag={pag} total={paginas} mudar={setPag} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
          {pagina.map(e => {
            const k = chave(e), m = !!sel[k]
            return (
              <div key={k} className="painel painel-fino" style={{ padding: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textAlign: 'center', outline: m ? '2px solid var(--ouro, #c9a227)' : 'none' }}>
                <button onClick={() => setAberta(e)} title="Ampliar" style={{ background: 'none', border: 0, padding: 0, cursor: 'zoom-in' }}><Miniatura e={e} /></button>
                <strong style={{ fontSize: 13 }}>{hex(e.id, cat)}{e.arq ? <span className="discreto"> · {e.arq}</span> : null}</strong>
                {e.corpos && e.corpos.length > 0 && <span className="discreto" style={{ fontSize: 11 }}>corpo {e.corpos.slice(0, 3).join(', ')}</span>}
                {e.n && <span style={{ fontSize: 11, lineHeight: 1.2, wordBreak: 'break-word' }}>{e.n.length > 60 ? e.n.slice(0, 60) + '…' : e.n}</span>}
                <span className="discreto" style={{ fontSize: 11 }}>{e.o}</span>
                <span style={{ fontSize: 11 }}>
                  <span className={'selo ' + (e.st === 's' ? 'selo-pendente' : '')} title={ST_DICA[e.st]}>{ST[e.st] || e.st}</span>
                  {e.ty ? <> <span className="selo">{TY[e.ty]}</span></> : null}
                </span>
                <label style={{ fontSize: 12 }}><input type="checkbox" checked={m} onChange={() => alternar(e)} /> trazer{k in mudancas ? ' *' : ''}</label>
                {salvas[k]?.quem && <span className="discreto" style={{ fontSize: 10 }}>por {salvas[k].quem} {salvas[k].quando?.slice(0, 10)}</span>}
              </div>
            )
          })}
        </div>
        <Paginas pag={pag} total={paginas} mudar={setPag} />
      </>)}
      {aberta && (
        <Modal titulo={`${info?.nome} ${hex(aberta.id, cat)}`} aberto fechar={() => setAberta(null)}
          acoes={<button className="btn" onClick={() => { alternar(aberta) }}>{sel[chave(aberta)] ? 'Desmarcar' : 'Marcar para trazer'}</button>}>
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
            <dt>Situação</dt><dd>{ST[aberta.st] || aberta.st}{aberta.ty ? ` · ${TY[aberta.ty]}` : ''}<br /><span className="discreto">{ST_DICA[aberta.st]}</span></dd>
            {salvas[chave(aberta)]?.quem && <><dt>Marcado por</dt><dd>{salvas[chave(aberta)].quem} em {salvas[chave(aberta)].quando}</dd></>}
            {aberta.an !== undefined && <><dt>Animação</dt><dd>{aberta.an}{aberta.sexo ? ` (${aberta.sexo})` : ''}</dd></>}
            {aberta.x && <><dt>Obs.</dt><dd>{aberta.x}</dd></>}
          </dl>
        </Modal>
      )}
      {exportar && (
        <Modal titulo={`Exportar ${nSel} escolhidos (${exportar.toUpperCase()})`} aberto fechar={() => setExportar(null)}
          acoes={<>
            <button className="btn btn-2" onClick={() => navigator.clipboard?.writeText(textoExport)}>Copiar</button>
            <button className="btn" onClick={baixar}>Baixar arquivo</button>
          </>}>
          <textarea className="entrada" readOnly value={textoExport} style={{ width: '100%', height: 320, fontFamily: 'monospace', fontSize: 12 }} />
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
