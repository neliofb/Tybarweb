import { useEffect, useState } from 'react'
import { getMeusLivros, getPersonagens, enviarLivro, msgErro, TIPOS_LIVRO, MAX_TITULO_LIVRO, MAX_LETRAS_PAGINA, Personagem } from '../api/site'
import { CabecalhoPagina, Carregando, Erro, useDados, useTitulo, dataBR } from '../components/ui'

const SELO: Record<string, string> = { pendente: 'selo-pendente', aprovado: 'selo-ok', recusado: 'selo-mal' }

// Pré-visualização do texto de uma página: <b> <i> <u> e [img](http/https link) (imagem pequena, no máximo 2).
// Qualquer outra tag aparece como texto comum. Igual ao que o jogo mostra.
const MAX_IMAGENS = 2
function Imagem({ url }: { url: string }) {
  const [falhou, setFalhou] = useState(false)
  if (falhou) return <span className="discreto" style={{ display: 'block', margin: '6px auto', width: 120, border: '1px solid currentColor', textAlign: 'center', opacity: 0.6 }}>[imagem]</span>
  return <img src={url} alt="" referrerPolicy="no-referrer" onError={() => setFalhou(true)} style={{ display: 'block', margin: '6px auto', maxWidth: 120, maxHeight: 90 }} />
}
function PreviaPagina({ texto }: { texto: string }) {
  const re = /<(\/?)([biu])>|\[img\]\((https?:\/\/[^\s()<>[\]"'@]{4,200})\)/gi
  const nos: React.ReactNode[] = []
  let b = false, i = false, u = false, ultimo = 0, imgs = 0, m: RegExpExecArray | null
  const trecho = (t: string, k: number) => {
    if (!t) return
    nos.push(<span key={k} style={{ fontWeight: b ? 700 : undefined, fontStyle: i ? 'italic' : undefined, textDecoration: u ? 'underline' : undefined }}>{t}</span>)
  }
  while ((m = re.exec(texto))) {
    trecho(texto.slice(ultimo, m.index), ultimo)
    ultimo = m.index + m[0].length
    if (m[2]) { const on = !m[1], c = m[2].toLowerCase(); if (c === 'b') b = on; else if (c === 'i') i = on; else u = on }
    else if (imgs < MAX_IMAGENS) { imgs++; nos.push(<Imagem key={'i' + m.index} url={m[3]} />) }
  }
  trecho(texto.slice(ultimo), ultimo)
  return <div className="entrada" style={{ whiteSpace: 'pre-wrap', minHeight: 40 }}>{nos}</div>
}

function AjudaFormatacao() {
  return (
    <details className="aviso" style={{ maxWidth: 760 }}>
      <summary><b>Formatação</b> (negrito, itálico e imagem)</summary>
      <p>Escreva assim no texto da página:</p>
      <ul>
        <li><code>{'<b>negrito</b>'}</code> para <b>negrito</b></li>
        <li><code>{'<i>itálico</i>'}</code> para <i>itálico</i></li>
        <li><code>{'<u>sublinhado</u>'}</code> para <u>sublinhado</u></li>
        <li><code>[img](https://site.com/foto.png)</code> para uma imagem</li>
      </ul>
      <p className="discreto">A imagem fica pequena (cabe numa caixa de 120x90, no meio do texto) e precisa estar hospedada em algum site: use o link direto, terminando em .png, .jpg ou .gif. Até {MAX_IMAGENS} imagens por página. Outras tags são trocadas por parênteses, e as tags não contam no limite de letras.</p>
    </details>
  )
}

export default function EscreverLivroPage() {
  useTitulo('Escrever livro')
  const meus = useDados(getMeusLivros)
  const [pers, setPers] = useState<Personagem[]>([])
  const [titulo, setTitulo] = useState('')
  const [modelo, setModelo] = useState(1)
  const [personagem, setPersonagem] = useState(0)
  const [paginas, setPaginas] = useState<string[]>([''])
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const [enviando, setEnviando] = useState(false)
  const tipo = TIPOS_LIVRO.find(t => t.id === modelo)!

  useEffect(() => { getPersonagens().then(r => { setPers(r.data); if (r.data[0]) setPersonagem(r.data[0].serial) }).catch(() => {}) }, [])

  function mudarPagina(i: number, v: string) { setPaginas(p => p.map((x, j) => (j === i ? v.slice(0, MAX_LETRAS_PAGINA) : x))) }
  function mudarTipo(id: number) { setModelo(id); const n = TIPOS_LIVRO.find(t => t.id === id)!.paginas; setPaginas(p => p.slice(0, n)) }

  async function enviar() {
    setMsg(null); setEnviando(true)
    try {
      await enviarLivro({ titulo: titulo.trim(), modelo, personagem, paginas })
      setMsg({ ok: true, t: 'Livro enviado! Ele aparece na biblioteca do jogo depois que a staff aprovar.' })
      setTitulo(''); setPaginas(['']); meus.carregar()
    } catch (e) { setMsg({ ok: false, t: msgErro(e) }) } finally { setEnviando(false) }
  }

  return (
    <div className="pagina pagina-larga">
      <CabecalhoPagina sobre="Jogador" titulo="Escrever livro">
        Escreva um livro e envie. Depois que a staff aprovar, ele entra <b>lacrado</b> (sem edição) na janela <b>[biblioteca</b> do jogo, com o personagem escolhido como autor.
      </CabecalhoPagina>
      <div className="grade" style={{ gap: 14, maxWidth: 760 }}>
        <label className="campo"><span>Título ({titulo.length}/{MAX_TITULO_LIVRO})</span>
          <input className="entrada" value={titulo} maxLength={MAX_TITULO_LIVRO} onChange={e => setTitulo(e.target.value)} />
        </label>
        <label className="campo"><span>Tipo de livro</span>
          <select className="entrada" value={modelo} onChange={e => mudarTipo(Number(e.target.value))}>
            {TIPOS_LIVRO.map(t => <option key={t.id} value={t.id}>{t.nome} (até {t.paginas} páginas)</option>)}
          </select>
        </label>
        <label className="campo"><span>Autor (personagem)</span>
          <select className="entrada" value={personagem} onChange={e => setPersonagem(Number(e.target.value))}>
            {!pers.length && <option value={0}>Nenhum personagem na conta</option>}
            {pers.map(p => <option key={p.serial} value={p.serial}>{p.nome}</option>)}
          </select>
        </label>
        <AjudaFormatacao />
        {paginas.map((p, i) => (
          <label className="campo" key={i}><span>Página {i + 1} ({p.length}/{MAX_LETRAS_PAGINA})</span>
            <textarea className="entrada" rows={6} value={p} maxLength={MAX_LETRAS_PAGINA} onChange={e => mudarPagina(i, e.target.value)} />
            {/<\/?[biu]>|\[img\]\(/i.test(p) && <PreviaPagina texto={p} />}
          </label>
        ))}
        <div className="linha" style={{ gap: 8 }}>
          <button className="btn btn-2" disabled={paginas.length >= tipo.paginas} onClick={() => setPaginas(p => [...p, ''])}>Adicionar página ({paginas.length}/{tipo.paginas})</button>
          <button className="btn btn-2" disabled={paginas.length <= 1} onClick={() => setPaginas(p => p.slice(0, -1))}>Remover última</button>
          <button className="btn" disabled={enviando || !titulo.trim() || !personagem} onClick={enviar}>Enviar para aprovação</button>
        </div>
        {msg && <div className={'aviso ' + (msg.ok ? 'aviso-ok' : 'aviso-erro')} role="status">{msg.t}</div>}
      </div>

      <h2 style={{ marginTop: 32 }}>Meus livros</h2>
      {meus.carregando && <Carregando />}
      {meus.erro && <Erro erro={meus.erro} tentar={meus.carregar} />}
      {meus.dados && (meus.dados.length ? (
        <div className="tabela-envolve"><table className="tabela">
          <thead><tr><th>Título</th><th>Tipo</th><th>Autor</th><th>Enviado em</th><th>Situação</th></tr></thead>
          <tbody>{meus.dados.map(l => (
            <tr key={l.id}>
              <td><b style={{ color: 'var(--pergaminho)' }}>{l.titulo}</b></td><td>{l.tipo}</td><td>{l.autor}</td><td>{dataBR(l.criado)}</td>
              <td><span className={'selo ' + (SELO[l.estado] ?? 'selo-neutro')}>{l.estado}</span>{l.motivo && <div className="discreto">{l.motivo}</div>}</td>
            </tr>))}</tbody>
        </table></div>
      ) : <div className="vazio">Você ainda não enviou livros.</div>)}
    </div>
  )
}
