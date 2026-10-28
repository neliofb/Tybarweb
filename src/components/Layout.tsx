import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useSessao, sair } from '../auth'
import { Sigilo } from './ui'

const DISCORD = import.meta.env.VITE_DISCORD_CONVITE ?? 'https://discord.gg/'
const LAUNCHER = import.meta.env.VITE_LAUNCHER_URL ?? ''

export default function Layout() {
  const s = useSessao()
  const [aberto, setAberto] = useState(false)
  const loc = useLocation()
  const navigate = useNavigate()
  useEffect(() => { setAberto(false); window.scrollTo(0, 0) }, [loc.pathname])
  useEffect(() => {
    if (!aberto) return
    const f = (e: KeyboardEvent) => { if (e.key === 'Escape') setAberto(false) }
    document.addEventListener('keydown', f)
    return () => document.removeEventListener('keydown', f)
  }, [aberto])

  const cls = ({ isActive }: { isActive: boolean }) => (isActive ? 'ativo' : '')

  return (
    <>
      <a className="pular" href="#conteudo">Pular para o conteúdo</a>
      <header className={"cab" + (s.logado ? " cab-cheia" : "")}>
        <Link to="/" className="marca" aria-label="Tybar, início">
          <Sigilo /><span className="marca-nome">TYBAR</span>
        </Link>
        <button className="menu-btn" aria-label={aberto ? 'Fechar menu' : 'Abrir menu'} aria-expanded={aberto} aria-controls="nav-principal" onClick={() => setAberto(a => !a)}>
          {aberto ? '✕' : '☰'}
        </button>
        <nav id="nav-principal" className={'nav' + (aberto ? ' aberto' : '')} aria-label="Navegação principal">
          <div className="nav-grupo">
            <NavLink to="/" end className={cls}>Início</NavLink>
            <NavLink to="/codice" className={cls}>Códice</NavLink>
            <NavLink to="/simulador" className={cls}>Simulador</NavLink>
            <NavLink to="/builds" className={cls}>Builds</NavLink>
          </div>
          {s.logado && (
            <div className="nav-grupo" aria-label="Área do jogador">
              <span className="nav-rotulo">Jogador</span>
              <NavLink to="/guerra" className={cls}>Guerra</NavLink>
              <NavLink to="/faccoes" className={cls}>Facções</NavLink>
              <NavLink to="/bestiario" className={cls}>Bestiário</NavLink>
              <NavLink to="/oficios" className={cls}>Ofícios</NavLink>
              <NavLink to="/minhas-builds" className={cls}>Minhas builds</NavLink>
            </div>
          )}
          {s.staff && (
            <div className="nav-grupo" aria-label="Área da staff">
              <span className="nav-rotulo">Staff</span>
              <NavLink to="/staff/pedidos" className={cls}>Pedidos</NavLink>
              {s.admin && <NavLink to="/staff/jogadores" className={cls}>Jogadores</NavLink>}
              <NavLink to="/staff/builds" className={cls}>Builds oficiais</NavLink>
            </div>
          )}
          <div className="cab-conta">
            {s.logado ? (
              <>
                <NavLink to="/painel" className={p => 'cab-nome ' + cls(p)} title="Meu painel">{s.nome || 'Minha conta'}</NavLink>
                <button className="btn btn-2 btn-p" onClick={() => { sair(); navigate('/') }}>Sair</button>
              </>
            ) : (
              <>
                <Link to="/criar-conta" className="btn btn-2 btn-p">Criar conta</Link>
                <Link to="/entrar" className="btn btn-p">Entrar</Link>
              </>
            )}
          </div>
        </nav>
      </header>
      {aberto && <div className="veu" onClick={() => setAberto(false)} aria-hidden="true" />}
      <main id="conteudo" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="rodape">
        <div style={{ marginBottom: 8 }}>
          <Link to="/codice">Códice</Link>·
          <a href={DISCORD} target="_blank" rel="noreferrer">Discord</a>·
          {LAUNCHER && <><a href={LAUNCHER}>Baixar o launcher</a>·</>}
          <Link to="/simulador">Simulador</Link>
        </div>
        Tybar · shard de Ultima Online com interpretação obrigatória. Feito à mão, com carinho, desde o FLShard.
      </footer>
      {import.meta.env.VITE_MOCK === '1' && <div className="selo-modo">Dados de teste (mock)</div>}
    </>
  )
}

export function SoLogado({ children }: { children: JSX.Element }) {
  const s = useSessao()
  const loc = useLocation()
  if (!s.logado) return <Navigate to={'/entrar?voltar=' + encodeURIComponent(loc.pathname)} replace />
  return children
}

export function SoStaff({ children, admin }: { children: JSX.Element; admin?: boolean }) {
  const s = useSessao()
  const loc = useLocation()
  if (!s.logado) return <Navigate to={'/entrar?voltar=' + encodeURIComponent(loc.pathname)} replace />
  if (!s.staff || (admin && !s.admin)) {
    return <div className="pagina"><div className="aviso aviso-erro" role="alert">Esta área é só da staff.</div></div>
  }
  return children
}
