import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getLoot, salvarLoot, buscarTipos, simular, getHistorico, DadosLoot, Regra, Item, Simulacao, Historico, Grupo, curto } from '../../api/loot'
import { msgErro } from '../../api/site'
import { Busca, CabecalhoPagina, Carregando, Erro, useDados, useTitulo } from '../../components/ui'
import { ComoUsar, ListaHistorico } from '../../components/LootUi'

type Aba = 'criaturas' | 'categorias' | 'grupos' | 'historico'
const num = (v: string) => (v === '' ? 0 : +v)

/** Sugestoes de tipos (compartilhadas pelos campos de tipo) */
function useSugestoes() {
  const [ops, setOps] = useState<string[]>([])
  const t = useRef<number>()
  const buscar = (q: string, tipo: 'item' | 'criatura' = 'item') => {
    window.clearTimeout(t.current)
    if (q.length < 2) return
    t.current = window.setTimeout(() => buscarTipos(q, tipo).then(r => setOps(r.data.map(x => tipo === 'criatura' ? x.completo : x.nome))).catch(() => {}), 250)
  }
  return { ops, buscar }
}

function LinhaItem({ it, mudar, tirar, grupo, pct, buscar }: { it: Item; mudar: (i: Item) => void; tirar: () => void; grupo: boolean; pct?: number; buscar: (q: string) => void }) {
  const m = (p: Partial<Item>) => mudar({ ...it, ...p })
  return (
    <tr>
      <td><input className="entrada" list="tipos-item" value={it.tipo} onChange={e => { m({ tipo: e.target.value }); buscar(e.target.value) }} aria-label="Tipo do item" style={{ minWidth: 160 }} /></td>
      <td><input className="entrada" type="number" min={0} value={it.min ?? 1} onChange={e => m({ min: num(e.target.value) })} style={{ width: 64 }} aria-label="Quantidade mínima" /></td>
      <td><input className="entrada" type="number" min={0} value={it.max ?? it.min ?? 1} onChange={e => m({ max: num(e.target.value) })} style={{ width: 64 }} aria-label="Quantidade máxima" /></td>
      <td><input className="entrada" type="number" min={0} max={1} step={0.01} value={it.chance ?? 1} onChange={e => m({ chance: num(e.target.value) })} style={{ width: 76 }} aria-label="Chance de 0 a 1" /></td>
      {grupo && <>
        <td><input className="entrada" type="number" min={0} step={0.1} value={it.peso ?? 1} onChange={e => m({ peso: num(e.target.value) })} style={{ width: 76 }} aria-label="Peso" /></td>
        <td><strong>{pct === undefined ? '' : pct.toFixed(1) + '%'}</strong></td>
        <td><select className="entrada" value={it.tier ?? 1} onChange={e => m({ tier: +e.target.value })} aria-label="Tier (faixa mínima)">{[1, 2, 3, 4].map(n => <option key={n}>{n}</option>)}</select></td>
      </>}
      <td><input type="checkbox" checked={!!it.raro} onChange={e => m({ raro: e.target.checked })} aria-label="Raro" /></td>
      <td><button className="btn btn-2 btn-p" onClick={tirar} aria-label="Remover item">✕</button></td>
    </tr>
  )
}

function TabelaItens({ itens, mudar, grupo, buscar, pendente }: { itens: Item[]; mudar: (l: Item[]) => void; grupo: boolean; buscar: (q: string) => void; pendente?: string }) {
  // % de cada item = peso / soma dos pesos dos itens liberados ate o tier dele
  const pct = (i: Item) => { const tot = itens.filter(x => (x.tier ?? 1) <= (i.tier ?? 1)).reduce((s, x) => s + Math.max(0, x.peso ?? 1), 0); return tot > 0 ? 100 * Math.max(0, i.peso ?? 1) / tot : 0 }
  return (
    <div>
      <div className="tabela-envolve"><table className="tabela"><thead><tr><th>Item</th><th>Mín</th><th>Máx</th><th>Chance</th>{grupo && <><th>Peso</th><th>% (até o tier)</th><th>Tier</th></>}<th>Raro</th><th /></tr></thead><tbody>
        {itens.map((it, i) => <LinhaItem key={i} it={it} grupo={grupo} buscar={buscar} pct={grupo ? pct(it) : undefined}
          mudar={n => mudar(itens.map((x, j) => j === i ? n : x))} tirar={() => mudar(itens.filter((_, j) => j !== i))} />)}
      </tbody></table></div>
      <div className="linha" style={{ gap: 8, marginTop: 8 }}>
        <button className="btn btn-2 btn-p" onClick={() => mudar([...itens, { tipo: '', min: 1, max: 1, chance: 1, peso: 1, tier: 1 }])}>+ Item</button>
        {pendente && <button className="btn btn-2 btn-p" onClick={() => mudar([...itens, { tipo: pendente, min: 1, max: 1, chance: 1, peso: 1, tier: 1 }])}>+ {pendente} (vindo do jogo)</button>}
      </div>
    </div>
  )
}

