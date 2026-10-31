import { Link, useParams } from 'react-router-dom'
import { useTitulo } from '../components/ui'
import { Blocos, CartaoFaccao, LINKS_SITUACAO, Nota, RetratoFaccao, Secoes } from '../components/Lore'
import { LORE } from '../data/faccoes'

// Situação Atual de um povo (/lore/thuria, /lore/asan): história recente, personagens e as facções ligadas.
export default function LoreSituacaoPage() {
  const { id } = useParams()
  const p = LORE.find(l => l.id === id)
  useTitulo(p ? p.titulo.split(' — ')[0] + ' — Situação atual' : 'Lore')
  if (!p) return (
    <div className="pagina">
      <h1>Registro perdido</h1>
      <p className="texto-2"><Link to="/faccoes">Voltar às facções</Link>.</p>
    </div>
  )
  const [nome, sub] = p.titulo.split(' — ')
  const outro = LINKS_SITUACAO.find(l => !l.to.endsWith('/' + p.id))

  return (
    <div className="pagina pagina-larga lore-pagina">
      <nav className="lore-trilha" aria-label="Trilha"><Link to="/faccoes">Facções</Link> <span aria-hidden="true">›</span> Situação atual</nav>
      <header className="faccao-topo">
        <div className="faccao-topo-texto">
          <div className="sobretitulo">Situação atual · Ano 468</div>
          <h1>{nome}</h1>
          {sub && <blockquote className="faccao-lema">{sub}</blockquote>}
          {p.nota && <Nota texto={p.nota} />}
        </div>
        {p.imagem && <RetratoFaccao src={p.imagem} alt={'Ilustração: ' + nome} className="faccao-topo-img" />}
      </header>

      <div className="faccao-corpo">
        {p.capitulos.map((c, i) => (
          <section key={i} className="lore-capitulo">
            {c.titulo && <h2>{c.titulo}</h2>}
            <Blocos blocos={c.intro} />
            <Secoes secoes={c.secoes} />
            {c.notas.map((n, k) => <Nota key={k} texto={n} />)}
          </section>
        ))}
      </div>

      <section className="lore-capitulo">
        <h2>Facções ligadas</h2>
        <div className="faccoes-grade">
          {p.faccoes.map(fid => <CartaoFaccao key={fid} id={fid} />)}
        </div>
      </section>
      <nav className="lore-atalhos" aria-label="Leia também">
        <Link to="/faccoes" className="btn btn-2">Todas as facções</Link>
        {outro && <Link to={outro.to} className="btn btn-2">{outro.rotulo}</Link>}
      </nav>
    </div>
  )
}
