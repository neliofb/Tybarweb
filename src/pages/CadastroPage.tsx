import { FormEvent, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { enviarPedido, getStatusPedido, StatusCadastro, msgErro, URL_DISCORD_LOGIN } from '../api/site'
import { CabecalhoPagina, Carregando, Erro, useDados, useTitulo, dataBR } from '../components/ui'

const DISCORD = import.meta.env.VITE_DISCORD_CONVITE ?? 'https://discord.gg/'
const MOCK = import.meta.env.VITE_MOCK === '1'
// Regra de nome de conta (Ajustes do contrato): 3–30 ASCII, sem espaço nem < > : " / \ | ? *, sem ponto no fim
const RE_LOGIN = /^[!-~]{3,30}$/
const RUIM_LOGIN = /[<>:"/\|?*]/
const loginValido = (l: string) => RE_LOGIN.test(l) && !RUIM_LOGIN.test(l) && !l.endsWith('.')
const senhaValida = (s: string) => /^[ -~]{8,64}$/.test(s)

function Passo({ n, titulo, estado, children }: { n: number; titulo: string; estado: 'feito' | 'atual' | 'depois'; children?: React.ReactNode }) {
  return (
    <section className="painel" aria-current={estado === 'atual' ? 'step' : undefined} style={{ opacity: estado === 'depois' ? .5 : 1 }}>
      <div className="linha" style={{ marginBottom: children ? 12 : 0 }}>
        <span className={'selo ' + (estado === 'feito' ? 'selo-ok' : estado === 'atual' ? 'selo-pendente' : 'selo-neutro')}>{estado === 'feito' ? '✓ ' : ''}Passo {n}</span>
        <h3 style={{ margin: 0 }}>{titulo}</h3>
      </div>
      {children}
    </section>
  )
}

export default function CadastroPage() {
  useTitulo('Criar conta')
  // Sem sessão do Discord a API pode responder 401/404: é o mesmo que "ainda não entrou com o Discord"
  const st = useDados(() => getStatusPedido().catch(e => {
    if ([401, 404].includes(e?.response?.status)) return { data: { status: 'sem_discord' } as StatusCadastro }
    throw e
  }))
  const [q] = useSearchParams()
  const MOTIVOS: Record<string, string> = { estado: 'a confirmação expirou, tente de novo', falha: 'o Discord não respondeu', fora_do_servidor: 'você não está no servidor do Discord do Tybar' }
  const erroDiscord = q.get('discord') === 'erro' ? MOTIVOS[q.get('motivo') ?? ''] ?? 'tente de novo' : q.get('erro')
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [senha2, setSenha2] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const status = st.dados?.status === 'sem_discord' && q.get('motivo') === 'fora_do_servidor' ? 'fora_do_servidor' : st.dados?.status ?? 'sem_discord'
  const temDiscord = status !== 'sem_discord' && status !== 'fora_do_servidor'
  const temPedido = ['pendente', 'aprovado', 'recusado'].includes(status)

  const erroLogin = login && !loginValido(login) ? 'Use de 3 a 30 caracteres sem espaço, sem acento, sem < > : " / \ | ? * e sem ponto no fim.' : ''
  const erroSenha = senha && !senhaValida(senha) ? 'A senha precisa de 8 a 64 caracteres, sem acento.' : ''
  const erroSenha2 = senha2 && senha2 !== senha ? 'As senhas não batem.' : ''

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (erroLogin || erroSenha || erroSenha2 || !login || !senha) return
    setErro(''); setEnviando(true)
    try {
      await enviarPedido(login.trim(), senha)
      setSenha(''); setSenha2('')
      st.carregar()
    } catch (e2) { setErro(msgErro(e2)) } finally { setEnviando(false) }
  }

  function entrarDiscord() {
    if (MOCK) { sessionStorage.setItem('mockDiscord', '1'); st.carregar(); return }
    window.location.href = URL_DISCORD_LOGIN
  }

  return (
    <div className="pagina" style={{ maxWidth: 760 }}>
      <CabecalhoPagina sobre="Bem-vindo, viajante" titulo="Criar conta">
        A conta é pedida pelo site e aprovada pela staff. Um Discord vale uma conta.
      </CabecalhoPagina>
      {erroDiscord && <div className="aviso aviso-erro" role="alert" style={{ marginBottom: 16 }}>O Discord não confirmou o acesso: {erroDiscord}</div>}
      {st.carregando && !st.dados && <Carregando />}
      {st.erro && <Erro erro={st.erro} tentar={st.carregar} />}
      {(st.dados || st.erro) && (
        <div className="pilha">
          <Passo n={1} titulo="Entrar com o Discord" estado={temDiscord ? 'feito' : 'atual'}>
            {temDiscord ? (
              <p>Conectado como <b>{st.dados?.discord?.nome}</b>. Você está no servidor do Tybar.</p>
            ) : (
              <>
                <p className="texto-2">Conferimos que você está no servidor do Discord do Tybar. Só lemos o seu nome e a lista de servidores; nada é publicado.</p>
                {status === 'fora_do_servidor' && (
                  <div className="aviso aviso-erro" style={{ margin: '12px 0' }}>Você ainda não está no servidor do Tybar. <a href={DISCORD} target="_blank" rel="noreferrer">Entre nele</a> e tente de novo.</div>
                )}
                <button className="btn btn-discord" style={{ marginTop: 12 }} onClick={entrarDiscord}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.6 1.3a18.4 18.4 0 0 0-5.6 0L8.6 3a19.7 19.7 0 0 0-4.9 1.4C.6 9 -.3 13.6.1 18.1A19.9 19.9 0 0 0 6.2 21l1.3-1.8a12.9 12.9 0 0 1-2-1l.5-.4a14.2 14.2 0 0 0 12 0l.5.4c-.6.4-1.3.7-2 1l1.3 1.8a19.8 19.8 0 0 0 6.1-3c.5-5.2-.9-9.8-3.6-13.7zM8.3 15.3c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4zm7.4 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4z" /></svg>
                  Entrar com Discord
                </button>
              </>
            )}
          </Passo>

          <Passo n={2} titulo="Login e senha do jogo" estado={!temDiscord ? 'depois' : temPedido ? 'feito' : 'atual'}>
            {temDiscord && !temPedido && (
              <form onSubmit={enviar} className="pilha" noValidate>
                <label className="campo"><span>Login da conta</span>
                  <input className="entrada" value={login} onChange={e => setLogin(e.target.value)} autoComplete="username" aria-invalid={!!erroLogin} aria-describedby="aj-login" required />
                  {erroLogin ? <div className="erro-campo" id="aj-login">{erroLogin}</div> : <div className="ajuda" id="aj-login">É o que você digita para entrar no jogo, não o nome do personagem.</div>}
                </label>
                <label className="campo"><span>Senha</span>
                  <input className="entrada" type="password" value={senha} onChange={e => setSenha(e.target.value)} autoComplete="new-password" aria-invalid={!!erroSenha} required />
                  {erroSenha ? <div className="erro-campo">{erroSenha}</div> : <div className="ajuda">8 caracteres ou mais. Não use a senha do Discord.</div>}
                </label>
                <label className="campo"><span>Repita a senha</span>
                  <input className="entrada" type="password" value={senha2} onChange={e => setSenha2(e.target.value)} autoComplete="new-password" aria-invalid={!!erroSenha2} required />
                  {erroSenha2 && <div className="erro-campo">{erroSenha2}</div>}
                </label>
                {erro && <div className="aviso aviso-erro" role="alert">{erro}</div>}
                <button className="btn" disabled={enviando || !login || !senha || !!(erroLogin || erroSenha || erroSenha2) || senha !== senha2}>{enviando ? 'Enviando…' : 'Pedir a conta'}</button>
              </form>
            )}
            {temPedido && <p>Login pedido: <b>{st.dados?.login}</b></p>}
          </Passo>

          <Passo n={3} titulo="Aprovação da staff" estado={status === 'aprovado' ? 'feito' : temPedido ? 'atual' : 'depois'}>
            {status === 'pendente' && (
              <div className="aviso aviso-info" role="status">
                <b>Aguardando aprovação da staff.</b> Pedido feito em {dataBR(st.dados?.criadoEm)}. Você pode fechar esta página; volte aqui para ver o andamento.
                <div style={{ marginTop: 8 }}><button className="btn-link" onClick={st.carregar}>Atualizar</button></div>
              </div>
            )}
            {status === 'aprovado' && (
              <div className="aviso aviso-ok" role="status">Conta aprovada! Baixe o launcher e entre no jogo, ou <Link to="/entrar">entre no site</Link> com o mesmo login.</div>
            )}
            {status === 'recusado' && (
              <div className="aviso aviso-erro" role="status">Pedido recusado{st.dados?.motivo ? <>: <i>{st.dados.motivo}</i></> : '.'} Fale com a staff no Discord se tiver dúvida.</div>
            )}
          </Passo>
        </div>
      )}
    </div>
  )
}
