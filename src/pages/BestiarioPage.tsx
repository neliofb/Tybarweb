import { useMemo, useState } from 'react'
import { getBestiario, Criatura } from '../api/site'
import { Busca, CabecalhoPagina, Carregando, Erro, useDados, useTitulo } from '../components/ui'

const RES = ['Físico', 'Fogo', 'Frio', 'Veneno', 'Energia']
const nomeDe = (c: Criatura) => c.pt || c.nome.replace(/^(a|an|the) /i, '')

export default function BestiarioPage() {
  useTitulo('Bestiário')
  const d = useDados(getBestiario)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<'' | 'domavel' | 'montaria' | 'custom'>('')
  const [ordem, setOrdem] = useState<'nome' | 'vida' | 'domar'>('nome')
  const [aberta, setAberta] = useState<string | null>(null)

  const todas: Criatura[] = useMemo(() => d.dados ?? [], [d.dados])
  const lista = useMemo(() => {
    const t = busca.toLowerCase()
    return todas
      .filter(c => !t || (nomeDe(c) + ' ' + c.nome + ' ' + (c.onde ?? []).join(' ')).toLowerCase().includes(t))
      .filter(c => !filtro || c[filtro])
      .sort((a, b) => ordem === 'nome' ? nomeDe(a).localeCompare(nomeDe(b)) : ((b[ordem] ?? -999) - (a[ordem] ?? -999)))
  }, [todas, busca, filtro, ordem])

  return (
    <div className="pagina pagina-larga">
      <CabecalhoPagina sobre="Jogador" titulo="Bestiário de Tybar">
        As criaturas do mundo com os números do jogo: vida, dano, resistências, onde vivem e o que rendem.
      </CabecalhoPagina>
      <div className="linha" style={{ marginBottom: 12 }}>
        <Busca valor={busca} mudar={setBusca} rotulo="Buscar criatura ou região" />
        <label className="campo"><span className="sr-only">Ordenar</span>
          <select className="entrada" value={ordem} onChange={e => setOrdem(e.target.value as typeof ordem)}>
            <option value="nome">Ordem: nome</option><option value="vida">Mais vida</option><option value="domar">Mais difícil de domar</option>
          </select>
        </label>
      </div>
      <div className="chips" role="group" aria-label="Filtros" style={{ marginBottom: 20 }}>
        {([['', 'Todas'], ['domavel', 'Domáveis'], ['montaria', 'Montarias'], ['custom', 'Exclusivas do Tybar']] as const).map(([v, n]) => (
          <button key={v} className="chip" aria-pressed={filtro === v} onClick={() => setFiltro(v)}>{n}</button>
        ))}
      </div>
      {d.carregando && <Carregando />}
      {d.erro && <Erro erro={d.erro} tentar={d.carregar} />}
      {d.dados && <p className="discreto" style={{ marginBottom: 12 }} aria-live="polite">{lista.length} de {todas.length} criaturas</p>}
      <div className="grade grade-2">
        {lista.map(c => {
          const aberto = aberta === c.tipo
          return (
            <article key={c.tipo} className="painel painel-fino">
              <div className="besta">
                <div className="besta-fig">{c.img ? <img src={c.img} alt="" /> : <span className="titulo" style={{ fontSize: 30, color: 'var(--ouro-escuro)' }}>{nomeDe(c)[0]}</span>}</div>
                <div>
                  <h3 style={{ fontSize: 18, marginBottom: 2 }}>{nomeDe(c)}</h3>
                  <div className="linha" style={{ gap: 6 }}>
                    {c.custom && <span className="selo selo-oficial">Tybar</span>}
                    {c.domavel && <span className="selo selo-ok">Domável{c.domar != null ? ` · ${c.domar}` : ''}</span>}
                    {c.montaria && <span className="selo selo-comunidade">Montaria</span>}
                  </div>
                  <div className="stats">
                    <div className="stat"><b>{c.vida ?? '—'}</b><small>Vida</small></div>
                    <div className="stat"><b>{c.dmin ?? '?'}–{c.dmax ?? '?'}</b><small>Dano</small></div>
                    <div className="stat"><b>{c.armadura ?? 0}</b><small>Armadura</small></div>
                    <div className="stat"><b>{c.str ?? '—'}/{c.dex ?? '—'}/{c.int ?? '—'}</b><small>F/D/I</small></div>
                  </div>
                </div>
              </div>
              <button className="btn-link" style={{ marginTop: 10, fontSize: 15 }} aria-expanded={aberto} onClick={() => setAberta(aberto ? null : c.tipo)}>{aberto ? 'Menos detalhes' : 'Mais detalhes'}</button>
              {aberto && (
                <div style={{ marginTop: 10, fontSize: 16 }}>
                  {c.res && <div className="stats">{c.res.map((v, i) => <div key={i} className="stat"><b>{v}%</b><small>{RES[i]}</small></div>)}</div>}
                  <ul className="resumo-lista" style={{ marginTop: 10 }}>
                    {!!c.onde?.length && <li><span>Onde vive</span><span>{c.onde.join(', ')}</span></li>}
                    {c.comida && <li><span>Come</span><span>{c.comida}</span></li>}
                    {(c.carne || c.couro) ? <li><span>Rende</span><span>{c.carne ? `${c.carne} carne` : ''}{c.carne && c.couro ? ', ' : ''}{c.couro ? `${c.couro} couro (${c.tipocouro})` : ''}</span></li> : null}
                    {c.vagas != null && c.domavel && <li><span>Vagas de seguidor</span><span>{c.vagas}</span></li>}
                    {c.fama != null && <li><span>Fama</span><span>{c.fama}</span></li>}
                  </ul>
                </div>
              )}
            </article>
          )
        })}
      </div>
      {d.dados && !lista.length && <div className="vazio">Nenhuma criatura encontrada.</div>}
    </div>
  )
}
