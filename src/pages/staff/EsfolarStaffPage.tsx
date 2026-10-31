import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getEsfolar, salvarEsfolar, buscarTipos, getHistorico, Historico, curto } from '../../api/loot'
import { msgErro } from '../../api/site'
import { Busca, CabecalhoPagina, Carregando, Erro, useDados, useTitulo } from '../../components/ui'
import { ComoUsar, ListaHistorico } from '../../components/LootUi'

const ELEMENTOS = ['Normal', 'Fire', 'Cold', 'Poison', 'Energy', 'Scaly']
const num = (v: string) => (v === '' ? 0 : +v)
type Aba = 'couros' | 'extras' | 'historico'

export default function EsfolarStaffPage() {
  useTitulo('Esfolar (staff)')
  const [sp] = useSearchParams()
  const d = useDados(getEsfolar)
  const [couros, setCouros] = useState<any[]>([]), [extras, setExtras] = useState<any[]>([])
  const [busca, setBusca] = useState(sp.get('criatura') ? curto(sp.get('criatura')!) : '')
  const [aba, setAba] = useState<Aba>('couros')
  const [sujo, setSujo] = useState(false), [salvando, setSalvando] = useState(false)
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null)
  const [hist, setHist] = useState<Historico[]>([])
  const [ops, setOps] = useState<string[]>([])

  useEffect(() => { if (d.dados) { setCouros(JSON.parse(JSON.stringify(d.dados.couros ?? []))); setExtras(JSON.parse(JSON.stringify(d.dados.extras ?? []))); setSujo(false) } }, [d.dados])
  const carregaHist = () => getHistorico('esfolar.json').then(r => setHist(r.data)).catch(() => {})
  useEffect(() => { if (aba === 'historico') carregaHist() }, [aba])

  const sugerir = (q: string, tipo: 'item' | 'criatura') => { if (q.length >= 2) buscarTipos(q, tipo).then(r => setOps(r.data.map(x => tipo === 'criatura' ? x.completo : x.nome))).catch(() => {}) }
  const casa = (r: any) => !busca || String(r.tipo ?? 'corpo ' + r.corpo).toLowerCase().includes(busca.toLowerCase())
  const mudarC = (i: number, p: any) => { setCouros(l => l.map((x, j) => j === i ? { ...x, ...p } : x)); setSujo(true); setAviso(null) }
  const mudarE = (i: number, p: any) => { setExtras(l => l.map((x, j) => j === i ? { ...x, ...p } : x)); setSujo(true); setAviso(null) }

  const salvar = async () => {
    setSalvando(true); setAviso(null)
    try { await salvarEsfolar({ couros, extras }); setSujo(false); d.carregar(); setAviso({ ok: true, texto: 'Salvo e aplicado na hora.' }) }
    catch (e) { setAviso({ ok: false, texto: msgErro(e) }) } finally { setSalvando(false) }
  }

  if (d.carregando) return <Carregando />
  if (d.erro || !d.dados) return <Erro erro={d.erro || 'Sem dados.'} tentar={d.carregar} />

  return (
    <div>
      <CabecalhoPagina sobre="Staff" titulo="Esfolar">Couros, carne, penas, lã e ossos que cada criatura dá ao ser esfolada.</CabecalhoPagina>
      <datalist id="esf-criatura">{ops.map(o => <option key={o} value={o} />)}</datalist>
      <datalist id="esf-item">{ops.map(o => <option key={o} value={o} />)}</datalist>
      <ComoUsar>
        <ol>
          <li><strong>Buscar:</strong> digite parte do nome da criatura; as duas listas filtram.</li>
          <li><strong>Couros:</strong> por criatura (ou por corpo), o elemento do couro e a quantidade mín/máx. “Bônus por tier” soma couro conforme a perícia de Survival.</li>
          <li><strong>Extras:</strong> carne, penas, lã, ossos: item, quantidade e chance (0 a 1). Fábrica “semente_aleatoria” sorteia uma semente.</li>
          <li><strong>Novas linhas:</strong> “+ Couro” e “+ Extra” no fim da lista; o tipo da criatura é conferido pelo servidor ao salvar.</li>
          <li><strong>Salvar / Reverter:</strong> Salvar grava com backup e aplica sem reiniciar. A aba Histórico traz Reverter.</li>
          <li><strong>Pelo jogo:</strong> mire num monstro com <code>[LootSite</code>; o site abre esta página já filtrada nessa criatura.</li>
        </ol>
      </ComoUsar>
      <div className="abas-mapa" role="tablist">
        {(['couros', 'extras', 'historico'] as Aba[]).map(a => <button key={a} role="tab" aria-selected={aba === a} onClick={() => setAba(a)}>{{ couros: 'Couros', extras: 'Extras', historico: 'Histórico' }[a]}</button>)}
      </div>
      {aba === 'historico' ? <ListaHistorico itens={hist} aoReverter={() => { d.carregar(); carregaHist() }} /> : <>
        <div className="linha" style={{ gap: 10, marginBottom: 10 }}>
          <Busca valor={busca} mudar={setBusca} rotulo="Buscar criatura" placeholder="Buscar criatura…" />
          {sujo && <span className="selo selo-pendente">Alterações não salvas</span>}
          <button className="btn" onClick={salvar} disabled={salvando || !sujo}>{salvando ? 'Salvando…' : 'Salvar'}</button>
        </div>
        {aviso && <div className={'aviso ' + (aviso.ok ? 'aviso-ok' : 'aviso-erro')} role={aviso.ok ? 'status' : 'alert'} style={{ marginBottom: 10 }}>{aviso.texto}</div>}
        {aba === 'couros' && <div>
          <div className="tabela-envolve"><table className="tabela"><thead><tr><th>Criatura</th><th>Elemento</th><th>Mín</th><th>Máx</th><th>Bônus/tier</th><th>Tier</th><th /></tr></thead><tbody>
            {couros.map((c, i) => casa(c) && (
              <tr key={i}>
                <td>{c.tipo !== undefined ? <input className="entrada" list="esf-criatura" value={c.tipo} onChange={e => { mudarC(i, { tipo: e.target.value }); sugerir(e.target.value, 'criatura') }} aria-label="Criatura" /> : <span>corpo {c.corpo}</span>}</td>
                <td><select className="entrada" value={c.elemento} onChange={e => mudarC(i, { elemento: e.target.value })}>{ELEMENTOS.map(x => <option key={x}>{x}</option>)}</select></td>
                <td><input className="entrada" type="number" min={0} value={c.min} onChange={e => mudarC(i, { min: num(e.target.value) })} style={{ width: 64 }} /></td>
                <td><input className="entrada" type="number" min={0} value={c.max} onChange={e => mudarC(i, { max: num(e.target.value) })} style={{ width: 64 }} /></td>
                <td><input className="entrada" type="number" min={0} value={c.bonusPorTier ?? 0} onChange={e => mudarC(i, { bonusPorTier: num(e.target.value) })} style={{ width: 64 }} /></td>
                <td><select className="entrada" value={c.tier ?? ''} onChange={e => mudarC(i, { tier: e.target.value || null })}><option value="">-</option><option>T1</option><option>T2</option><option>T3</option></select></td>
                <td><button className="btn btn-2 btn-p" aria-label="Remover" onClick={() => { setCouros(l => l.filter((_, j) => j !== i)); setSujo(true) }}>✕</button></td>
              </tr>
            ))}
          </tbody></table></div>
          <button className="btn btn-2 btn-p" style={{ marginTop: 8 }} onClick={() => { setCouros(l => [...l, { tipo: '', elemento: 'Normal', min: 1, max: 1, bonusPorTier: 0, tier: null }]); setSujo(true) }}>+ Couro</button>
        </div>}
        {aba === 'extras' && <div>
          <div className="tabela-envolve"><table className="tabela"><thead><tr><th>Criatura</th><th>Item / fábrica</th><th>Mín</th><th>Máx</th><th>Chance</th><th /></tr></thead><tbody>
            {extras.map((c, i) => casa(c) && (
              <tr key={i}>
                <td><input className="entrada" list="esf-criatura" value={c.tipo ?? ''} onChange={e => { mudarE(i, { tipo: e.target.value }); sugerir(e.target.value, 'criatura') }} aria-label="Criatura" /></td>
                <td>{c.fabrica !== undefined ? <span>fábrica: {c.fabrica}</span> : <input className="entrada" list="esf-item" value={c.item ?? ''} onChange={e => { mudarE(i, { item: e.target.value }); sugerir(e.target.value, 'item') }} aria-label="Item" />}</td>
                <td><input className="entrada" type="number" min={0} value={c.min} onChange={e => mudarE(i, { min: num(e.target.value) })} style={{ width: 64 }} /></td>
                <td><input className="entrada" type="number" min={0} value={c.max} onChange={e => mudarE(i, { max: num(e.target.value) })} style={{ width: 64 }} /></td>
                <td><input className="entrada" type="number" min={0} max={1} step={0.05} value={c.chance ?? 1} onChange={e => mudarE(i, { chance: num(e.target.value) })} style={{ width: 76 }} /></td>
                <td><button className="btn btn-2 btn-p" aria-label="Remover" onClick={() => { setExtras(l => l.filter((_, j) => j !== i)); setSujo(true) }}>✕</button></td>
              </tr>
            ))}
          </tbody></table></div>
          <button className="btn btn-2 btn-p" style={{ marginTop: 8 }} onClick={() => { setExtras(l => [...l, { tipo: '', item: '', min: 1, max: 1, chance: 1 }]); setSujo(true) }}>+ Extra</button>
        </div>}
      </>}
    </div>
  )
}
