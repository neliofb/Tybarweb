import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getMapaFauna, biomaEm, zonasEm, ROTULO_HORARIO, Aparicao, Horario } from '../api/fauna'
import MapaFauna, { corDoTipo, ListaMarcavel } from '../components/MapaFauna'
import OndeUpar from './OndeUpar'
import { CabecalhoPagina, Carregando, Erro, useDados, useTitulo } from '../components/ui'

interface Item { tipo: string; nome: string; horarios: Set<Horario>; perigoso: boolean; climas: Set<string> }

function juntar(lista: Aparicao[]): Item[] {
  const m = new Map<string, Item>()
  for (const a of lista) {
    const i = m.get(a.tipo) ?? { tipo: a.tipo, nome: a.nome, horarios: new Set(), perigoso: false, climas: new Set() }
    i.horarios.add(a.horario); i.perigoso ||= a.perigoso
    if (a.clima) i.climas.add(a.clima)
    m.set(a.tipo, i)
  }
  return [...m.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt'))
}
function textoHorario(h: Set<Horario>) {
  if (h.has('sempre') || (h.has('dia') && h.has('noite'))) return ROTULO_HORARIO.sempre
  return h.has('dia') ? ROTULO_HORARIO.dia : ROTULO_HORARIO.noite
}

export default function MapaPage({ abaInicial }: { abaInicial?: 'criaturas' | 'upar' }) {
  const [busca, setBusca] = useSearchParams()
  const aba = (busca.get('aba') as 'criaturas' | 'upar' | null) ?? abaInicial ?? 'criaturas'
  useTitulo(aba === 'upar' ? 'Onde upar' : 'Mapa da fauna')
  const d = useDados(getMapaFauna)
  const m = d.dados
  // nada desenhado de início: o jogador marca o que quer ver
  const [visBiomas, setVisBiomas] = useState<Set<number>>(new Set())
  const [visZonas, setVisZonas] = useState<Set<string>>(new Set())
  const [filtro, setFiltro] = useState('')
  const [ponto, setPonto] = useState<{ x: number; y: number } | null>(null)

  const destaque = useMemo(() => {
    if (!m || !filtro) return null
    return {
      biomas: new Set(m.biomas.filter(b => b.criaturas.some(c => c.tipo === filtro)).map(b => b.id)),
      zonas: new Set(m.zonas.filter(z => z.criatura === filtro).map(z => z.id)),
    }
  }, [m, filtro])

  const aqui = useMemo(() => {
    if (!m || !ponto) return null
    const b = biomaEm(m, ponto.x, ponto.y)
    const zs = zonasEm(m, ponto.x, ponto.y)
    const lista: Aparicao[] = [...(b?.criaturas ?? []), ...zs.map(z => ({ tipo: z.criatura, nome: z.nomeCriatura, horario: z.horario, perigoso: z.perigoso, clima: z.clima }))]
    return { bioma: b, zonas: zs, itens: juntar(lista) }
  }, [m, ponto])

  const nomeFiltro = m?.criaturas.find(c => c.tipo === filtro)?.nome
  // escolher uma criatura marca os biomas e zonas onde ela vive
  useEffect(() => { if (destaque) { setVisBiomas(new Set(destaque.biomas)); setVisZonas(new Set(destaque.zonas)) } }, [destaque])
  const abas = (
    <div className="abas-mapa" role="tablist" aria-label="Mapa">
      <button role="tab" aria-selected={aba === 'criaturas'} onClick={() => setBusca({})}>Criaturas</button>
      <button role="tab" aria-selected={aba === 'upar'} onClick={() => setBusca({ aba: 'upar' })}>Onde upar</button>
    </div>
  )
  if (aba === 'upar') return (
    <div className="pagina pagina-larga">
      <CabecalhoPagina sobre="Mundo" titulo="Onde upar">
        Cada região de Felucca é feita para uma faixa de perícia de combate: os monstros que nascem ali lutam nesse patamar. Escolha a sua perícia e veja onde vale a pena caçar.
      </CabecalhoPagina>
      {abas}
      {d.carregando && <Carregando />}
      {d.erro && <Erro erro={d.erro} tentar={d.carregar} />}
      {m && <OndeUpar mapa={m} />}
    </div>
  )

  return (
    <div className="pagina pagina-larga">
      <CabecalhoPagina sobre="Mundo" titulo="Mapa da fauna">
        Onde cada criatura vive em Felucca. Marque na lista os biomas e zonas que quer ver, toque num lugar do mapa para ver o que aparece ali, ou escolha uma criatura para ver onde encontrá-la.
      </CabecalhoPagina>
      {abas}
      {d.carregando && <Carregando />}
      {d.erro && <Erro erro={d.erro} tentar={d.carregar} />}
      {m && (
        <div className="mapa-layout">
          <div>
            <div className="linha" style={{ marginBottom: 10, gap: 10 }}>
              <label className="campo" style={{ flex: 1, minWidth: 220 }}>
                <span className="sr-only">Onde encontro…</span>
                <select className="entrada" value={filtro} onChange={e => setFiltro(e.target.value)}>
                  <option value="">Onde encontro… (todas as criaturas)</option>
                  {m.criaturas.map(c => <option key={c.tipo} value={c.tipo}>{c.nome}</option>)}
                </select>
              </label>
            </div>
            <MapaFauna
              mapa={m} rotulo="Mapa da fauna de Felucca"
              biomasVisiveis={visBiomas} zonasVisiveis={visZonas}
              biomasDestaque={destaque?.biomas} zonasDestaque={destaque?.zonas}
              aoTocar={(x, y) => setPonto({ x, y })}
            >
              {s => ponto && (
                <g>
                  <circle cx={ponto.x + .5} cy={ponto.y + .5} r={9 / s} fill="none" stroke="#000" strokeWidth={4 / s} />
                  <circle cx={ponto.x + .5} cy={ponto.y + .5} r={9 / s} fill="none" stroke="#ecd38a" strokeWidth={2 / s} />
                </g>
              )}
            </MapaFauna>
            {filtro && destaque && (
              <p className="discreto" aria-live="polite" style={{ marginTop: 8 }}>
                {nomeFiltro}: {destaque.biomas.size ? `${destaque.biomas.size} bioma(s)` : 'nenhum bioma'}
                {destaque.zonas.size ? ` e ${destaque.zonas.size} zona(s) marcada(s)` : ''} em destaque.{' '}
                <button className="btn-link" onClick={() => setFiltro('')}>Limpar</button>
              </p>
            )}
          </div>

          <aside className="mapa-lateral">
            <section className="painel painel-fino" aria-live="polite">
              {!aqui ? (
                <>
                  <h3>O que vive aqui?</h3>
                  <p className="texto-2">Toque ou clique num lugar do mapa. No teclado: foque o mapa, mova com as setas e aperte Enter.</p>
                </>
              ) : (
                <>
                  <div className="discreto">x {ponto!.x}, y {ponto!.y}</div>
                  <h3>{aqui.bioma?.nome ?? (aqui.zonas.length ? 'Zona marcada' : 'Sem fauna conhecida')}</h3>
                  {aqui.zonas.length > 0 && <p className="discreto" style={{ marginBottom: 8 }}>Também: {aqui.zonas.map(z => z.nome || z.nomeCriatura).filter((v, i, a) => a.indexOf(v) === i).join(', ')}</p>}
                  {aqui.itens.length === 0 ? <p className="texto-2">Nada costuma aparecer neste ponto (mar, cidade ou lugar sem fauna).</p> : (
                    <ul className="lista-fauna">
                      {aqui.itens.map(i => (
                        <li key={i.tipo}>
                          <button className="btn-link" style={{ textDecoration: 'none', textAlign: 'left' }} onClick={() => setFiltro(i.tipo)} title="Ver onde mais aparece">
                            <span className="ponto-cor" style={{ background: corDoTipo(i.tipo) }} aria-hidden="true" />{i.nome}
                          </button>
                          <span className="linha" style={{ gap: 4 }}>
                            <span className="selo selo-neutro">{textoHorario(i.horarios)}</span>
                            {i.perigoso ? <span className="selo selo-mal">Perigoso</span> : <span className="selo selo-ok">Pacífico</span>}
                            {[...i.climas].map(c => <span key={c} className="selo selo-pendente">Com {c}</span>)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </section>
            <section className="painel painel-fino">
              <ListaMarcavel titulo="Biomas" itens={m.biomas.map(b => ({ id: b.id, nome: b.nome, cor: b.cor }))} marcados={visBiomas} mudar={setVisBiomas} />
            </section>
            <section className="painel painel-fino">
              <ListaMarcavel titulo="Zonas" itens={m.zonas.map(z => ({ id: z.id, nome: (z.nome || z.nomeCriatura), cor: corDoTipo(z.criatura) }))} marcados={visZonas} mudar={setVisZonas} />
              <p className="discreto" style={{ marginTop: 8 }}>As zonas são áreas onde uma criatura específica vive além do bioma.</p>
            </section>
          </aside>
        </div>
      )}
    </div>
  )
}
