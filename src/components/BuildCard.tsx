import { Link } from 'react-router-dom'
import type { Build, Regras } from '../api/site'
import { nomeDe, vocacaoTracoDe } from '../ficha'
import { Midia, Selo, fontesDe, fontesPovo } from './ui'

/** Arte da build: imagem própria, depois classes/<estilo ou id>.jpg, depois o povo */
export function fontesBuild(b: Build): string[] {
  const img = b.imagem ? [b.imagem.startsWith('/') || b.imagem.startsWith('http') ? b.imagem : '/media/' + b.imagem] : []
  return [...img, ...(b.estilo ? fontesDe('classes', b.estilo) : []), ...fontesDe('classes', b.id), ...(b.povo ? fontesPovo(b.povo) : [])]
}

/** "Vocação (linha) · Traço" da build, já convertendo o kit antigo */
export function rotuloVocacao(r: Regras | null | undefined, b: Build) {
  const vt = vocacaoTracoDe(r, b)
  const voc = r?.vocacoes.find(v => v.id === vt.vocacao)
  const linha = b.linha ? voc?.linhas.find(l => l.id === b.linha)?.nome : undefined
  return { vocacao: (voc?.nome ?? vt.vocacao ?? 'vocação a escolher') + (linha ? ` (${linha})` : ''), traco: nomeDe(r?.tracos, vt.traco), convertida: vt.convertida }
}

export default function BuildCard({ b, r, extra, semLink }: { b: Build; r?: Regras | null; extra?: React.ReactNode; semLink?: boolean }) {
  const fontes = fontesBuild(b)
  const rv = rotuloVocacao(r, b)
  const corpo = (
    <>
      <Midia fontes={fontes} alt="" rotulo={b.estilo || b.nome} />
      <div className="carta-build-corpo">
        <div className="linha" style={{ gap: 6 }}>
          <Selo tipo={b.tipo} />{b.emUso && <span className="selo selo-ok">Em uso</span>}
          {rv.convertida && <span className="selo" title="Feita no sistema antigo de kits; vocação e traço foram deduzidos.">Convertida do kit</span>}
        </div>
        <h3>{b.nome}</h3>
        {b.estilo && b.estilo !== b.nome && <div className="discreto" style={{ marginTop: -4 }}>{b.estilo}</div>}
        {b.descricao && <p>{b.descricao.length > 140 ? b.descricao.slice(0, 140) + '…' : b.descricao}</p>}
        <div className="carta-build-pe">
          <span>{nomeDe(r?.povos, b.povo)}</span>·<span>{nomeDe(r?.caminhos, b.caminho)}</span>·<span>{rv.vocacao}</span>·<span>{rv.traco}</span>
          {b.autor && <span style={{ marginLeft: 'auto' }}>por {b.autor}</span>}
        </div>
      </div>
    </>
  )
  return (
    <article className="painel carta-build">
      {semLink ? <div style={{ display: 'contents' }}>{corpo}</div>
        : <Link to={'/builds/' + b.id} style={{ textDecoration: 'none', color: 'inherit', display: 'contents' }}>{corpo}</Link>}
      {extra && <div className="linha" style={{ padding: '0 18px 16px' }}>{extra}</div>}
    </article>
  )
}