function RegraEditor({ regra, mudar, grupos, buscar, pendente, vazioMsg }: { regra?: Regra; mudar: (r?: Regra) => void; grupos: Grupo[]; buscar: (q: string) => void; pendente?: string; vazioMsg: string }) {
  if (!regra) return <p className="discreto">{vazioMsg} <button className="btn btn-2 btn-p" onClick={() => mudar({ coinMin: 0, coinMax: 0, itens: [], tabelas: [] })}>Criar regra própria</button></p>
  const m = (p: Partial<Regra>) => mudar({ ...regra, ...p })
  const tabs = regra.tabelas ?? []
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div className="linha" style={{ gap: 12, flexWrap: 'wrap' }}>
        <label>Moedas (cobre) mín <input className="entrada" type="number" min={0} value={regra.coinMin ?? 0} onChange={e => m({ coinMin: num(e.target.value) })} style={{ width: 90 }} /></label>
        <label>máx <input className="entrada" type="number" min={0} value={regra.coinMax ?? 0} onChange={e => m({ coinMax: num(e.target.value) })} style={{ width: 90 }} /></label>
        <button className="btn btn-perigo btn-p" onClick={() => { if (window.confirm('Remover esta regra própria?')) mudar(undefined) }}>Remover regra</button>
      </div>
      <TabelaItens itens={regra.itens ?? []} mudar={itens => m({ itens })} grupo={false} buscar={buscar} pendente={pendente} />
      <div><strong>Grupos (tabelas sorteadas)</strong>
        <div className="linha" style={{ gap: 10, flexWrap: 'wrap' }}>
          {grupos.map(g => <label key={g.id}><input type="checkbox" checked={tabs.includes(g.id)} onChange={e => m({ tabelas: e.target.checked ? [...tabs, g.id] : tabs.filter(x => x !== g.id) })} /> {g.nome || g.id}</label>)}
          {grupos.length === 0 && <span className="discreto">Nenhum grupo criado ainda.</span>}
        </div>
      </div>
    </div>
  )
}

function Simulador({ criatura }: { criatura: string }) {
  const [faixa, setFaixa] = useState(1), [mortes, setMortes] = useState(500), [lad, setLad] = useState(false)
  const [res, setRes] = useState<Simulacao | null>(null), [erro, setErro] = useState(''), [rodando, setRodando] = useState(false)
  const rodar = async () => { setRodando(true); setErro(''); try { setRes((await simular({ criatura, faixa, mortes, ladino: lad })).data) } catch (e) { setErro(msgErro(e)) } finally { setRodando(false) } }
  return (
    <div className="painel painel-fino" style={{ marginTop: 14 }}>
      <h3>Simular</h3>
      <p className="discreto">Roda o mesmo sorteio do jogo em memória, com o que está <strong>salvo</strong> no servidor. Não cria itens.</p>
      <div className="linha" style={{ gap: 12, flexWrap: 'wrap' }}>
        <label>Faixa <select className="entrada" value={faixa} onChange={e => setFaixa(+e.target.value)}>{[1, 2, 3, 4].map(n => <option key={n}>{n}</option>)}</select></label>
        <label>Mortes (até 1000) <input className="entrada" type="number" min={1} max={1000} value={mortes} onChange={e => setMortes(Math.min(1000, Math.max(1, +e.target.value)))} style={{ width: 90 }} /></label>
        <label><input type="checkbox" checked={lad} onChange={e => setLad(e.target.checked)} /> Saque do Ladino</label>
        <button className="btn" onClick={rodar} disabled={rodando}>{rodando ? 'Simulando…' : 'Simular'}</button>
      </div>
      {erro && <div className="aviso aviso-erro" role="alert" style={{ marginTop: 8 }}>{erro}</div>}
      {res && <div style={{ marginTop: 10 }}>
        <p>Regra: <em>{res.origem}</em>. Moedas por morte (média): <strong>{res.mediaMoedasCobre}</strong> cobre{res.carregaMoedas ? '' : ' (esta criatura não carrega moedas)'}.</p>
        <div className="tabela-envolve"><table className="tabela"><thead><tr><th>Item</th><th>Mortes com o item</th><th>% das mortes</th><th>Média por morte</th><th>Total</th></tr></thead><tbody>
          {res.itens.map(i => <tr key={i.tipo}><td>{i.tipo}</td><td>{i.mortesComItem}</td><td>{i.pctMortes}%</td><td>{i.mediaPorMorte}</td><td>{i.total}</td></tr>)}
          {res.itens.length === 0 && <tr><td colSpan={5}>Nenhum item caiu.</td></tr>}
        </tbody></table></div></div>}
    </div>
  )
}

