import { useState, FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { login } from '../api/client'
import { msgErro } from '../api/site'
import { gravarLogin } from '../auth'
import { Sigilo, useTitulo } from '../components/ui'

export default function LoginPage() {
  useTitulo('Entrar')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [q] = useSearchParams()
  const voltar = q.get('voltar')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(username.trim(), password)
      gravarLogin(res.data)
      navigate(voltar && voltar.startsWith('/') ? voltar : '/painel')
    } catch (err: any) {
      setError(msgErro(err, 'Erro ao conectar com o servidor.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pagina">
      <div className="painel login-caixa">
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <Sigilo tamanho={46} />
          <h1 style={{ fontSize: 30, marginTop: 6 }}>Entrar</h1>
          <p className="texto-2" style={{ fontSize: 16 }}>Use a mesma conta e senha do jogo.</p>
        </div>
        {q.get('expirou') && <div className="aviso aviso-info" style={{ marginBottom: 14 }}>Sua sessão expirou. Entre de novo.</div>}
        <form onSubmit={handleSubmit} className="pilha">
          <label className="campo"><span>Conta</span>
            <input className="entrada" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required autoFocus />
          </label>
          <label className="campo"><span>Senha</span>
            <input className="entrada" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
          </label>
          {error && <div className="aviso aviso-erro" role="alert">{error}</div>}
          <button className="btn" type="submit" disabled={loading} style={{ width: '100%' }}>{loading ? 'Entrando…' : 'Entrar'}</button>
        </form>
        <p className="discreto" style={{ textAlign: 'center', marginTop: 16 }}>Ainda não tem conta? <Link to="/criar-conta">Peça a sua</Link>.</p>
      </div>
    </div>
  )
}
