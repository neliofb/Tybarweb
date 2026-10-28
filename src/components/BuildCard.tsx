import { Link } from 'react-router-dom'
import type { Build, Regras } from '../api/site'
import { nomeDe } from '../ficha'
import { Midia, Selo, fontesDe, fontesPovo } from './ui'

/** Arte da build: imagem própria, depois classes/<estilo ou id>.jpg, depois o povo */
export function fontesBuild(b: Build): string[] {
  const img = b.imagem ? [b.imagem.startsWith('/') || b.imagem.startsWith('http') ? b.imagem : '/media/' + b.imagem] : []
  return [...img, ...(b.estilo ? fontesDe('classes', b.estilo) : []), ...fontesDe('classes', b.id), ...(b.povo ? fontesPovo(b.povo) : [])]
}

export default function BuildCard({ b, r, extra }: { b: Build; r?: Regras | null; extra?: React.ReactNode }) {
  const fontes = fontesBuild(b)
  return (
    <article className="painel carta-build">
      <Link to={'/builds/' + b.id} style={{ textDecoration: 'none', color: 'inherit', display: 'contents' }}>
        <Midia fontes={fontes} alt="" rotulo={b.estilo || b.nome} />
        <div className="carta-build-corpo">
          <div className="linha" style={{ gap: 6 }}><Selo tipo={b.tipo} />{b.emUso && <span className="selo selo-ok">Em uso</span>}</div>
          <h3>{b.nome}</h3>
          {b.estilo && b.estilo !== b.nome && <div className="discreto" style={{ marginTop: -4 }}>{b.estilo}</div>}
          {b.descricao && <p>{b.descricao.length > 140 ? b.descricao.slice(0, 140) + '…' : b.descricao}</p>}
          <div className="carta-build-pe">
            <span>{nomeDe(r?.povos, b.povo)}</span>·<span>{nomeDe(r?.caminhos, b.caminho)}</span>·<span>{nomeDe(r?.kits, b.kit)}</span>
            {b.autor && <span style={{ marginLeft: 'auto' }}>por {b.autor}</span>}
          </div>
        </div>
      </Link>
      {extra && <div className="linha" style={{ padding: '0 18px 16px' }}>{extra}</div>}
    </article>
  )
}
