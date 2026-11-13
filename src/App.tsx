import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout, { SoLogado, SoStaff } from './components/Layout'
import { Carregando } from './components/ui'
import HomePage from './pages/HomePage'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const CodicePage = lazy(() => import('./pages/CodicePage'))
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'))
const CadastroPage = lazy(() => import('./pages/CadastroPage'))
const SimuladorPage = lazy(() => import('./pages/SimuladorPage'))
const BuildsPage = lazy(() => import('./pages/BuildsPage'))
const BuildDetalhePage = lazy(() => import('./pages/BuildDetalhePage'))
const MinhasBuildsPage = lazy(() => import('./pages/MinhasBuildsPage'))
const BestiarioPage = lazy(() => import('./pages/BestiarioPage'))
const OficiosPage = lazy(() => import('./pages/OficiosPage'))
const TalentosPage = lazy(() => import('./pages/TalentosPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const FactionsPage = lazy(() => import('./pages/FactionsPage'))
const FaccoesLorePage = lazy(() => import('./pages/FaccoesLorePage'))
const FaccaoPage = lazy(() => import('./pages/FaccaoPage'))
const LoreSituacaoPage = lazy(() => import('./pages/LoreSituacaoPage'))
const WarPage = lazy(() => import('./pages/WarPage'))
const DungeonsStaffPage = lazy(() => import('./pages/staff/DungeonsStaffPage'))
const StaffHomePage = lazy(() => import('./pages/staff/StaffHomePage'))
const PedidosPage = lazy(() => import('./pages/staff/PedidosPage'))
const JogadoresPage = lazy(() => import('./pages/staff/JogadoresPage'))
const MapaPage = lazy(() => import('./pages/MapaPage'))
const FaunaStaffPage = lazy(() => import('./pages/staff/FaunaStaffPage'))
const LootStaffPage = lazy(() => import('./pages/staff/LootStaffPage'))
const ColetaStaffPage = lazy(() => import('./pages/staff/ColetaStaffPage'))
const VrarkStaffPage = lazy(() => import('./pages/staff/VrarkStaffPage'))
const EsfolarStaffPage = lazy(() => import('./pages/staff/EsfolarStaffPage'))
const MateriaisStaffPage = lazy(() => import('./pages/staff/MateriaisStaffPage'))
const CombateStaffPage = lazy(() => import('./pages/staff/CombateStaffPage'))
const EscreverLivroPage = lazy(() => import('./pages/EscreverLivroPage'))
const LivrosStaffPage = lazy(() => import('./pages/staff/LivrosStaffPage'))
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
            <Route path="features" element={<FeaturesPage />} />
            <Route path="navio" element={<Navigate to="/features#navio" replace />} />
            <Route path="codice/:id" element={<CodicePage />} />
            <Route path="criar-conta" element={<CadastroPage />} />
            <Route path="cadastro" element={<Navigate to="/criar-conta" replace />} />
            <Route path="simulador" element={<SimuladorPage />} />
            <Route path="simulador/:buildId" element={<SimuladorPage />} />
            <Route path="builds" element={<BuildsPage />} />
            <Route path="builds/:id" element={<BuildDetalhePage />} />
            <Route path="mapa" element={<MapaPage />} />
            <Route path="onde-upar" element={<Navigate to="/mapa?aba=upar" replace />} />
            {/* lore: facções e situação atual dos povos (texto final do Homebrewery, em src/data/faccoes.ts) */}
            <Route path="faccoes" element={<FaccoesLorePage />} />
            <Route path="faccoes/:id" element={<FaccaoPage />} />
            <Route path="lore" element={<Navigate to="/faccoes" replace />} />
            <Route path="lore/:id" element={<LoreSituacaoPage />} />

            <Route path="painel" element={<SoLogado><Antiga><DashboardPage /></Antiga></SoLogado>} />
            <Route path="faccoes-em-jogo" element={<SoLogado><Antiga><FactionsPage /></Antiga></SoLogado>} />
            <Route path="guerra" element={<SoLogado><Antiga><WarPage /></Antiga></SoLogado>} />
            <Route path="bestiario" element={<SoLogado><BestiarioPage /></SoLogado>} />
            <Route path="oficios" element={<SoLogado><OficiosPage /></SoLogado>} />
            <Route path="talentos" element={<TalentosPage />} />
            <Route path="staff/talentos" element={<SoStaff><TalentosPage staff /></SoStaff>} />
            <Route path="escrever-livro" element={<SoLogado><EscreverLivroPage /></SoLogado>} />
            <Route path="minhas-builds" element={<SoLogado><MinhasBuildsPage /></SoLogado>} />

            <Route path="staff" element={<SoStaff><StaffHomePage /></SoStaff>} />
            <Route path="staff/pedidos" element={<SoStaff><PedidosPage /></SoStaff>} />
            <Route path="staff/jogadores" element={<SoStaff admin><JogadoresPage /></SoStaff>} />
            <Route path="staff/livros" element={<SoStaff><LivrosStaffPage /></SoStaff>} />
            <Route path="staff/builds" element={<SoStaff><BuildsOficiaisPage /></SoStaff>} />
            <Route path="staff/combate" element={<SoStaff><CombateStaffPage /></SoStaff>} />
            <Route path="staff/dungeons" element={<SoStaff><DungeonsStaffPage /></SoStaff>} />
            <Route path="staff/materiais" element={<SoStaff><MateriaisStaffPage /></SoStaff>} />
            <Route path="staff/fauna" element={<SoStaff><FaunaStaffPage /></SoStaff>} />
            <Route path="staff/coleta" element={<SoStaff><ColetaStaffPage /></SoStaff>} />
            <Route path="staff/loot" element={<SoStaff><LootStaffPage /></SoStaff>} />
            <Route path="staff/esfolar" element={<SoStaff><EsfolarStaffPage /></SoStaff>} />
            <Route path="staff/vrark" element={<SoStaff><VrarkStaffPage /></SoStaff>} />

            {/* endereços antigos do portal */}
            <Route path="dashboard" element={<Navigate to="/painel" replace />} />
            <Route path="factions" element={<Navigate to="/faccoes-em-jogo" replace />} />
            <Route path="war" element={<Navigate to="/guerra" replace />} />
            <Route path="*" element={<div className="pagina"><h1>Página perdida</h1><p className="texto-2">Nenhum mapa leva até aqui.</p></div>} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
