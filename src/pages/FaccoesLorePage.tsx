import { Link } from 'react-router-dom'
import { CabecalhoPagina, useTitulo } from '../components/ui'
import { CartaoFaccao, LINKS_SITUACAO, Nota, Txt } from '../components/Lore'
import { FACCOES, INTRO_FACCOES } from '../data/faccoes'

// Casa Asanien, Véu do Rancor e Skaldgard ficam só nas páginas de Situação Atual (botões acima), não na lista de facções
export const DOS_POVOS = new Set(['casa-asanien', 'o-veu-do-rancor', 'grande-cla-skaldgard'])
const FACCOES_LISTADAS = FACCOES.filter(f => !DOS_POVOS.has(f.id))

export default function FaccoesLorePage() {
  useTitulo('Facções de Tybar')
  return (
    <div className="pagina pagina-larga">
      <CabecalhoPagina sobre="Lore · Ano 468" titulo="Facções de Tybar">
        <Txt t={INTRO_FACCOES.texto} />
      </CabecalhoPagina>
      <Nota texto={INTRO_FACCOES.nota} />
      <nav className="lore-atalhos" aria-label="Situação atual dos povos">
        {LINKS_SITUACAO.map(l => <Link key={l.to} to={l.to} className="btn btn-2">{l.rotulo}</Link>)}
      </nav>
      <div className="faccoes-grade">
        {FACCOES_LISTADAS.map(f => <CartaoFaccao key={f.id} id={f.id} />)}
      </div>
    </div>
  )
}
