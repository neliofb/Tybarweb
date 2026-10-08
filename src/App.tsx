import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom'
import LoginPage      from './pages/LoginPage'
import DashboardPage  from './pages/DashboardPage'
import FactionsPage   from './pages/FactionsPage'
import WarPage        from './pages/WarPage'

// ── Estilos globais da barra de navegação ──────────────────────────────
const navStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #1e1a12 0%, #12100c 100%)',
  borderBottom: '1px solid #5a4a2a',
  padding: '10px 24px',
  display: 'flex',
  alignItems: 'center',
  gap: 24,
}
const brandStyle: React.CSSProperties = {
  color: '#c8a84b',
  fontSize: 20,
  fontWeight: 'bold',
  letterSpacing: 2,
  marginRight: 'auto',
  textDecoration: 'none',
}
const linkStyle: React.CSSProperties = {
  color: '#a09070',
  textDecoration: 'none',
  fontSize: 14,
  padding: '4px 10px',
  borderRadius: 4,
  transition: 'color .15s',
}
const activeLinkStyle: React.CSSProperties = {
  ...linkStyle,
  color: '#c8a84b',
  background: 'rgba(200,168,75,0.10)',
}

// ── Componente de rota protegida ──────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

// ── Navbar (só aparece quando logado) ────────────────────────────────
function Navbar() {
  const navigate  = useNavigate()
  const charName  = localStorage.getItem('charName') ?? ''
  const token     = localStorage.getItem('token')
  if (!token) return null

  function handleLogout() {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <nav style={navStyle}>
      <span style={brandStyle}>⚔ TYBAR</span>

      <NavLink to="/dashboard" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>
        Painel
      </NavLink>
      <NavLink to="/factions" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>
        Facções
      </NavLink>
      <NavLink to="/war" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>
        Guerra
      </NavLink>

      <span style={{ marginLeft: 'auto', color: '#7a6a4a', fontSize: 13 }}>
        {charName}
      </span>
      <button onClick={handleLogout} style={{
        background: 'transparent',
        border: '1px solid #5a4a2a',
        color: '#a09070',
        padding: '3px 10px',
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: 13,
      }}>
        Sair
      </button>
    </nav>
  )
}

// ── App principal ─────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/factions"  element={<ProtectedRoute><FactionsPage /></ProtectedRoute>} />
        <Route path="/war"       element={<ProtectedRoute><WarPage /></ProtectedRoute>} />
        <Route path="*"          element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
