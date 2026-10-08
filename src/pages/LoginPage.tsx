import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/client'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(username.trim(), password)
      const { token, charName, factionId, factionRole, isGM } = res.data
      localStorage.setItem('token',       token)
      localStorage.setItem('charName',    charName)
      localStorage.setItem('factionId',   String(factionId))
      localStorage.setItem('factionRole', factionRole)
      localStorage.setItem('isGM',        String(isGM))
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Erro ao conectar com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, #1e1a12 0%, #0a0806 100%)',
    }}>
      <div style={{
        width: 360,
        background: 'rgba(20,16,10,0.95)',
        border: '1px solid #5a4a2a',
        borderRadius: 8,
        padding: 40,
        boxShadow: '0 8px 40px rgba(0,0,0,.8)',
      }}>
        {/* Logo / título */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 4 }}>⚔</div>
          <h1 style={{ color: '#c8a84b', fontSize: 26, letterSpacing: 4, fontWeight: 'bold' }}>
            TYBAR
          </h1>
          <p style={{ color: '#7a6a4a', fontSize: 13, marginTop: 4 }}>Portal do Jogador</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Conta</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Nome da conta"
              required
              autoFocus
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Senha do jogo"
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(180,40,40,0.15)',
              border: '1px solid #8b2020',
              borderRadius: 4,
              padding: '8px 12px',
              color: '#e07070',
              fontSize: 13,
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 0',
              background: loading ? '#3a2e18' : 'linear-gradient(180deg, #8b6914 0%, #6b4f10 100%)',
              border: '1px solid #c8a84b',
              borderRadius: 4,
              color: '#f0dda0',
              fontSize: 15,
              fontFamily: 'Georgia, serif',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: 1,
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ color: '#4a3a22', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
          Use o mesmo login e senha do jogo
        </p>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#8a7a5a',
  fontSize: 12,
  marginBottom: 6,
  letterSpacing: 1,
  textTransform: 'uppercase',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  background: '#0e0c08',
  border: '1px solid #3a2e18',
  borderRadius: 4,
  color: '#d4c5a9',
  fontSize: 14,
  fontFamily: 'Georgia, serif',
  outline: 'none',
}
