import { useState } from 'react'
import { getLivrosStaff, aprovarLivro, recusarLivro, msgErro, Livro } from '../../api/site'
import { CabecalhoPagina, Carregando, Erro, Modal, useDados, useTitulo, dataBR } from '../../components/ui'

const SELO: Record<string, string> = { pendente: 'selo-pendente', aprovado: 'selo-ok', recusado: 'selo-mal' }

export default function LivrosStaffPage() {
  useTitulo('Livros')
  const d = useDados(getLivrosStaff)
  const [filtro, setFiltro] = useState('pendente')
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const [ler, setLer] = useState<Livro | null>(null)
  const [recusar, setRecusar] = useState<Livro | null>(null)
  const [motivo, setMotivo] = useState('')
  const [ocupado, setOcupado] = useState('')

  const lista = (d.dados ?? []).filter(l => !filtro || l.estado === filtro)
  async function fazer(id: string, fn: () => Promise<unknown>, ok: string) {
    setOcupado(id); setMsg(null)
    try { await fn(); setMsg({ ok: true, t: ok }); d.carregar() } catch (e) { setMsg({ ok: false, t: msgErro(e) }) } finally { setOcupado('') }
  }

  return (
    <div className="pagina pagina-larga">
      <CabecalhoPagina sobre="Staff" titulo="Livros do site">Aprovar lacra o livro (sem edição) e o coloca na [biblioteca do jogo. Leia antes de decidir.</CabecalhoPagina>
      <div className="chips" role="group" aria-label="Situação" style={{ marginBottom: 16 }}>
        {[['pendente', 'Pendentes'], ['aprovado', 'Aprovados'], ['recusado', 'Recusados'], ['', 'Todos']].map(([v, n]) => (
          <button key={v} className="chip" aria-pressed={filtro === v} onClick={() => setFiltro(v)}>{n}{v === 'pendente' && d.dados ? ` (${d.dados.filter(l => l.estado === 'pendente').length})` : ''}</button>
        ))}
      </div>
      {msg && <div className={'aviso ' + (msg.ok ? 'aviso-ok' : 'aviso-erro')} role="status" style={{ marginBottom: 14 }}>{msg.t}</div>}
      {d.carregando && <Carregando />}
      {d.erro && <Erro erro={d.erro} tentar={d.carregar} />}
      {d.dados && (
        <div className="tabela-envolve">
          <table className="tabela">
            <thead><tr><th>Título</th><th>Tipo</th><th>Autor</th><th>Enviado em</th><th>Situação</th><th>Ações</th></tr></thead>
            <tbody>
              {lista.map(l => (
                <tr key={l.id}>
                  <td><b style={{ color: 'var(--pergaminho)' }}>{l.titulo}</b></td>
                  <td>{l.tipo} · {l.paginas.length} pág.</td>
                  <td>{l.autor}<div className="discreto">conta {l.conta}</div></td>
                  <td>{dataBR(l.criado)}</td>
                  <td><span className={'selo ' + (SELO[l.estado] ?? 'selo-neutro')}>{l.estado}</span>{l.motivo && <div className="discreto">{l.motivo}</div>}{l.decididoPor && <div className="discreto">por {l.decididoPor}</div>}</td>
                  <td><div className="linha" style={{ gap: 6 }}>
                    <button className="btn btn-2 btn-p" onClick={() => setLer(l)}>Ler</button>
                    {l.estado === 'pendente' && <>
                      <button className="btn btn-p" disabled={ocupado === l.id} onClick={() => fazer(l.id, () => aprovarLivro(l.id), `“${l.titulo}” aprovado e lacrado.`)}>Aprovar</button>
                      <button className="btn btn-perigo btn-p" disabled={ocupado === l.id} onClick={() => { setRecusar(l); setMotivo('') }}>Recusar</button>
                    </>}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!lista.length && <div className="vazio">Nenhum livro aqui.</div>}
        </div>
      )}
      <Modal titulo={ler?.titulo ?? ''} aberto={!!ler} fechar={() => setLer(null)} acoes={<button className="btn btn-2" onClick={() => setLer(null)}>Fechar</button>}>
        <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
          {ler?.paginas.map((p, i) => <div key={i} style={{ marginBottom: 14 }}><div className="discreto">Página {i + 1}</div><div style={{ whiteSpace: 'pre-wrap' }}>{p || '(em branco)'}</div></div>)}
        </div>
      </Modal>
      <Modal titulo={`Recusar “${recusar?.titulo ?? ''}”`} aberto={!!recusar} fechar={() => setRecusar(null)} acoes={<>
        <button className="btn btn-2" onClick={() => setRecusar(null)}>Cancelar</button>
        <button className="btn btn-perigo" onClick={() => { const l = recusar!; setRecusar(null); fazer(l.id, () => recusarLivro(l.id, motivo.trim()), 'Livro recusado.') }}>Recusar</button>
      </>}>
        <label className="campo"><span>Motivo (opcional; o jogador vê este texto)</span>
          <textarea className="entrada" value={motivo} onChange={e => setMotivo(e.target.value)} maxLength={300} />
        </label>
      </Modal>
    </div>
  )
}
