import { Link, useParams } from 'react-router-dom'
import { useTitulo } from '../components/ui'
import { Blocos, LINKS_SITUACAO, Nota, RetratoFaccao, Secoes } from '../components/Lore'
import { FACCOES, LORE } from '../data/faccoes'

export default function FaccaoPage() {
  const { id } = useParams()
  const i = FACCOES.findIndex(f => f.id === id)
  const f = FACCOES[i]
  useTitulo(f ? f.nome : 'Facção')
  if (!f) return (
    <div className="pagina">
      <h1>Facção desconhecida</h1>
      <p className="texto-2">Nenhum registro com esse nome. <Link to="/faccoes">Voltar às facções</Link>.</p>
    </div>
  )
  const ant = FACCOES[(i - 1 + FACCOES.length) % FACCOES.length]
  const prox = FACCOES[(i + 1) % FACCOES.length]
  const situacao = LORE.filter(l => l.faccoes.includes(f.id))
  const linkSit = (lid: string) => LINKS_SITUACAO.find(x => x.to.endsWith('/' + lid))

  return (
    <div className={'pagina pagina-larga faccao-pagina' + (f.oculta ? ' faccao-pagina-oculta' : '')}>
      <nav className="lore-trilha" aria-label="Trilha"><Link to="/faccoes">Facções</Link> <span aria-hidden="true">›</span> {f.nome}</nav>
      <header className="faccao-topo">
        <div className="faccao-topo-texto">
          <div className="sobretitulo">
            {f.oculta ? 'Facção oculta' : f.extinta ? 'Facção extinta' : 'Facção'} · Ano 468
          </div>
          <h1>{f.nome}</h1>
          {f.lema && <blockquote className="faccao-lema">{f.lema}</blockquote>}
          {(f.lider || f.sede) && (
            <div className="faccao-resumo">
              {f.lider && <div><span>Líder</span>{f.lider}</div>}
              {f.sede && <div><span>Sede</span>{f.sede}</div>}
            </div>
          )}
          {f.oculta && <p className="faccao-aviso">Ninguém em Tybar admite que este nome exista. O que segue é registro de quem o caça.</p>}
        </div>
        {f.imagem
          ? <RetratoFaccao src={f.imagem} alt={'Ilustração: ' + f.nome} className="faccao-topo-img" />
          : <div className="lore-retrato faccao-topo-img faccao-sem-imagem" aria-hidden="true"><span>?</span></div>}
      </header>

      {f.notas.length > 0 && f.oculta && <Nota texto={f.notas[0]} />}
      {f.intro.length > 0 && <Blocos blocos={f.intro} />}

      <div className="faccao-corpo">
        <Secoes secoes={f.secoes} />
        {f.historias.length > 0 && (
          <section className="faccao-historias">
            <h2>Histórias Atuais</h2>
            <Secoes secoes={f.historias} />
          </section>
        )}
        {f.notas.filter((_, k) => !(f.oculta && k === 0)).map((n, k) => <Nota key={k} texto={n} />)}
      </div>

      {situacao.length > 0 && (
        <nav className="lore-atalhos" aria-label="Leia também">
          {situacao.map(s => { const l = linkSit(s.id); return l && <Link key={s.id} to={l.to} className="btn btn-2">{l.rotulo}</Link> })}
        </nav>
      )}
      <nav className="lore-paginacao" aria-label="Outras facções">
        <Link to={'/faccoes/' + ant.id}>‹ {ant.nome}</Link>
        <Link to="/faccoes">Todas as facções</Link>
        <Link to={'/faccoes/' + prox.id}>{prox.nome} ›</Link>
      </nav>
    </div>
  )
}
