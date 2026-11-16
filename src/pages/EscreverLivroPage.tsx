import { useEffect, useState } from 'react'
import { getMeusLivros, getPersonagens, enviarLivro, editarLivro, excluirLivro, msgErro, Livro, TIPOS_LIVRO, MAX_TITULO_LIVRO, MAX_LETRAS_PAGINA, Personagem } from '../api/site'
import { CabecalhoPagina, Carregando, Erro, Modal, useDados, useTitulo, dataBR } from '../components/ui'

const SELO: Record<string, string> = { pendente: 'selo-pendente', aprovado: 'selo-ok', recusado: 'selo-mal' }

// Pré-visualização do texto de uma página: <b> <i> <u> e [img](http/https link) (imagem até 250x200, no máximo 2).
// Qualquer outra tag aparece como texto comum. Igual ao que o jogo mostra.
const MAX_IMAGENS = 2
function Imagem({ url }: { url: string }) {
  const [falhou, setFalhou] = useState(false)
  if (falhou) return <span className="discreto" style={{ display: 'block', margin: '6px auto', width: 250, border: '1px solid currentColor', textAlign: 'center', opacity: 0.6 }}>[imagem]</span>
  return <img src={url} alt="" referrerPolicy="no-referrer" onError={() => setFalhou(true)} style={{ display: 'block', margin: '6px auto', maxWidth: 250, maxHeight: 200 }} />
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

function Exemplo({ codigo, titulo }: { codigo: string; titulo: string }) {
  return (
    <div className="linha" style={{ gap: 12, alignItems: 'flex-start', flexWrap: 'wrap', margin: '8px 0' }}>
      <div style={{ flex: '1 1 260px' }}>
        <div className="discreto">{titulo} - você escreve:</div>
        <pre className="entrada" style={{ whiteSpace: 'pre-wrap', margin: 0 }}><code>{codigo}</code></pre>
      </div>
      <div style={{ flex: '1 1 260px' }}>
        <div className="discreto">Resultado:</div>
        <PreviaPagina texto={codigo} />
      </div>
    </div>
  )
}

function AjudaFormatacao() {
  return (
    <details className="aviso" style={{ maxWidth: 760 }}>
      <summary><b>Como formatar</b> (tutorial: negrito, itálico, sublinhado, imagens)</summary>
      <h3>1. Formatação do texto</h3>
      <p>Cada página é uma caixa de texto. A formatação é feita com marcas escritas no próprio texto, sempre abrindo e fechando.</p>
      <Exemplo titulo="Negrito" codigo={'Isto é <b>muito importante</b>.'} />
      <Exemplo titulo="Itálico" codigo={'Ele sussurrou <i>não confie neles</i>.'} />
      <Exemplo titulo="Sublinhado" codigo={'Encontre em <u>Britain</u>.'} />
      <Exemplo titulo="Combinando" codigo={'<b><i>negrito e itálico</i></b> juntos'} />
      <Exemplo titulo="Título (use negrito e uma linha em branco)" codigo={'<b><u>Capítulo I</u></b>\n\nEra uma vez...'} />
      <ul>
        <li><b>Quebra de linha:</b> aperte Enter. Duas vezes deixa uma linha em branco (três ou mais viram duas).</li>
        <li><b>Nova página:</b> use o botão <i>Adicionar página</i>. Cada caixa é uma página do livro (até {MAX_LETRAS_PAGINA} letras cada).</li>
        <li>Marcas esquecidas abertas são fechadas sozinhas no fim da página, e as marcas não contam no limite de letras.</li>
        <li>Qualquer outra marca (<code>{'<center>'}</code>, <code>{'<font>'}</code>, etc.) vira texto entre parênteses.</li>
      </ul>
      <p className="discreto"><b>Não existem:</b> cores, tamanhos de letra, títulos grandes, alinhamento (esquerda/centro/direita) e quebra de página dentro do texto.</p>
      <h3>2. Inserir imagens</h3>
      <p>Escreva o link da imagem entre <code>[img](</code> e <code>)</code>, no ponto do texto onde ela deve aparecer.</p>
      <Exemplo titulo="Imagem" codigo={'Veja o mapa:\n[img](https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png)\nFim.'} />
      <ul>
        <li>O link precisa começar com <code>http://</code> ou <code>https://</code>, ter de 4 a 200 caracteres e não pode ter espaços, parênteses, colchetes, aspas ou @.</li>
        <li>A imagem precisa estar hospedada em algum site (use o link direto da imagem, terminando em .png, .jpg ou .gif). <b>Não há upload no site</b> e não dá para usar número de gump ou arte do jogo.</li>
        <li>Máximo de {MAX_IMAGENS} imagens por página; as demais são descartadas.</li>
        <li>Se o link não carregar, aparece um quadro <code>[imagem]</code>.</li>
      </ul>
      <h3>3. Formatar imagens</h3>
      <p>Não há escolha de tamanho, posição, alinhamento nem legenda: no jogo toda imagem aparece ajustada (cabe numa caixa de até 250x200), centralizada, no ponto onde você a colocou, e o texto continua abaixo dela. Para uma legenda, escreva uma linha de texto (por exemplo em <code>{'<i>'}</code>) logo depois da imagem.</p>
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
  const [editando, setEditando] = useState<Livro | null>(null)
  const [excluir, setExcluir] = useState<Livro | null>(null)
  const tipo = TIPOS_LIVRO.find(t => t.id === modelo)!

  useEffect(() => { getPersonagens().then(r => { setPers(r.data); if (r.data[0]) setPersonagem(r.data[0].serial) }).catch(() => {}) }, [])

  function mudarPagina(i: number, v: string) { setPaginas(p => p.map((x, j) => (j === i ? v.slice(0, MAX_LETRAS_PAGINA) : x))) }
  function mudarTipo(id: number) { setModelo(id); const n = TIPOS_LIVRO.find(t => t.id === id)!.paginas; setPaginas(p => p.slice(0, n)) }

  async function enviar() {
    setMsg(null); setEnviando(true)
    try {
      if (editando) {
        await editarLivro(editando.id, { titulo: titulo.trim(), paginas })
        setMsg({ ok: true, t: editando.estado === 'aprovado' || editando.jaAprovado
          ? 'Edição enviada! O livro voltou para aprovação; as cópias no jogo seguem com o texto antigo até a staff aprovar.'
          : 'Edição salva! O livro está esperando aprovação.' })
        setEditando(null)
      } else {
        await enviarLivro({ titulo: titulo.trim(), modelo, personagem, paginas })
        setMsg({ ok: true, t: 'Livro enviado! Ele aparece na biblioteca do jogo depois que a staff aprovar.' })
      }
      setTitulo(''); setPaginas(['']); meus.carregar()
    } catch (e) { setMsg({ ok: false, t: msgErro(e) }) } finally { setEnviando(false) }
  }

  function comecarEdicao(l: Livro) {
    setEditando(l); setMsg(null); setTitulo(l.titulo); setModelo(l.modelo)
    const p = [...l.paginas]; while (p.length > 1 && !p[p.length - 1]) p.pop()
    setPaginas(p.length ? p : [''])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function cancelarEdicao() { setEditando(null); setTitulo(''); setPaginas(['']) }

  async function confirmarExclusao() {
    const l = excluir!; setExcluir(null); setMsg(null)
    try {
      const r = await excluirLivro(l.id)
      setMsg({ ok: true, t: r.data.apagado ? `“${l.titulo}” foi apagado.` : `“${l.titulo}” saiu da biblioteca e do site.` })
      if (editando?.id === l.id) cancelarEdicao()
      meus.carregar()
    } catch (e) { setMsg({ ok: false, t: msgErro(e) }) }
  }

  return (
    <div className="pagina pagina-larga">
      <CabecalhoPagina sobre="Jogador" titulo="Escrever livro">
        Escreva um livro e envie. Depois que a staff aprovar, ele entra <b>lacrado</b> (sem edição) na janela <b>[biblioteca</b> do jogo, com o personagem escolhido como autor.
      </CabecalhoPagina>
      <div className="grade" style={{ gap: 14, maxWidth: 760 }}>
        {editando && <div className="aviso" role="status">Editando <b>{editando.titulo}</b>.{(editando.estado === 'aprovado' || editando.jaAprovado) && ' Ao salvar, o livro volta para aprovação; as cópias no jogo continuam com o texto antigo até a staff aprovar de novo.'}</div>}
        <label className="campo"><span>Título ({titulo.length}/{MAX_TITULO_LIVRO})</span>
          <input className="entrada" value={titulo} maxLength={MAX_TITULO_LIVRO} onChange={e => setTitulo(e.target.value)} />
        </label>
        <label className="campo"><span>Tipo de livro</span>
          <select className="entrada" value={modelo} disabled={!!editando} onChange={e => mudarTipo(Number(e.target.value))}>
            {TIPOS_LIVRO.map(t => <option key={t.id} value={t.id}>{t.nome} (até {t.paginas} páginas)</option>)}
          </select>
        </label>
        <label className="campo"><span>Autor (personagem)</span>
          <select className="entrada" value={personagem} disabled={!!editando} onChange={e => setPersonagem(Number(e.target.value))}>
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
          <button className="btn" disabled={enviando || !titulo.trim() || (!editando && !personagem)} onClick={enviar}>{editando ? 'Salvar edição' : 'Enviar para aprovação'}</button>
          {editando && <button className="btn btn-2" onClick={cancelarEdicao}>Cancelar edição</button>}
        </div>
        {msg && <div className={'aviso ' + (msg.ok ? 'aviso-ok' : 'aviso-erro')} role="status">{msg.t}</div>}
      </div>

      <h2 style={{ marginTop: 32 }}>Meus livros</h2>
      {meus.carregando && <Carregando />}
      {meus.erro && <Erro erro={meus.erro} tentar={meus.carregar} />}
      {meus.dados && (meus.dados.length ? (
        <div className="tabela-envolve"><table className="tabela">
          <thead><tr><th>Título</th><th>Tipo</th><th>Autor</th><th>Enviado em</th><th>Situação</th><th>Ações</th></tr></thead>
          <tbody>{meus.dados.map(l => (
            <tr key={l.id}>
              <td><b style={{ color: 'var(--pergaminho)' }}>{l.titulo}</b></td><td>{l.tipo}</td><td>{l.autor}</td><td>{dataBR(l.criado)}</td>
              <td><span className={'selo ' + (SELO[l.estado] ?? 'selo-neutro')}>{l.estado}</span>{l.revisao && <div className="discreto">edição esperando aprovação</div>}{l.motivo && <div className="discreto">{l.motivo}</div>}</td>
              <td><div className="linha" style={{ gap: 6 }}>
                <button className="btn btn-2 btn-p" onClick={() => comecarEdicao(l)}>Editar</button>
                <button className="btn btn-perigo btn-p" onClick={() => setExcluir(l)}>Excluir</button>
              </div></td>
            </tr>))}</tbody>
        </table></div>
      ) : <div className="vazio">Você ainda não enviou livros.</div>)}
      <Modal titulo={`Excluir “${excluir?.titulo ?? ''}”?`} aberto={!!excluir} fechar={() => setExcluir(null)} acoes={<>
        <button className="btn btn-2" onClick={() => setExcluir(null)}>Cancelar</button>
        <button className="btn btn-perigo" onClick={confirmarExclusao}>Excluir</button>
      </>}>
        {excluir && (excluir.estado === 'aprovado' || excluir.jaAprovado)
          ? <p>O livro sai da biblioteca do jogo e do site. As cópias que já estão com jogadores viram um livro com as páginas arrancadas. A staff guarda uma cópia e pode restaurar se você pedir.</p>
          : <p>O livro ainda não foi aprovado e será apagado. A staff guarda uma cópia e pode restaurar se você pedir.</p>}
      </Modal>
    </div>
  )
}
