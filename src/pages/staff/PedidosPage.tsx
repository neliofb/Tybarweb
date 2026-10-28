import { useState } from 'react'
import { getPedidos, aprovarPedido, recusarPedido, msgErro, PedidoConta } from '../../api/site'
import { CabecalhoPagina, Carregando, Erro, Modal, useDados, useTitulo, dataBR } from '../../components/ui'

const SELO: Record<string, string> = { pendente: 'selo-pendente', aprovado: 'selo-ok', recusado: 'selo-mal' }

export default function PedidosPage() {
  useTitulo('Pedidos de conta')
  const d = useDados(getPedidos)
  const [filtro, setFiltro] = useState('pendente')
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const [recusar, setRecusar] = useState<PedidoConta | null>(null)
  const [motivo, setMotivo] = useState('')
  const [ocupado, setOcupado] = useState('')

  const lista = (d.dados ?? []).filter(p => !filtro || p.status === filtro)
  async function fazer(id: string, fn: () => Promise<unknown>, ok: string) {
    setOcupado(id); setMsg(null)
    try { await fn(); setMsg({ ok: true, t: ok }); d.carregar() } catch (e) { setMsg({ ok: false, t: msgErro(e) }) } finally { setOcupado('') }
  }

  return (
    <div className="pagina pagina-larga">
      <CabecalhoPagina sobre="Staff" titulo="Pedidos de conta">Aprovar cria a conta no jogo (nível Player) com o login e a senha pedidos.</CabecalhoPagina>
      <div className="chips" role="group" aria-label="Situação" style={{ marginBottom: 16 }}>
        {[['pendente', 'Pendentes'], ['aprovado', 'Aprovados'], ['recusado', 'Recusados'], ['', 'Todos']].map(([v, n]) => (
          <button key={v} className="chip" aria-pressed={filtro === v} onClick={() => setFiltro(v)}>{n}{v === 'pendente' && d.dados ? ` (${d.dados.filter(p => p.status === 'pendente').length})` : ''}</button>
        ))}
      </div>
      {msg && <div className={'aviso ' + (msg.ok ? 'aviso-ok' : 'aviso-erro')} role="status" style={{ marginBottom: 14 }}>{msg.t}</div>}
      {d.carregando && <Carregando />}
      {d.erro && <Erro erro={d.erro} tentar={d.carregar} />}
      {d.dados && (
        <div className="tabela-envolve">
          <table className="tabela">
            <thead><tr><th>Login</th><th>Discord</th><th>Pedido em</th><th>Situação</th><th>Ações</th></tr></thead>
            <tbody>
              {lista.map(p => (
                <tr key={p.id}>
                  <td><b style={{ color: 'var(--pergaminho)' }}>{p.login}</b></td>
                  <td>{p.discordNome}<div className="discreto">{p.discordId}</div></td>
                  <td>{dataBR(p.criadoEm)}</td>
                  <td><span className={'selo ' + (SELO[p.status] ?? 'selo-neutro')}>{p.status}</span>{p.motivo && <div className="discreto">{p.motivo}</div>}{p.decididoPor && <div className="discreto">por {p.decididoPor} · {dataBR(p.decididoEm)}</div>}</td>
                  <td>
                    {p.status === 'pendente' && (
                      <div className="linha" style={{ gap: 6 }}>
                        <button className="btn btn-p" disabled={ocupado === p.id} onClick={() => fazer(p.id, () => aprovarPedido(p.id), `Conta “${p.login}” criada.`)}>Aprovar</button>
                        <button className="btn btn-perigo btn-p" disabled={ocupado === p.id} onClick={() => { setRecusar(p); setMotivo('') }}>Recusar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!lista.length && <div className="vazio">Nenhum pedido aqui.</div>}
        </div>
      )}
      <Modal titulo={`Recusar o pedido de ${recusar?.login ?? ''}`} aberto={!!recusar} fechar={() => setRecusar(null)} acoes={<>
        <button className="btn btn-2" onClick={() => setRecusar(null)}>Cancelar</button>
        <button className="btn btn-perigo" disabled={!motivo.trim()} onClick={() => { const p = recusar!; setRecusar(null); fazer(p.id, () => recusarPedido(p.id, motivo.trim()), 'Pedido recusado.') }}>Recusar</button>
      </>}>
        <label className="campo"><span>Motivo (a pessoa vê este texto)</span>
          <textarea className="entrada" value={motivo} onChange={e => setMotivo(e.target.value)} maxLength={300} />
        </label>
      </Modal>
    </div>
  )
}
