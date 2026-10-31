import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getRegras, getBuild, getBuilds, criarBuild, salvarBuild, msgErro, Regras, Build, BuildEntrada } from '../api/site'
import { useSessao } from '../auth'
import BuildCard from '../components/BuildCard'
import { CabecalhoPagina, Carregando, Erro, Midia, fontesPovo, fontesDe, videoPovo, useDados, useTitulo } from '../components/ui'
import { custoPericia, pontosGastos, pontosTotais, tiersDe, kitPermitido, nomeDe, problemas, maxPrimarias, contaPrimarias } from '../ficha'

type Rascunho = Partial<BuildEntrada> & { pericias: Record<string, number>; atributos: { str: number; dex: number; int: number } }
const ETAPAS = ['Ponto de partida', 'Povo', 'Caminho', 'Kit', 'Atributos', 'Perícias', 'Resumo'] as const
const CHAVE = 'tybar-rascunho-build'

function novo(r?: Regras): Rascunho {
  const b = r?.pontos.atributoBase ?? 30
  return { nome: '', descricao: '', pericias: {}, atributos: { str: b, dex: b, int: b } }
}

function Opcao({ ativo, onClick, titulo, texto, fontes, desab, video }: { ativo: boolean; onClick: () => void; titulo: string; texto?: string; fontes?: string[]; desab?: boolean; video?: string }) {
  const v = useRef<HTMLVideoElement>(null)
  const [semVideo, setSemVideo] = useState(false)
  const [sobre, setSobre] = useState(false)
  const tocar = ativo || sobre
  useEffect(() => {
    const el = v.current
    if (!el) return
    if (tocar) el.play().catch(() => { /* sem vídeo ou bloqueado */ })
    else { el.pause() }
  }, [tocar])
  return (
    <button type="button" className={'opcao' + (fontes ? '' : ' opcao-sem-arte')} aria-pressed={ativo} onClick={onClick} disabled={desab}
      onMouseEnter={() => setSobre(true)} onMouseLeave={() => setSobre(false)} onFocus={() => setSobre(true)} onBlur={() => setSobre(false)}>
      {fontes && (
        <div style={{ position: 'relative' }}>
          <Midia fontes={fontes} alt="" rotulo={titulo} />
          {video && !semVideo && (
            <video ref={v} src={video} preload="none" muted loop playsInline aria-hidden="true" onError={() => setSemVideo(true)}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: tocar ? 1 : 0, transition: 'opacity .4s' }} />
          )}
        </div>
      )}
      <div className="opcao-corpo"><h4>{titulo}</h4>{texto && <p>{texto}</p>}</div>
    </button>
  )
}