export default function LootStaffPage() {
  useTitulo('Loot (staff)')
  const [sp] = useSearchParams()
  const d = useDados(getLoot)
  const [dados, setDados] = useState<DadosLoot | null>(null)
  const [aba, setAba] = useState<Aba>('criaturas')
  const [sub, setSub] = useState<'regra' | 'ladino'>('regra')
  const [busca, setBusca] = useState('')
  const [sel, setSel] = useState<string | null>(sp.get('criatura'))
  const [selCat, setSelCat] = useState<string | null>(null)
  const [selGrp, setSelGrp] = useState<string | null>(null)
  const [sujo, setSujo] = useState(false), [salvando, setSalvando] = useState(false)
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null)
  const [hist, setHist] = useState<Historico[]>([])
  const pendente = sp.get('item') ?? undefined
  const sug = useSugestoes()

  useEffect(() => { if (d.dados) { setDados(JSON.parse(JSON.stringify(d.dados))); setSujo(false) } }, [d.dados])
  const carregaHist = () => getHistorico().then(r => setHist(r.data.filter(h => h.arquivo !== 'esfolar.json'))).catch(() => {})
  useEffect(() => { if (aba === 'historico') carregaHist() }, [aba])

  const cris = dados?.criaturas?.criaturas ?? {}, cats = dados?.categorias?.categorias ?? {}, grupos = dados?.grupos?.grupos ?? []
  const mut = (f: (x: DadosLoot) => void) => { setDados(o => { if (!o) return o; const c = JSON.parse(JSON.stringify(o)); f(c); return c }); setSujo(true); setAviso(null) }
  const nomesCri = useMemo(() => Object.keys(cris).filter(k => k.toLowerCase().includes(busca.toLowerCase())).sort((a, b) => curto(a).localeCompare(curto(b))), [cris, busca])
  const nomesCat = Object.keys(cats).filter(k => k.toLowerCase().includes(busca.toLowerCase())).sort()

  const [avisos, setAvisos] = useState<string[]>([])
  const salvar = async () => {
    if (!dados) return
    setSalvando(true); setAviso(null); setAvisos([])
    try { const r = await salvarLoot({ categorias: dados.categorias, criaturas: dados.criaturas, grupos: dados.grupos }); setDados(r.data); setSujo(false); setAviso({ ok: true, texto: 'Salvo. O motor já recarregou (confira com [lootinfo no jogo).' }); setAvisos(r.data.avisos || []) }
    catch (e) { setAviso({ ok: false, texto: msgErro(e) }) } finally { setSalvando(false) }
  }

  if (d.carregando) return <Carregando />
  if (d.erro || !dados) return <Erro erro={d.erro || 'Sem dados.'} tentar={d.carregar} />
  if (!dados.categorias || !dados.criaturas) return <Erro erro="Os arquivos de loot ainda não existem no servidor (rode [LootExportar)." />

  const cri = sel ? cris[sel] : undefined
  const cat = selCat ? cats[selCat] : undefined
  const grp = selGrp ? grupos.find(g => g.id === selGrp) : undefined
  const setRegra = (campo: 'regra' | 'ladino' | 'excecao', quemC: 'cri' | 'cat', chave: string) => (r?: Regra) =>
    mut(x => { const o: any = quemC === 'cri' ? x.criaturas.criaturas[chave] : x.categorias.categorias[chave]; if (r) o[campo] = r; else delete o[campo] })
  const setGrp = (id: string, f: (g: Grupo) => void) => mut(x => { const g = x.grupos.grupos.find(y => y.id === id); if (g) f(g) })
  const lista = aba === 'criaturas' ? nomesCri : nomesCat

  return (
    <div>
      <CabecalhoPagina sobre="Staff" titulo="Loot">Regras de moedas e itens por categoria, criatura e grupo. O jogo lê estes arquivos na hora, ao salvar.</CabecalhoPagina>
      <datalist id="tipos-item">{sug.ops.map(o => <option key={o} value={o} />)}</datalist>
      <datalist id="tipos-criatura">{sug.ops.map(o => <option key={o} value={o} />)}</datalist>
      <ComoUsar>
        <ol>
          <li><strong>Buscar:</strong> na aba Criaturas digite parte do nome e clique na criatura. Criatura sem regra própria usa a da categoria dela.</li>
          <li><strong>Editar a regra:</strong> a “Exceção” substitui a regra da categoria só para esta criatura. Moedas são em cobre (mín/máx). Cada item tem quantidade e chance (0 a 1).</li>
          <li><strong>Peso e %:</strong> num grupo, cada rolagem sorteia um item pelo peso; a coluna % mostra a chance relativa entre os itens liberados até o tier daquele item. A chance do item vale depois do sorteio.</li>
          <li><strong>Raro:</strong> item raro ganha proteção de azar (a chance sobe a cada morte sem drop, até o teto global).</li>
          <li><strong>Tier / faixa:</strong> a faixa (1 a 4) é o nível da criatura; item de tier 3 só cai de criatura de faixa 3 ou mais. A curva de moedas da categoria multiplica as moedas por faixa.</li>
          <li><strong>Ladino:</strong> a aba “Ladino” é o saque extra de [Marcar] + [Roubar]. Sem tabela própria, ele leva uma parte das moedas.</li>
          <li><strong>Simular:</strong> salve, escolha a faixa e o número de mortes (até 1000) e veja moedas médias e frequência de cada item.</li>
          <li><strong>Salvar / Reverter:</strong> Salvar grava com backup e recarrega o motor. A aba Histórico lista as alterações; Reverter volta ao arquivo anterior.</li>
          <li><strong>Pelo jogo:</strong> o GM mira num monstro, corpo ou item e digita <code>[LootSite</code>; o site abre já nessa criatura (ou com o item pronto para adicionar). <code>[lootinfo</code> mostra a regra e o último sorteio de um corpo.</li>
        </ol>
      </ComoUsar>
      <div className="abas-mapa" role="tablist">
        {(['criaturas', 'categorias', 'grupos', 'historico'] as Aba[]).map(a => <button key={a} role="tab" aria-selected={aba === a} onClick={() => setAba(a)}>{{ criaturas: 'Criaturas', categorias: 'Categorias', grupos: 'Grupos', historico: 'Histórico' }[a]}</button>)}
      </div>
      {aba !== 'historico' && <div className="linha" style={{ gap: 10, marginBottom: 10 }}>
        <span style={{ flex: 1 }} />
        {sujo && <span className="selo selo-pendente">Alterações não salvas</span>}
        <button className="btn" onClick={salvar} disabled={salvando || !sujo}>{salvando ? 'Salvando…' : 'Salvar'}</button>
      </div>}
      {avisos.length > 0 && <div className="aviso" role="status" style={{ marginBottom: 10, background: '#fff3cd', color: '#664d03', border: '1px solid #e0b84c' }}><strong>Avisos (não impediram de salvar; use [LootLimpar no jogo para remover o que não existe):</strong><ul style={{ margin: '4px 0 0 18px' }}>{avisos.map((a, i) => <li key={i}>{a}</li>)}</ul></div>}
      {aviso && <div className={'aviso ' + (aviso.ok ? 'aviso-ok' : 'aviso-erro')} role={aviso.ok ? 'status' : 'alert'} style={{ marginBottom: 10 }}>{aviso.texto}</div>}
      {pendente && <div className="aviso" style={{ marginBottom: 10 }}>Item vindo do jogo: <strong>{pendente}</strong>. Escolha uma criatura ou categoria e use o botão “+ {pendente}” na regra.</div>}

      {aba === 'historico' && <ListaHistorico itens={hist} aoReverter={() => { d.carregar(); carregaHist() }} />}

      {(aba === 'criaturas' || aba === 'categorias') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 300px) 1fr', gap: 16, alignItems: 'start' }}>
          <div>
            <Busca valor={busca} mudar={setBusca} rotulo="Buscar" placeholder={aba === 'criaturas' ? 'Buscar criatura…' : 'Buscar categoria…'} />
            <div style={{ maxHeight: 520, overflowY: 'auto', marginTop: 8 }}>
              {lista.map(k => (
                <button key={k} className="btn btn-2 btn-p" style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 3, opacity: (aba === 'criaturas' ? sel : selCat) === k ? 1 : .75 }}
                  onClick={() => aba === 'criaturas' ? setSel(k) : setSelCat(k)}>{aba === 'criaturas' ? curto(k) : k}</button>
              ))}
            </div>
            {aba === 'criaturas' && <div style={{ marginTop: 8 }}>
              <input className="entrada" list="tipos-criatura" placeholder="Adicionar criatura (tipo completo)…" onChange={e => sug.buscar(e.target.value, 'criatura')}
                onKeyDown={e => { if (e.key === 'Enter') { const v = e.currentTarget.value.trim(); if (v) { mut(x => { if (!x.criaturas.criaturas[v]) x.criaturas.criaturas[v] = { multMoedas: 1 } }); setSel(v); e.currentTarget.value = '' } } }} />
              <small className="discreto">Digite e tecle Enter. O servidor confere se o tipo existe ao salvar.</small>
            </div>}
          </div>
          <div>
            {aba === 'criaturas' && sel && !cri && <p className="discreto">“{sel}” ainda não está em criaturas.json. <button className="btn btn-2 btn-p" onClick={() => mut(x => { x.criaturas.criaturas[sel] = { multMoedas: 1 } })}>Adicionar</button></p>}
            {aba === 'criaturas' && sel && cri && (
              <div className="painel painel-fino">
                <h3>{curto(sel)} <small className="discreto">{sel}</small></h3>
                <div className="linha" style={{ gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                  <label>Categoria <select className="entrada" value={cri.categoria ?? ''} onChange={e => mut(x => { x.criaturas.criaturas[sel].categoria = e.target.value || undefined })}><option value="">(nenhuma)</option>{Object.keys(cats).sort().map(c => <option key={c}>{c}</option>)}</select></label>
                  <label>Carrega moedas <select className="entrada" value={cri.carregaMoedas === undefined ? '' : String(cri.carregaMoedas)} onChange={e => mut(x => { const v = e.target.value; if (v === '') delete x.criaturas.criaturas[sel].carregaMoedas; else x.criaturas.criaturas[sel].carregaMoedas = v === 'true' })}><option value="">herdar</option><option value="true">sim</option><option value="false">não</option></select></label>
                  <label>Mult. de moedas <input className="entrada" type="number" min={0} step={0.1} value={cri.multMoedas ?? 1} onChange={e => mut(x => { x.criaturas.criaturas[sel].multMoedas = num(e.target.value) })} style={{ width: 80 }} /></label>
                  <button className="btn btn-perigo btn-p" onClick={() => { if (window.confirm('Tirar esta criatura de criaturas.json? Ela volta ao padrão global.')) { mut(x => { delete x.criaturas.criaturas[sel] }); setSel(null) } }}>Remover criatura</button>
                </div>
                <div className="abas-mapa"><button aria-selected={sub === 'regra'} onClick={() => setSub('regra')}>Exceção</button><button aria-selected={sub === 'ladino'} onClick={() => setSub('ladino')}>Ladino</button></div>
                {sub === 'regra'
                  ? <RegraEditor regra={cri.excecao} mudar={setRegra('excecao', 'cri', sel)} grupos={grupos} buscar={sug.buscar} pendente={pendente} vazioMsg={'Sem exceção: vale a regra da categoria ' + (cri.categoria ?? '(nenhuma, padrão global)') + '.'} />
                  : <RegraEditor regra={cri.ladino} mudar={setRegra('ladino', 'cri', sel)} grupos={grupos} buscar={sug.buscar} pendente={pendente} vazioMsg="Sem tabela de ladino própria: vale a da categoria ou parte das moedas." />}
              </div>
            )}
            {aba === 'categorias' && selCat && cat && (
              <div className="painel painel-fino">
                <h3>{selCat}</h3>
                <div className="linha" style={{ gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                  <label><input type="checkbox" checked={!!cat.carregaMoedas} onChange={e => mut(x => { x.categorias.categorias[selCat].carregaMoedas = e.target.checked })} /> Carrega moedas</label>
                  <span>Curva de moedas por faixa (1 a 4):</span>
                  {[0, 1, 2, 3].map(i => <input key={i} className="entrada" type="number" min={0} step={0.1} style={{ width: 70 }} aria-label={'Faixa ' + (i + 1)} value={(cat.curvaMoedas ?? [1, 1, 1, 1])[i]}
                    onChange={e => mut(x => { const c = x.categorias.categorias[selCat]; const cv = [...(c.curvaMoedas ?? [1, 1, 1, 1])]; cv[i] = num(e.target.value); c.curvaMoedas = cv })} />)}
                </div>
                <div className="abas-mapa"><button aria-selected={sub === 'regra'} onClick={() => setSub('regra')}>Regra</button><button aria-selected={sub === 'ladino'} onClick={() => setSub('ladino')}>Ladino</button></div>
                {sub === 'regra'
                  ? <RegraEditor regra={cat.regra} mudar={setRegra('regra', 'cat', selCat)} grupos={grupos} buscar={sug.buscar} pendente={pendente} vazioMsg="Categoria sem regra." />
                  : <RegraEditor regra={cat.ladino} mudar={setRegra('ladino', 'cat', selCat)} grupos={grupos} buscar={sug.buscar} pendente={pendente} vazioMsg="Sem tabela de ladino." />}
              </div>
            )}
            {aba === 'criaturas' && sel && cri && (sujo ? <p className="discreto" style={{ marginTop: 10 }}>Salve para poder simular.</p> : <Simulador criatura={sel} />)}
            {!(aba === 'criaturas' ? sel : selCat) && <p className="discreto">Escolha um item da lista.</p>}
          </div>
        </div>
      )}

      {aba === 'grupos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 300px) 1fr', gap: 16, alignItems: 'start' }}>
          <div>
            {grupos.map(g => <button key={g.id} className="btn btn-2 btn-p" style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 3, opacity: selGrp === g.id ? 1 : .75 }} onClick={() => setSelGrp(g.id)}>{g.nome || g.id}</button>)}
            <button className="btn btn-p" onClick={() => { const id = window.prompt('Id do novo grupo (sem espaços):')?.trim(); if (id && !grupos.some(g => g.id === id)) { mut(x => { x.grupos.grupos.push({ id, nome: id, rolagens: 1, maxItens: 0, chance: 1, itens: [] }) }); setSelGrp(id) } }}>+ Novo grupo</button>
          </div>
          <div>
            {grp ? (
              <div className="painel painel-fino">
                <div className="linha linha-entre"><h3 style={{ margin: 0 }}>{grp.nome || grp.id}</h3>
                  <button className="btn btn-perigo btn-p" onClick={() => { if (window.confirm('Apagar o grupo? Regras que o citam ficam com erro até você tirá-lo.')) { mut(x => { x.grupos.grupos = x.grupos.grupos.filter(g => g.id !== grp.id) }); setSelGrp(null) } }}>Apagar grupo</button></div>
                <div className="linha" style={{ gap: 12, flexWrap: 'wrap', margin: '10px 0' }}>
                  <label>Nome <input className="entrada" value={grp.nome ?? ''} onChange={e => setGrp(grp.id, g => { g.nome = e.target.value })} /></label>
                  <label>Rolagens <input className="entrada" type="number" min={1} value={grp.rolagens ?? 1} onChange={e => setGrp(grp.id, g => { g.rolagens = num(e.target.value) })} style={{ width: 70 }} /></label>
                  <label>Máx. de itens (0 = sem limite) <input className="entrada" type="number" min={0} value={grp.maxItens ?? 0} onChange={e => setGrp(grp.id, g => { g.maxItens = num(e.target.value) })} style={{ width: 70 }} /></label>
                  <label>Chance da rolagem <input className="entrada" type="number" min={0} max={1} step={0.05} value={grp.chance ?? 1} onChange={e => setGrp(grp.id, g => { g.chance = num(e.target.value) })} style={{ width: 80 }} /></label>
                  <label>Garantido (tipo) <input className="entrada" list="tipos-item" value={grp.garantido ?? ''} onChange={e => { setGrp(grp.id, g => { g.garantido = e.target.value || undefined }); sug.buscar(e.target.value) }} /></label>
                </div>
                <TabelaItens itens={grp.itens} mudar={itens => setGrp(grp.id, g => { g.itens = itens })} grupo buscar={sug.buscar} pendente={pendente} />
              </div>
            ) : <p className="discreto">Escolha ou crie um grupo.</p>}
          </div>
        </div>
      )}
    </div>
  )
}
