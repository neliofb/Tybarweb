import { FormEvent, useState } from 'react'
import { getContas, trocarSenha, mudarNivel, banir, msgErro, ContaStaff } from '../../api/site'
import { useSessao, nivelIdx } from '../../auth'
import { Busca, CabecalhoPagina, Carregando, Erro, Modal, useTitulo, dataBR } from '../../components/ui'

const NIVEIS_EDITAVEIS = ['Player', 'Counselor', 'GameMaster', 'Seer']

export default function JogadoresPage() {
  useTitulo('Jogadores')
  const s = useSessao()
  const [busca, setBusca] = useState('')
  const [contas, setContas] = useState<ContaStaff[] | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const [senhaDe, setSenhaDe] = useState<ContaStaff | null>(null)
  const [senha, setSenha] = useState('')
  const [banDe, setBanDe] = useState<ContaStaff | null>(null)
  const [motivo, setMotivo] = useState('')

  async function procurar(e?: FormEvent) {
    e?.preventDefault()
    setCarregando(true); setErro('')
    try { setContas((await getContas(busca.trim())).data) } catch (e2) { setErro(msgErro(e2)) } finally { setCarregando(false) }
  }
  async function fazer(fn: () => Promise<unknown>, ok: string) {
    setMsg(null)
    try { await fn(); setMsg({ ok: true, t: ok }); procurar() } catch (e) { setMsg({ ok: false, t: msgErro(e) }) }
  }
  // Ninguém sobe acima do próprio nível (a API confere de novo)
  const niveis = NIVEIS_EDITAVEIS.filter(n => nivelIdx(n) < nivelIdx(s.nivel))

  return (
    <div className="pagina pagina-larga">
      <CabecalhoPagina sobre="Staff · Administrator" titulo="Jogadores">Busque por login, personagem ou Discord. Mudar nível vai até Seer e nunca acima do seu; contas de nível igual ou maior que o seu não podem ser alteradas.</CabecalhoPagina>
      <form className="linha" onSubmit={procurar} style={{ marginBottom: 18 }}>
        <Busca valor={busca} mudar={setBusca} rotulo="Buscar conta" />
        <button className="btn">Buscar</button>
      </form>
      {msg && <div className={'aviso ' + (msg.ok ? 'aviso-ok' : 'aviso-erro')} role="status" style={{ marginBottom: 14 }}>{msg.t}</div>}
      {carregando && <Carregando />}
      {erro && <Erro erro={erro} />}
      {contas && (
        <div className="tabela-envolve">
          <table className="tabela">
            <thead><tr><th>Conta</th><th>Personagens</th><th>Discord</th><th>Nível</th><th>Último acesso</th><th>Ações</th></tr></thead>
            <tbody>
              {contas.map(c => (
                <tr key={c.login}>
                  <td><b style={{ color: 'var(--pergaminho)' }}>{c.login}</b>{c.banido && <> <span className="selo selo-mal">Banido</span></>}<div className="discreto">desde {dataBR(c.criadaEm)}</div></td>
                  <td>{c.personagens?.length ? c.personagens.map(p => <div key={p.nome}>{p.nome}{p.online && <span className="selo selo-ok" style={{ marginLeft: 6 }}>online</span>}</div>) : <span className="discreto">nenhum</span>}</td>
                  <td>{c.discordNome ?? <span className="discreto">não vinculado</span>}{c.discordId && <div className="discreto">{c.discordId}</div>}</td>
                  <td>
                    {nivelIdx(c.nivel) < nivelIdx(s.nivel) ? (
                      <select className="entrada" style={{ padding: '4px 8px', fontSize: 15 }} value={c.nivel} aria-label={'Nível de ' + c.login}
                        onChange={e => fazer(() => mudarNivel(c.login, e.target.value), `${c.login} agora é ${e.target.value}.`)}>
                        {!niveis.includes(c.nivel) && <option value={c.nivel}>{c.nivel}</option>}
                        {niveis.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    ) : <span className="selo selo-neutro">{c.nivel}</span>}
                  </td>
                  <td>{dataBR(c.ultimoAcesso)}</td>
                  <td>
                    <div className="linha" style={{ gap: 6 }}>
                      <button className="btn btn-2 btn-p" onClick={() => { setSenhaDe(c); setSenha('') }}>Senha</button>
                      {c.banido
                        ? <button className="btn btn-2 btn-p" onClick={() => fazer(() => banir(c.login, false), `${c.login} desbanido.`)}>Desbanir</button>
                        : <button className="btn btn-perigo btn-p" onClick={() => { setBanDe(c); setMotivo('') }}>Banir</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!contas.length && <div className="vazio">Nenhuma conta encontrada.</div>}
        </div>
      )}
      <Modal titulo={`Nova senha para ${senhaDe?.login ?? ''}`} aberto={!!senhaDe} fechar={() => setSenhaDe(null)} acoes={<>
        <button className="btn btn-2" onClick={() => setSenhaDe(null)}>Cancelar</button>
        <button className="btn" disabled={senha.length < 8} onClick={() => { const c = senhaDe!; setSenhaDe(null); fazer(() => trocarSenha(c.login, senha), 'Senha trocada.') }}>Trocar</button>
      </>}>
        <label className="campo"><span>Senha nova (8 ou mais)</span><input className="entrada" type="text" value={senha} onChange={e => setSenha(e.target.value)} autoComplete="off" /></label>
        <p className="ajuda">Passe a senha à pessoa por mensagem privada.</p>
      </Modal>
      <Modal titulo={`Banir ${banDe?.login ?? ''}?`} aberto={!!banDe} fechar={() => setBanDe(null)} acoes={<>
        <button className="btn btn-2" onClick={() => setBanDe(null)}>Cancelar</button>
        <button className="btn btn-perigo" onClick={() => { const c = banDe!; setBanDe(null); fazer(() => banir(c.login, true, motivo.trim() || undefined), `${c.login} banido.`) }}>Banir</button>
      </>}>
        <label className="campo"><span>Motivo (fica registrado)</span><textarea className="entrada" value={motivo} onChange={e => setMotivo(e.target.value)} maxLength={300} /></label>
      </Modal>
    </div>
  )
}