export default function SimuladorPage() {
  const { buildId } = useParams()
  const [q] = useSearchParams()
  const de = q.get('de')
  const s = useSessao()
  const navigate = useNavigate()
  const regras = useDados(getRegras)
  const padrao = useDados(() => getBuilds('oficial'))
  const r = regras.dados
  const [etapa, setEtapa] = useState(0)
  const [b, setB] = useState<Rascunho>(() => {
    if (buildId || de) return novo()
    try { const x = JSON.parse(localStorage.getItem(CHAVE) ?? ''); if (x?.pericias) return x } catch { /* sem rascunho */ }
    return novo()
  })
  const [aberta, setAberta] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const [original, setOriginal] = useState<Build | null>(null)
  const [oficial, setOficial] = useState(false)
  useTitulo(buildId ? 'Editar build' : 'Simulador de personagem')

  // Carrega a build para editar (/simulador/:id) ou para copiar (?de=id)
  useEffect(() => {
    const id = buildId ?? de
    if (!id) return
    getBuild(id).then(res => {
      const x = res.data
      if (buildId) { setOriginal(x); setOficial(x.tipo === 'oficial') }
      setB({
        nome: buildId ? x.nome : x.nome + ' (cópia)', descricao: x.descricao ?? '', povo: x.povo, vantagem: x.vantagem, caminho: x.caminho,
        kit: x.kit, estilo: x.estilo, imagem: buildId ? x.imagem : undefined, comoJoga: buildId ? x.comoJoga : undefined, porque: buildId ? x.porque : undefined, pericias: { ...(x.pericias ?? {}) }, atributos: x.atributos ?? novo(r ?? undefined).atributos,
      })
      setEtapa(6)
    }).catch(e => setMsg({ ok: false, t: msgErro(e) }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildId, de])

  useEffect(() => { if (!buildId) try { localStorage.setItem(CHAVE, JSON.stringify(b)) } catch { /* cheio */ } }, [b, buildId])

  const tiers = r ? tiersDe(r) : []
  const total = r ? pontosTotais(r, b.kit, b.vantagem) : 0
  const gastos = r ? pontosGastos(r, b.pericias, b.caminho, b.kit) : 0
  const resta = total - gastos
  const probs = r ? problemas(r, b) : []

  const grupos = useMemo(() => {
    if (!r) return []
    const g: Record<string, typeof r.pericias> = {}
    for (const p of r.pericias) (g[p.grupo] ??= []).push(p)
    return Object.entries(g)
  }, [r])

  if (regras.carregando) return <div className="pagina"><Carregando texto="Lendo as regras da ficha…" /></div>
  if (regras.erro || !r) return <div className="pagina"><Erro erro={regras.erro || 'Sem regras.'} tentar={regras.carregar} /></div>

  const atrPontos = r.pontos.atributos ?? 0
  const atrMin = r.pontos.atributoMin ?? 30, atrMax = r.pontos.atributoMax ?? 90, atrBase = r.pontos.atributoBase ?? 30
  const atrGastos = b.atributos.str + b.atributos.dex + b.atributos.int - 3 * atrBase
  const vantagens = (r.vantagens ?? []).filter(v => !v.povos?.length || !b.povo || v.povos.includes(b.povo))
  const kits = r.kits.filter(k => kitPermitido(k, b.povo, b.caminho))
  const maxP = maxPrimarias(r, b.kit)
  const nPrim = contaPrimarias(r, b.pericias)

  const muda = (x: Partial<Rascunho>) => { setB(v => ({ ...v, ...x })); setMsg(null) }
  const setTier = (id: string, t: number) => setB(v => {
    const p = { ...v.pericias }
    if (!t) delete p[id]; else p[id] = t
    return { ...v, pericias: p }
  })
  const setAtr = (k: 'str' | 'dex' | 'int', val: number) => {
    const outros = b.atributos.str + b.atributos.dex + b.atributos.int - b.atributos[k] - 3 * atrBase
    const max = Math.min(atrMax, atrBase + atrPontos - outros)
    muda({ atributos: { ...b.atributos, [k]: Math.max(atrMin, Math.min(max, val)) } })
  }

  async function salvar() {
    if (!b.nome?.trim()) { setMsg({ ok: false, t: 'Dê um nome para a build.' }); setEtapa(6); return }
    setSalvando(true); setMsg(null)
    const corpo: BuildEntrada = { ...b, nome: b.nome.trim(), ...(s.staff ? { tipo: oficial ? 'oficial' : 'comunidade' } : {}) }
    try {
      const res = original?.minha || (original && s.staff) ? await salvarBuild(original.id, corpo) : await criarBuild(corpo)
      if (!buildId) localStorage.removeItem(CHAVE)
      navigate('/builds/' + res.data.id)
    } catch (e) { setMsg({ ok: false, t: msgErro(e) }) } finally { setSalvando(false) }
  }

  return (
    <div className="pagina pagina-larga">
      <CabecalhoPagina sobre="Antes de nascer em Tybar" titulo={buildId ? 'Editar build' : 'Simulador de personagem'}>
        Monte o personagem com as mesmas regras da criação do jogo: povo, caminho, kit, atributos e perícias. Comece do zero ou a partir de uma build padrão. {s.logado ? 'Salve como build e marque-a para usar no próximo personagem.' : 'Entre na conta para salvar como build.'}
      </CabecalhoPagina>

      <nav className="etapas" aria-label="Etapas do simulador">
        {ETAPAS.map((e, i) => (
          <button key={e} className={'etapa' + (i === etapa ? ' atual' : i < etapa ? ' feita' : '')} aria-current={i === etapa ? 'step' : undefined} onClick={() => setEtapa(i)}>
            {i + 1}. {e}
          </button>
        ))}
      </nav>

      <div className="sim">
        <div>
          {etapa === 0 && (
            <section aria-label="Ponto de partida" className="pilha">
              <div className="painel">
                <h3>Começar a partir de uma build padrão</h3>
                <p className="texto-2">As builds padrão foram montadas pela staff para ajudar na criação: escolha uma e ajuste o que quiser, ou comece do zero.</p>
                <div className="linha" style={{ marginTop: 12 }}>
                  <button className="btn btn-2" onClick={() => { setB(novo(r)); setEtapa(1) }}>Começar do zero</button>
                  {Object.keys(b.pericias).length > 0 && <button className="btn btn-2" onClick={() => setEtapa(6)}>Continuar o rascunho</button>}
                </div>
              </div>
              {padrao.carregando && <Carregando />}
              {padrao.erro && <Erro erro={padrao.erro} tentar={padrao.carregar} />}
              <div className="grade grade-3">
                {padrao.dados?.map(x => (
                  <BuildCard key={x.id} b={x} r={r} extra={
                    <button className="btn btn-p" onClick={() => {
                      setB({ nome: '', descricao: '', estilo: x.estilo ?? x.nome, povo: x.povo, vantagem: x.vantagem, caminho: x.caminho, kit: x.kit,
                        pericias: { ...(x.pericias ?? {}) }, atributos: x.atributos ?? novo(r).atributos })
                      setEtapa(x.povo ? 6 : 1)
                    }}>Começar a partir desta</button>
                  } />
                ))}
              </div>
            </section>
          )}

          {etapa === 1 && (
            <section aria-label="Povo" className="pilha">
              {Array.from(new Set(r.povos.map(p => p.grupo ?? ''))).map(g => (
                <div key={g}>
                  {g && <h3 style={{ marginBottom: 10 }}>{g}</h3>}
                  <div className="escolha">
                    {r.povos.filter(p => (p.grupo ?? '') === g).map(p => (
                      p.disponivel === false
                        ? <div key={p.id} style={{ opacity: 0.4, filter: 'grayscale(1)', pointerEvents: 'none' }} aria-disabled="true" title="Indisponível para criação por enquanto.">
                            <Opcao ativo={false} onClick={() => {}} desab titulo={p.nome} texto={'Indisponível para criação por enquanto. ' + p.descricao} fontes={fontesPovo(p.id)} />
                          </div>
                        : <Opcao key={p.id} ativo={b.povo === p.id} onClick={() => muda({ povo: p.id, vantagem: undefined })} titulo={p.nome} texto={p.descricao} fontes={fontesPovo(p.id)} video={videoPovo(p.id)} />
                    ))}
                  </div>
                </div>
              ))}
              {b.povo && (
                <div className="painel">
                  <h3>Vantagem de {nomeDe(r.povos, b.povo)}</h3>
                  <p>{r.povos.find(p => p.id === b.povo)?.vantagem}</p>
                  {!!vantagens.length && (
                    <>
                      <h4 style={{ marginTop: 16, marginBottom: 8 }}>Vantagem escolhida</h4>
                      <div className="escolha">
                        {vantagens.map(v => (
                          <Opcao key={v.id} ativo={b.vantagem === v.id} onClick={() => muda({ vantagem: b.vantagem === v.id ? undefined : v.id })} titulo={v.nome} texto={v.descricao} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </section>
          )}

          {etapa === 2 && (
            <section aria-label="Caminho" className="escolha">
              {r.caminhos.map(c => (
                <Opcao key={c.id} ativo={b.caminho === c.id} onClick={() => muda({ caminho: c.id })} titulo={c.nome} texto={c.descricao} fontes={fontesDe('caminhos', c.id)} />
              ))}
            </section>
          )}

          {etapa === 3 && (
            <section aria-label="Kit" className="pilha">
              {!b.caminho && <div className="aviso aviso-info">Escolha o caminho antes: alguns kits só existem para um caminho ou povo.</div>}
              <div className="escolha">
                {kits.map(k => (
                  <Opcao key={k.id} ativo={b.kit === k.id} onClick={() => muda({ kit: k.id })} titulo={k.nome}
                    texto={k.descricao.replace(/<[^>]+>/g, ' ') + (k.pontosExtras ? ` (+${k.pontosExtras} pontos de perícia)` : '')} />
                ))}
              </div>
              {r.kits.length > kits.length && <p className="discreto">{r.kits.length - kits.length} kit(s) escondido(s) por não servirem ao seu povo ou caminho.</p>}
            </section>
          )}

          {etapa === 4 && (
            <section className="painel" aria-label="Atributos">
              <h3>Atributos</h3>
              <p className="texto-2" style={{ marginBottom: 16 }}>Distribua {atrPontos} pontos. Cada atributo vai de {atrMin} a {atrMax}.</p>
              {(['str', 'dex', 'int'] as const).map(k => (
                <div key={k} className="atributo">
                  <label htmlFor={'atr-' + k} className="titulo" style={{ fontSize: 14 }}>{{ str: 'Força', dex: 'Destreza', int: 'Inteligência' }[k]}</label>
                  <input id={'atr-' + k} type="range" min={atrMin} max={atrMax} value={b.atributos[k]} onChange={e => setAtr(k, +e.target.value)} />
                  <input className="entrada" style={{ padding: '4px 6px', textAlign: 'center' }} type="number" aria-label={k} min={atrMin} max={atrMax} value={b.atributos[k]} onChange={e => setAtr(k, +e.target.value)} />
                </div>
              ))}
              <div className="linha linha-entre"><span>Pontos restantes</span><b className="titulo">{atrPontos - atrGastos} de {atrPontos}</b></div>
              <div className="barra" style={{ marginTop: 6 }}><i style={{ width: `${Math.min(100, (atrGastos / Math.max(1, atrPontos)) * 100)}%` }} /></div>
            </section>
          )}

          {etapa === 5 && (
            <section aria-label="Perícias" className="pilha">
              {!b.caminho && <div className="aviso aviso-info">Sem caminho, os custos mostrados são os mais altos. <button className="btn-link" onClick={() => setEtapa(2)}>Escolher caminho</button></div>}
              <p className="texto-2">Cada nível custa o valor indicado (Terciária ×1, Secundária ×2, Primária ×3). Quanto menor o custo, mais natural a perícia é para o seu personagem. Clique no nome para ver o que ela faz e a fórmula.{maxP != null && <> No máximo <b>{maxP}</b> Primária(s) ({nPrim} usada(s)).</>}</p>
              {grupos.map(([g, ps]) => (
                <div key={g}>
                  <h3 style={{ margin: '10px 0' }}>{g}</h3>
                  <div className="pericias">
                    {[...ps].sort((a, z) => custoPericia(r, a.id, b.caminho, b.kit) - custoPericia(r, z.id, b.caminho, b.kit)).map(p => {
                      const c = custoPericia(r, p.id, b.caminho, b.kit)
                      const t = b.pericias[p.id] ?? 0
                      const aberto = aberta === p.id
                      return (
                        <div key={p.id} className="pericia">
                          <div className="pericia-cab">
                            <button className="pericia-nome" aria-expanded={aberto} aria-controls={'det-' + p.id} onClick={() => setAberta(aberto ? null : p.id)}>
                              <span className="seta" aria-hidden="true">▶</span>{p.nome}
                            </button>
                            <span className={'custo custo-' + Math.min(4, c)} title="custo por nível">custo {c}</span>
                            <div className="tiers" role="group" aria-label={'Nível de ' + p.nome}>
                              <button aria-pressed={t === 0} onClick={() => setTier(p.id, 0)} title="Nenhum">—</button>
                              {tiers.map((tr, i) => {
                                const delta = c * tr.multiplicador - c * (tiers[t - 1]?.multiplicador ?? 0)
                                return (
                                  <button key={tr.id} aria-pressed={t === i + 1} disabled={t !== i + 1 && (delta > resta || (i + 1 === tiers.length && maxP != null && nPrim >= maxP))}
                                    onClick={() => setTier(p.id, i + 1)} title={`${tr.nome}: ${c * tr.multiplicador} pontos${tr.valor ? ` (perícia em ${tr.valor})` : ''}`}>
                                    {tr.nome.slice(0, 3)}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                          {aberto && (
                            <div className="pericia-det" id={'det-' + p.id}>
                              <p>{p.descricao}</p>
                              {p.formula && <div className="formula" aria-label="Fórmula">{p.formula}</div>}
                              <p className="discreto" style={{ marginTop: 8 }}>
                                Custo por caminho: {r.caminhos.map(cm => `${cm.nome} ${custoPericia(r, p.id, cm.id, b.kit)}`).join(' · ')}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </section>
          )}

          {etapa === 6 && (
            <section className="painel pilha" aria-label="Resumo e salvar">
              <h3>Resumo da build</h3>
              <label className="campo"><span>Nome da build</span>
                <input className="entrada" value={b.nome ?? ''} onChange={e => muda({ nome: e.target.value })} maxLength={60} placeholder="Ex.: Guerreiro de escudo" />
              </label>
              <label className="campo"><span>Estilo</span>
                <input className="entrada" value={b.estilo ?? ''} onChange={e => muda({ estilo: e.target.value })} maxLength={60} placeholder="Ex.: Guerreiro de uma mão, curandeiro de batalha…" />
                <div className="ajuda">Texto livre: como você descreveria o jeito de jogar. Não é a classe de talento do nível 4.</div>
              </label>
              <label className="campo"><span>Descrição</span>
                <textarea className="entrada" value={b.descricao ?? ''} onChange={e => muda({ descricao: e.target.value })} maxLength={1500} placeholder="Como jogar, por que essas escolhas, para que grupo serve…" />
              </label>
              {probs.length > 0 && <div className="aviso aviso-erro"><b>Ainda não fecha:</b><ul style={{ marginLeft: 18 }}>{probs.map(x => <li key={x}>{x}</li>)}</ul></div>}
              {s.staff && (
                <label className="linha" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={oficial} onChange={e => setOficial(e.target.checked)} /> Publicar como <span className="selo selo-oficial">✦ Build oficial</span>
                </label>
              )}
              {msg && <div className={'aviso ' + (msg.ok ? 'aviso-ok' : 'aviso-erro')} role="alert">{msg.t}</div>}
              <div className="linha">
                {s.logado
                  ? <button className="btn" onClick={salvar} disabled={salvando || probs.length > 0}>{salvando ? 'Salvando…' : original ? 'Salvar alterações' : 'Salvar como build'}</button>
                  : <Link className="btn" to={'/entrar?voltar=' + encodeURIComponent('/simulador')}>Entrar para salvar</Link>}
                {!buildId && <button className="btn btn-2" onClick={() => { setB(novo(r)); setEtapa(0) }}>Recomeçar</button>}
              </div>
            </section>
          )}

          <div className="linha linha-entre" style={{ marginTop: 22 }}>
            <button className="btn btn-2" disabled={etapa === 0} onClick={() => setEtapa(e => e - 1)}>← Voltar</button>
            {etapa < ETAPAS.length - 1 && <button className="btn" onClick={() => setEtapa(e => e + 1)}>Avançar →</button>}
          </div>
        </div>

        <aside className="painel sim-resumo" aria-label="Resumo">
          <h3>Ficha</h3>
          <ul className="resumo-lista">
            <li><span>Povo</span><span>{nomeDe(r.povos, b.povo)}</span></li>
            {b.vantagem && <li><span>Vantagem</span><span>{nomeDe(r.vantagens, b.vantagem)}</span></li>}
            <li><span>Caminho</span><span>{nomeDe(r.caminhos, b.caminho)}</span></li>
            <li><span>Kit</span><span>{nomeDe(r.kits, b.kit)}</span></li>
            <li><span>Estilo</span><span>{b.estilo || '—'}</span></li>
            <li><span>For / Des / Int</span><span>{b.atributos.str} / {b.atributos.dex} / {b.atributos.int}</span></li>
          </ul>
          <div style={{ marginTop: 16 }}>
            <div className="linha linha-entre"><span className="titulo" style={{ fontSize: 13 }}>Pontos de perícia</span><b style={{ color: resta < 0 ? 'var(--sangue-claro)' : 'var(--ouro-claro)' }}>{gastos} / {total}</b></div>
            <div className={'barra' + (resta < 0 ? ' estourou' : '')} style={{ marginTop: 6 }} role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={gastos} aria-label="Pontos de perícia gastos">
              <i style={{ width: `${Math.min(100, (gastos / Math.max(1, total)) * 100)}%` }} />
            </div>
          </div>
          <ul className="resumo-lista" style={{ marginTop: 12 }}>
            {Object.entries(b.pericias).sort((a, z) => z[1] - a[1]).map(([id, t]) => (
              <li key={id}><span>{nomeDe(r.pericias, id)}</span><span>{tiers[t - 1]?.nome ?? t} · {custoPericia(r, id, b.caminho, b.kit) * (tiers[t - 1]?.multiplicador ?? t)}</span></li>
            ))}
            {!Object.keys(b.pericias).length && <li><span>Nenhuma perícia ainda</span><span /></li>}
          </ul>
          {probs.length === 0 && <div className="aviso aviso-ok" style={{ marginTop: 14, fontSize: 15 }}>A build fecha com as regras do jogo.</div>}
        </aside>
      </div>
    </div>
  )
}
