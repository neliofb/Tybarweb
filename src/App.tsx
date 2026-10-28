import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout, { SoLogado, SoStaff } from './components/Layout'
import { Carregando } from './components/ui'
import HomePage from './pages/HomePage'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const CodicePage = lazy(() => import('./pages/CodicePage'))
const CadastroPage = lazy(() => import('./pages/CadastroPage'))
const SimuladorPage = lazy(() => import('./pages/SimuladorPage'))
const BuildsPage = lazy(() => import('./pages/BuildsPage'))
const BuildDetalhePage = lazy(() => import('./pages/BuildDetalhePage'))
const MinhasBuildsPage = lazy(() => import('./pages/MinhasBuildsPage'))
const BestiarioPage = lazy(() => import('./pages/BestiarioPage'))
const OficiosPage = lazy(() => import('./pages/OficiosPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const FactionsPage = lazy(() => import('./pages/FactionsPage'))
const WarPage = lazy(() => import('./pages/WarPage'))
const PedidosPage = lazy(() => import('./pages/staff/PedidosPage'))
const JogadoresPage = lazy(() => import('./pages/staff/JogadoresPage'))
const BuildsOficiaisPage = lazy(() => import('./pages/staff/BuildsOficiaisPage'))

// As páginas antigas (Painel, Facções, Guerra) têm layout próprio: ficam numa moldura para não colar no cabeçalho
const Antiga = ({ children }: { children: JSX.Element }) => <div className="pagina pagina-larga">{children}</div>

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Carregando />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="entrar" element={<LoginPage />} />
            <Route path="login" element={<Navigate to="/entrar" replace />} />
            <Route path="codice" element={<CodicePage />} />
            <Route path="codice/:id" element={<CodicePage />} />
            <Route path="criar-conta" element={<CadastroPage />} />
            <Route path="cadastro" element={<Navigate to="/criar-conta" replace />} />
            <Route path="simulador" element={<SimuladorPage />} />
            <Route path="simulador/:buildId" element={<SimuladorPage />} />
            <Route path="builds" element={<BuildsPage />} />
            <Route path="builds/:id" element={<BuildDetalhePage />} />

            <Route path="painel" element={<SoLogado><Antiga><DashboardPage /></Antiga></SoLogado>} />
            <Route path="faccoes" element={<SoLogado><Antiga><FactionsPage /></Antiga></SoLogado>} />
            <Route path="guerra" element={<SoLogado><Antiga><WarPage /></Antiga></SoLogado>} />
            <Route path="bestiario" element={<SoLogado><BestiarioPage /></SoLogado>} />
            <Route path="oficios" element={<SoLogado><OficiosPage /></SoLogado>} />
            <Route path="minhas-builds" element={<SoLogado><MinhasBuildsPage /></SoLogado>} />

            <Route path="staff/pedidos" element={<SoStaff><PedidosPage /></SoStaff>} />
            <Route path="staff/jogadores" element={<SoStaff admin><JogadoresPage /></SoStaff>} />
            <Route path="staff/builds" element={<SoStaff><BuildsOficiaisPage /></SoStaff>} />

            {/* endereços antigos do portal */}
            <Route path="dashboard" element={<Navigate to="/painel" replace />} />
            <Route path="factions" element={<Navigate to="/faccoes" replace />} />
            <Route path="war" element={<Navigate to="/guerra" replace />} />
            <Route path="*" element={<div className="pagina"><h1>Página perdida</h1><p className="texto-2">Nenhum mapa leva até aqui.</p></div>} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
