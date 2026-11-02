import { Link } from 'react-router-dom'
import { useSessao } from '../../auth'
import { CabecalhoPagina, useTitulo } from '../../components/ui'

const FERRAMENTAS: { to: string; nome: string; desc: string; admin?: boolean; externo?: boolean }[] = [
  { to: '/staff/pedidos', nome: 'Pedidos', desc: 'Aprovar ou recusar pedidos de conta.' },
  { to: '/staff/jogadores', nome: 'Contas e jogadores', desc: 'Contas, níveis e banimentos.', admin: true },
  { to: '/staff/builds', nome: 'Builds oficiais', desc: 'Builds sugeridas na página de builds.' },
  { to: 'http://localhost:8765', externo: true, nome: 'Sala de Guerra', desc: 'Painel dos agentes (só no PC do dono).' },
  { to: '/staff/combate', nome: 'Registro de combate', desc: 'Dano, cura, acerto e crítico por classe, arma, armadura e magia.' },
  { to: '/staff/fauna', nome: 'Fauna', desc: 'Zonas de criaturas, faixas de perícia e biomas.' },
  { to: '/staff/coleta', nome: 'Coleta', desc: 'Recursos de mineração, lenha e coleta.' },
  { to: '/staff/loot', nome: 'Loot', desc: 'Tabelas de loot das criaturas.' },
  { to: '/staff/esfolar', nome: 'Esfolar', desc: 'O que cada criatura rende ao esfolar.' },
  { to: '/mapa?aba=criaturas', nome: 'Mapa de criaturas', desc: 'Onde cada criatura nasce, com números da staff.' },
]

export default function StaffHomePage() {
  useTitulo('Staff')
  const s = useSessao()
  return (
    <div className="pagina">
      <CabecalhoPagina sobre="Staff" titulo="Ferramentas">Escolha a ferramenta. Tudo o que for salvo vale no jogo na hora.</CabecalhoPagina>
      <div className="grade grade-3">
        {FERRAMENTAS.filter(f => !f.admin || s.admin).map(f => f.externo ? (
          <a key={f.to} href={f.to} target="_blank" rel="noreferrer" className="painel painel-fino" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <h3 style={{ margin: '0 0 6px' }}>{f.nome}</h3>
            <p className="discreto" style={{ margin: 0 }}>{f.desc}</p>
          </a>
        ) : (
          <Link key={f.to} to={f.to} className="painel painel-fino" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <h3 style={{ margin: '0 0 6px' }}>{f.nome}</h3>
            <p className="discreto" style={{ margin: 0 }}>{f.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
