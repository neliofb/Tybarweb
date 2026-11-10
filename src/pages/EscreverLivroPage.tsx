import { useEffect, useState } from 'react'
import { getMeusLivros, getPersonagens, enviarLivro, msgErro, TIPOS_LIVRO, MAX_TITULO_LIVRO, MAX_LETRAS_PAGINA, Personagem } from '../api/site'
import { CabecalhoPagina, Carregando, Erro, useDados, useTitulo, dataBR } from '../components/ui'

const SELO: Record<string, string> = { pendente: 'selo-pendente', aprovado: 'selo-ok', recusado: 'selo-mal' }

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
        {paginas.map((p, i) => (
          <label className="campo" key={i}><span>Página {i + 1} ({p.length}/{MAX_LETRAS_PAGINA})</span>
            <textarea className="entrada" rows={6} value={p} maxLength={MAX_LETRAS_PAGINA} onChange={e => mudarPagina(i, e.target.value)} />
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
