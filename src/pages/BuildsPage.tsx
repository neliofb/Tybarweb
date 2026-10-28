import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getBuilds, getRegras } from '../api/site'
import BuildCard from '../components/BuildCard'
import { Busca, CabecalhoPagina, Carregando, Erro, useDados, useTitulo } from '../components/ui'

export default function BuildsPage() {
  useTitulo('Builds')
  const builds = useDados(() => getBuilds())
  const regras = useDados(getRegras)
  const [q, setQ] = useSearchParams()
  const tipo = q.get('tipo') ?? ''
  const caminho = q.get('caminho') ?? ''
  const texto = q.get('q') ?? ''
  const set = (k: string, v: string) => { const n = new URLSearchParams(q); if (v) n.set(k, v); else n.delete(k); setQ(n, { replace: true }) }

  const filtradas = useMemo(() => (builds.dados ?? [])
    .filter(b => !caminho || b.caminho === caminho)
    .filter(b => !texto || [b.nome, b.estilo, b.descricao, b.autor].join(' ').toLowerCase().includes(texto.toLowerCase())),
  [builds.dados, caminho, texto])
  const padrao = filtradas.filter(b => b.tipo === 'oficial')
  const comunidade = filtradas.filter(b => b.tipo === 'comunidade')

  return (
    <div className="pagina pagina-larga">
      <CabecalhoPagina sobre="Caminhos já trilhados" titulo="Builds">
        As <b>builds padrão</b> (oficiais) foram montadas pela staff para ajudar na criação; as <b>da comunidade</b>, pelos jogadores.
        Abra uma para ver a ficha completa ou começar a partir dela no simulador.
      </CabecalhoPagina>
      <div className="linha" style={{ marginBottom: 14 }}>
        <Busca valor={texto} mudar={v => set('q', v)} rotulo="Buscar por nome ou estilo" />
        <label className="campo" style={{ minWidth: 200 }}><span className="sr-only">Caminho</span>
          <select className="entrada" value={caminho} onChange={e => set('caminho', e.target.value)}>
            <option value="">Todos os caminhos</option>
            {regras.dados?.caminhos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </label>
        <Link to="/simulador" className="btn">Montar a minha</Link>
      </div>
      <div className="chips" role="group" aria-label="Tipo de build" style={{ marginBottom: 22 }}>
        {[['', 'Todas'], ['oficial', 'Builds padrão'], ['comunidade', 'Da comunidade']].map(([v, n]) => (
          <button key={v} className="chip" aria-pressed={tipo === v} onClick={() => set('tipo', v)}>{n}</button>
        ))}
      </div>
      {builds.carregando && <Carregando />}
      {builds.erro && <Erro erro={builds.erro} tentar={builds.carregar} />}
      {builds.dados && tipo !== 'comunidade' && (
        <section aria-labelledby="padrao-t" style={{ marginBottom: 40 }}>
          <h2 id="padrao-t" style={{ marginBottom: 6 }}>Builds padrão</h2>
          <p className="texto-2" style={{ marginBottom: 16 }}>Pontos de partida prontos: escolha um e ajuste no simulador.</p>
          {padrao.length ? <div className="grade grade-3">{padrao.map(b => <BuildCard key={b.id} b={b} r={regras.dados} extra={
            <Link className="btn btn-p" to={'/simulador?de=' + b.id}>Começar a partir desta</Link>} />)}</div>
            : <div className="vazio">Nenhuma build padrão com esses filtros.</div>}
        </section>
      )}
      {builds.dados && tipo !== 'oficial' && (
        <section aria-labelledby="comu-t">
          <h2 id="comu-t" style={{ marginBottom: 16 }}>Da comunidade</h2>
          {comunidade.length ? <div className="grade grade-3">{comunidade.map(b => <BuildCard key={b.id} b={b} r={regras.dados} />)}</div>
            : <div className="vazio">Nenhuma build da comunidade com esses filtros.</div>}
        </section>
      )}
    </div>
  )
}
