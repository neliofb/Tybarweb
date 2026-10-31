import { Fragment, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Bloco, Secao, FACCOES } from '../data/faccoes'

// Marcação inline vinda do texto da lore: **negrito** e *itálico*. Gera elementos (sem HTML cru).
export function Txt({ t }: { t: string }) {
  const partes: ReactNode[] = []
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g
  let ultimo = 0, m: RegExpExecArray | null, k = 0
  while ((m = re.exec(t))) {
    if (m.index > ultimo) partes.push(t.slice(ultimo, m.index))
    partes.push(m[1] != null ? <strong key={k++}>{m[1]}</strong> : <em key={k++}>{m[2]}</em>)
    ultimo = re.lastIndex
  }
  if (ultimo < t.length) partes.push(t.slice(ultimo))
  return <>{partes}</>
}

export function Nota({ texto }: { texto: string }) {
  return (
    <aside className="lore-nota">
      {texto.split('\n').map((l, i) => <p key={i}><Txt t={l} /></p>)}
    </aside>
  )
}

export function Blocos({ blocos }: { blocos: Bloco[] }) {
  const out: ReactNode[] = []
  let i = 0
  while (i < blocos.length) {
    const b = blocos[i]
    if (b.t === 'p') { out.push(<p key={i} className="lore-p"><Txt t={b.texto} /></p>); i++; continue }
    if (b.t === 'campo') {
      const grupo: Extract<Bloco, { t: 'campo' }>[] = []
      const ini = i
      while (i < blocos.length && blocos[i].t === 'campo') grupo.push(blocos[i++] as Extract<Bloco, { t: 'campo' }>)
      out.push(
        <dl key={ini} className="lore-campos">
          {grupo.map((c, j) => (
            <Fragment key={j}><dt>{c.rotulo}</dt><dd><Txt t={c.texto} /></dd></Fragment>
          ))}
        </dl>,
      )
      continue
    }
    const grupo: Extract<Bloco, { t: 'pessoa' }>[] = []
    const ini = i
    while (i < blocos.length && blocos[i].t === 'pessoa') grupo.push(blocos[i++] as Extract<Bloco, { t: 'pessoa' }>)
    out.push(
      <div key={ini} className="lore-pessoas">
        {grupo.map((p, j) => (
          <article key={j} className="lore-pessoa">
            <h4>{p.nome}</h4>
            {p.titulo && <div className="lore-pessoa-titulo">{p.titulo}</div>}
            <p><Txt t={p.texto} /></p>
          </article>
        ))}
      </div>,
    )
  }
  return <>{out}</>
}

export function Secoes({ secoes }: { secoes: Secao[] }) {
  return (
    <>
      {secoes.map((s, i) => (
        <section key={i} className="lore-secao">
          <h3>{s.titulo}</h3>
          <Blocos blocos={s.blocos} />
        </section>
      ))}
    </>
  )
}

export function RetratoFaccao({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={'lore-retrato ' + (className ?? '')}>
      <img src={src} alt={alt} loading="lazy" decoding="async" />
    </div>
  )
}

export function CartaoFaccao({ id }: { id: string }) {
  const f = FACCOES.find(x => x.id === id)
  if (!f) return null
  return (
    <Link to={'/faccoes/' + f.id} className={'faccao-card' + (f.oculta ? ' faccao-oculta' : '')}>
      <div className="faccao-card-img">
        {f.imagem ? <img src={f.imagem} alt="" loading="lazy" decoding="async" /> : <div className="faccao-card-vazio" aria-hidden="true">?</div>}
        {f.oculta && <span className="faccao-tarja">Oculta</span>}
        {f.extinta && <span className="faccao-tarja faccao-tarja-extinta">Extinta</span>}
      </div>
      <div className="faccao-card-corpo">
        <h3>{f.nome}</h3>
        {f.lema && <p className="faccao-card-lema">{f.lema.replace(/^"|"$/g, '')}</p>}
      </div>
    </Link>
  )
}

export const LINKS_SITUACAO = [
  { to: '/lore/thuria', rotulo: 'Situação atual de Thuria' },
  { to: '/lore/asan', rotulo: 'Situação atual dos Asanitas' },
]
