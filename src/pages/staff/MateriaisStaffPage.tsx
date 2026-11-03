import { useEffect, useMemo, useState } from 'react'
import { baixarExport, DadosMateriais, ExportSalvo, getMateriais, listarExports, salvarExport } from '../../api/materiais'
import { msgErro } from '../../api/site'
import { CabecalhoPagina, Carregando, Erro, useTitulo } from '../../components/ui'

type Aba = 'metais' | 'couros' | 'madeiras' | 'armaduras' | 'armas' | 'simulador' | 'exports'
const ABAS: { id: Aba; nome: string }[] = [
  { id: 'metais', nome: 'Metais' }, { id: 'couros', nome: 'Couros' }, { id: 'madeiras', nome: 'Madeiras e tecidos' },
  { id: 'armaduras', nome: 'Armaduras' }, { id: 'armas', nome: 'Armas' }, { id: 'simulador', nome: 'Simulador' }, { id: 'exports', nome: 'Exports salvos' },
]
const SLOTS: { id: string; nome: string; bonus: number }[] = [
  { id: 'elmo', nome: 'Elmo', bonus: 1 }, { id: 'gorget', nome: 'Gorget', bonus: 0 }, { id: 'peitoral', nome: 'Peitoral', bonus: 3 },
  { id: 'bracos', nome: 'Braços', bonus: 0 }, { id: 'luvas', nome: 'Luvas', bonus: 1 }, { id: 'pernas', nome: 'Pernas', bonus: 2 },
]
const r0 = (n: number) => Math.round(n)

function Num({ v, on, w = 56, step = 1 }: { v: number; on: (n: number) => void; w?: number; step?: number }) {
  return <input type="number" value={v} step={step} style={{ width: w }} onChange={e => on(e.target.value === '' ? 0 : +e.target.value)} />
}

function baixarJson(obj: unknown, nome: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }))
  a.download = nome; a.click(); URL.revokeObjectURL(a.href)
}

type Editar = (fn: (c: DadosMateriais) => void) => void
type P = { d: DadosMateriais; editar: Editar }

export default function MateriaisStaffPage() {
  useTitulo('Materiais')
  const [d, setD] = useState<DadosMateriais | null>(null), [erro, setErro] = useState(''), [aba, setAba] = useState<Aba>('metais')
  const [orig, setOrig] = useState(''), [msg, setMsg] = useState('')
  const carregar = () => {
    setErro('')
    getMateriais().then(r => { if (r.data.calculando) setTimeout(carregar, 3000); else { setD(r.data); setOrig(JSON.stringify(r.data)) } }).catch(e => setErro(msgErro(e)))
  }
  useEffect(carregar, [])
  const alterado = !!d && JSON.stringify(d) !== orig

  if (erro) return <div className="pagina"><Erro erro={erro} tentar={carregar} /></div>
  if (!d) return <div className="pagina"><Carregando texto="Lendo os materiais do servidor…" /></div>

  const editar: Editar = fn => { const c: DadosMateriais = JSON.parse(JSON.stringify(d)); fn(c); setD(c) }
  const exportar = async () => {
    setMsg('')
    const dados = { ...d, editadoEm: new Date().toISOString() }
    try {
      const r = await salvarExport(dados)
      baixarJson(dados, r.data.arquivo); setMsg('Salvo no servidor em ' + r.data.caminho + ' e baixado.'); setAba('exports')
    } catch (e) { setMsg('Não salvou no servidor (' + msgErro(e) + '). Baixei só a cópia local.'); baixarJson(dados, 'materiais_local.json') }
  }

  return (
    <div className="pagina">
      <CabecalhoPagina sobre="Staff" titulo="Materiais">
        Bônus reais de metais, couros, madeiras e tecidos lidos do servidor{d.geradoEm ? ` (gerado em ${d.geradoEm})` : ''}. Os números da tabela podem ser editados aqui,
        servem ao simulador e saem no export; não mudam o jogo: o export é a proposta de balanceamento para aplicar no código.
      </CabecalhoPagina>
      <div className="painel painel-fino" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={exportar}>Exportar JSON (salva no servidor e baixa)</button>
        <button onClick={() => setD(JSON.parse(orig))} disabled={!alterado}>Desfazer edições</button>
        <span className="discreto">{alterado ? 'Há edições não exportadas.' : 'Sem edições.'} {msg}</span>
      </div>
      <div className="abas-mapa" role="tablist">{ABAS.map(a => <button key={a.id} role="tab" aria-selected={aba === a.id} onClick={() => setAba(a.id)}>{a.nome}</button>)}</div>

      {aba === 'metais' && <TabelaMetais d={d} editar={editar} />}
      {aba === 'couros' && <TabelaCouros d={d} editar={editar} />}
      {aba === 'madeiras' && <TabelaMadeiras d={d} editar={editar} />}
      {aba === 'armaduras' && <Armaduras d={d} editar={editar} />}
      {aba === 'armas' && <Armas d={d} editar={editar} />}
      {aba === 'simulador' && <Simulador d={d} />}
      {aba === 'exports' && <Exports onAbrir={dd => { setD(dd); setAba('metais'); setMsg('Export carregado na tela (edições não salvas).') }} />}
      <div className="painel painel-fino">
        <h3 style={{ marginTop: 0 }}>Fórmulas do código</h3>
        <ul className="discreto" style={{ margin: 0 }}>{Object.entries(d.formulas ?? {}).map(([k, v]) => <li key={k}>{v}</li>)}</ul>
        <p className="discreto" style={{ marginBottom: 0 }}>Regenerar os dados: comando [ExportarMateriais (GM) ou reiniciar o servidor. Escopo: ferreiro (3 tiers + escudo), couro, madeira e tecido; armaduras vanilla não entram.</p>
      </div>
    </div>
  )
}

type CampoMetal = 'arBase' | 'durabilidade' | 'resFis' | 'resFogo' | 'resGelo' | 'resVeneno' | 'resEnergia' | 'pericia' | 'bonusDanoArma' | 'pctElemental'
function TabelaMetais({ d, editar }: P) {
  const campos: CampoMetal[] = ['arBase', 'durabilidade', 'resFis', 'resFogo', 'resGelo', 'resVeneno', 'resEnergia', 'pericia', 'bonusDanoArma']
  return (
    <div className="tabela-envolve"><table className="tabela">
      <thead><tr><th>Metal</th><th>Nível</th><th>AR base</th><th>Durab.</th><th>Fís</th><th>Fogo</th><th>Gelo</th><th>Veneno</th><th>Energia</th><th>Perícia</th><th>Bônus dano arma</th><th>Elemento da arma</th><th>% elem.</th></tr></thead>
      <tbody>{d.metais.map((m, i) => (
        <tr key={m.id}><td>{m.nome}</td><td>{m.nivel}</td>
          {campos.map(k => <td key={k}><Num v={m[k]} on={n => editar(c => { c.metais[i][k] = n })} /></td>)}
          <td>{m.elementoArma}</td>
          <td><Num v={m.pctElemental} on={n => editar(c => { c.metais[i].pctElemental = n })} /></td></tr>
      ))}</tbody>
    </table></div>
  )
}

function TabelaCouros({ d, editar }: P) {
  return (
    <>
      <div className="tabela-envolve"><table className="tabela">
        <thead><tr><th>Couro</th><th>Nível</th><th>Elemento</th><th>Bônus por peça</th><th>Perícia mín.</th><th>Perícia máx.</th></tr></thead>
        <tbody>{d.couros.map((c, i) => <tr key={c.id}><td>{c.nome}</td><td>{c.nivel}</td><td>{c.elemento}</td>
          <td><Num v={c.bonus} on={n => editar(x => { x.couros[i].bonus = n })} /></td><td>{c.periciaMin}</td><td>{c.periciaMax}</td></tr>)}</tbody>
      </table></div>
      <p className="discreto">Couro Comum e Escamoso somam o bônus no AR/físico; couro elemental dá o bônus como resistência do elemento.</p>
    </>
  )
}

function TabelaMadeiras({ d, editar }: P) {
  const campos = ['danoPct', 'velocPct', 'durabPct', 'pesoPct', 'defesaPct', 'pericia'] as const
  return (
    <>
      <div className="tabela-envolve"><table className="tabela">
        <thead><tr><th>Madeira</th><th>Dano %</th><th>Velocidade %</th><th>Durab. %</th><th>Peso %</th><th>Defesa % (escudo)</th><th>Perícia mín.</th></tr></thead>
        <tbody>{d.madeiras.map((m, i) => <tr key={m.id}><td>{m.nome}</td>{campos.map(k => <td key={k}><Num v={m[k]} on={n => editar(x => { x.madeiras[i][k] = n })} /></td>)}</tr>)}</tbody>
      </table></div>
      <h3>Tecidos (sem bônus de combate; só nível e perícia)</h3>
      <div className="tabela-envolve"><table className="tabela"><thead><tr><th>Tecido</th><th>Nível</th><th>Perícia de Costura mín.</th></tr></thead>
        <tbody>{d.tecidos.map((t, i) => <tr key={t.id}><td>{t.nome}</td><td>{t.nivel}</td><td><Num v={t.pericia} on={n => editar(x => { x.tecidos[i].pericia = n })} /></td></tr>)}</tbody></table></div>
    </>
  )
}

function Armaduras({ d, editar }: P) {
  return (
    <>
      <h3>Armaduras de metal (ferreiro)</h3>
      <div className="tabela-envolve"><table className="tabela">
        <thead><tr><th>Tier</th><th>Multiplicador de AR</th><th>Bônus fixo no AR</th><th>Bônus físico do tier</th><th>Físico extra</th><th>DEX por peça</th><th>Magery %</th><th>Sneak %</th><th>Outras penalidades</th></tr></thead>
        <tbody>{d.tiersMetal.map((t, i) => <tr key={t.id}><td>{t.nome}</td>
          <td><Num v={t.mult} step={0.1} on={n => editar(x => { x.tiersMetal[i].mult = n })} /></td>
          <td><Num v={t.bonusAR} on={n => editar(x => { x.tiersMetal[i].bonusAR = n })} /></td>
          <td><Num v={t.bonusFisTier} on={n => editar(x => { x.tiersMetal[i].bonusFisTier = n })} /></td>
          <td><Num v={t.extraFis} on={n => editar(x => { x.tiersMetal[i].extraFis = n })} /></td>
          <td>{t.penDex}</td><td>{t.penMageryPct}</td><td>{t.penSneakPct}</td><td className="discreto">{t.nota}</td></tr>)}</tbody>
      </table></div>
      <p className="discreto">Peças: {SLOTS.map(s => `${s.nome} (+${s.bonus} físico)`).join(', ')}. O AR é o mesmo em todas as peças do mesmo tier e metal; só o físico muda pela peça. DEX e perícias são só leitura (valem no código).</p>
      <h3>Armaduras de couro (peças)</h3>
      <div className="tabela-envolve"><table className="tabela">
        <thead><tr><th>Peça</th><th>Linha</th><th>Camada</th><th>AR base</th><th>Durabilidade</th><th>Peso</th></tr></thead>
        <tbody>{d.pecasCouro.map((p, i) => <tr key={p.id}><td>{p.nome}</td><td>{p.linha}</td><td>{p.camada}</td>
          <td><Num v={p.arBase} on={n => editar(x => { x.pecasCouro[i].arBase = n })} /></td><td>{p.durabMin}–{p.durabMax}</td><td>{p.peso}</td></tr>)}</tbody>
      </table></div>
    </>
  )
}

function Armas({ d, editar }: P) {
  const [cat, setCat] = useState<'forjada' | 'madeira' | 'vanilla'>('forjada')
  const idx = d.armas.map((a, i) => ({ a, i })).filter(x => x.a.categoria === cat)
  return (
    <>
      <div className="painel painel-fino"><label>Categoria{' '}<select value={cat} onChange={e => setCat(e.target.value as typeof cat)}>
        <option value="forjada">Forjadas (dano base + metal)</option><option value="madeira">Madeira</option><option value="vanilla">Vanilla</option></select></label></div>
      <div className="tabela-envolve"><table className="tabela">
        <thead><tr><th>Arma</th><th>Força</th><th>Dano mín.</th><th>Dano máx.</th><th>Velocidade (s)</th><th>Alcance</th><th>Crítico</th><th>% crít.</th><th>Bônus on hit</th></tr></thead>
        <tbody>{idx.map(({ a, i }) => <tr key={a.id}><td>{a.nome}</td><td>{a.forca}</td>
          <td><Num v={a.min} on={n => editar(x => { x.armas[i].min = n })} /></td><td><Num v={a.max} on={n => editar(x => { x.armas[i].max = n })} /></td>
          <td><Num v={a.segundos} step={0.25} on={n => editar(x => { x.armas[i].segundos = n })} /></td>
          <td>{a.alcMax ? `${a.alcMin}~${a.alcMax}` : '—'}</td><td>{a.critico}</td><td><Num v={a.chance} on={n => editar(x => { x.armas[i].chance = n })} /></td><td>{a.bonus}</td></tr>)}</tbody>
      </table></div>
      <p className="discreto">Forjadas: o metal soma o "bônus de dano" no mín e no máx e define o elemento (aba Metais). Madeira: dano % e velocidade % vêm da aba Madeiras.</p>
    </>
  )
}

type Linha = { tipo: 'metal' | 'couro' | 'escudo'; tier: string; slot: string; mat: string }
function Simulador({ d }: { d: DadosMateriais }) {
  const [linhas, setLinhas] = useState<Linha[]>([{ tipo: 'metal', tier: 'Placas', slot: 'peitoral', mat: d.metais[0]?.id ?? '' }])
  const [armaId, setArmaId] = useState(d.armas.find(a => a.categoria === 'forjada')?.id ?? ''), [matArma, setMatArma] = useState(d.metais[0]?.id ?? '')
  const metal = (id: string) => d.metais.find(m => m.id === id)

  const tot = useMemo(() => {
    const t = { ar: 0, Fis: 0, Fogo: 0, Gelo: 0, Veneno: 0, Energia: 0, durab: [] as string[], dex: 0 }
    for (const l of linhas) {
      if (l.tipo === 'couro') {
        const p = d.pecasCouro.find(x => x.id === l.slot), c = d.couros.find(x => x.id === l.mat)
        if (!p || !c) continue
        const fis = p.arBase + (c.elemento === 'Normal' || c.elemento === 'Scaly' ? c.bonus : 0)
        t.ar += fis; t.Fis += fis
        if (c.elemento === 'Fire') t.Fogo += c.bonus
        if (c.elemento === 'Cold') t.Gelo += c.bonus
        if (c.elemento === 'Poison') t.Veneno += c.bonus
        if (c.elemento === 'Energy') t.Energia += c.bonus
        t.durab.push(`${p.nome}: ${p.durabMin}–${p.durabMax}`)
        continue
      }
      const m = metal(l.mat), tr = d.tiersMetal.find(x => x.id === (l.tipo === 'escudo' ? 'Escudo' : l.tier))
      if (!m || !tr) continue
      const peca = l.tipo === 'escudo' ? 3 : (SLOTS.find(s => s.id === l.slot)?.bonus ?? 0)
      t.ar += r0((m.arBase + tr.bonusAR) * tr.mult)
      t.Fis += m.resFis + tr.bonusFisTier + peca + tr.extraFis
      t.Fogo += m.resFogo; t.Gelo += m.resGelo; t.Veneno += m.resVeneno; t.Energia += m.resEnergia
      t.dex += tr.penDex; t.durab.push(`${m.nome}: ${m.durabilidade}`)
    }
    return t
  }, [linhas, d])

  const upd = (i: number, p: Partial<Linha>) => setLinhas(ls => ls.map((l, j) => j === i ? { ...l, ...p } : l))
  const conjunto = (tier: string) => {
    const mat = linhas.find(l => l.tipo !== 'couro')?.mat ?? d.metais[0].id
    setLinhas(SLOTS.map(s => ({ tipo: 'metal' as const, tier, slot: s.id, mat })))
  }

  const arma = d.armas.find(a => a.id === armaId), mAr = metal(matArma)
  const armasLista = d.armas.filter(a => a.categoria === 'forjada' || a.categoria === 'madeira')
  const madeira = d.madeiras.find(w => w.id === matArma)
  let resArma: JSX.Element
  if (arma && arma.categoria === 'forjada' && mAr) {
    const mn = arma.min + mAr.bonusDanoArma, mx = arma.max + mAr.bonusDanoArma, med = (mn + mx) / 2, pe = mAr.pctElemental
    resArma = <ul><li>Dano {mn}–{mx} (média {med.toFixed(1)}): {(med * (100 - pe) / 100).toFixed(1)} físico + {(med * pe / 100).toFixed(1)} {mAr.elementoArma === 'Nenhum' ? '(sem elemento)' : mAr.elementoArma} ({pe}%)</li>
      <li>Velocidade {arma.segundos}s: {(med / (arma.segundos || 1)).toFixed(1)} de dano por segundo (sem perícia nem talentos)</li><li>Crítico {arma.critico} ({arma.chance}%) · Durabilidade {mAr.durabilidade}</li></ul>
  } else if (arma && arma.categoria === 'madeira' && madeira) {
    const f = 1 + madeira.danoPct / 100, mn = arma.min * f, mx = arma.max * f, sg = arma.segundos / (1 + madeira.velocPct / 100)
    resArma = <ul><li>Dano {mn.toFixed(1)}–{mx.toFixed(1)} (base {arma.min}–{arma.max} x {f.toFixed(2)}), todo físico</li><li>Velocidade aproximada {sg.toFixed(2)}s (bônus de {madeira.velocPct}%): {((mn + mx) / 2 / sg).toFixed(1)} de dano por segundo</li><li>Durabilidade +{madeira.durabPct}% · Peso {madeira.pesoPct}%</li></ul>
  } else resArma = <p className="discreto">Combine arma forjada com metal, ou arma de madeira com madeira.</p>

  return (
    <>
      <div className="painel painel-fino">
        <h3 style={{ marginTop: 0 }}>Armadura (conjunto)</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          <button onClick={() => setLinhas([...linhas, { tipo: 'metal', tier: 'Placas', slot: 'peitoral', mat: d.metais[0]?.id ?? '' }])}>+ Peça de metal</button>
          <button onClick={() => setLinhas([...linhas, { tipo: 'escudo', tier: 'Escudo', slot: 'escudo', mat: d.metais[0]?.id ?? '' }])}>+ Escudo</button>
          <button onClick={() => setLinhas([...linhas, { tipo: 'couro', tier: '', slot: d.pecasCouro[0]?.id ?? '', mat: d.couros[0]?.id ?? '' }])}>+ Peça de couro</button>
          {(['Malha', 'Aneis', 'Placas'] as const).map(t => <button key={t} onClick={() => conjunto(t)}>Set de {t}</button>)}
          <button onClick={() => setLinhas([])}>Limpar</button>
        </div>
        {linhas.map((l, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            {l.tipo === 'metal' && <>
              <select value={l.tier} onChange={e => upd(i, { tier: e.target.value })}>{d.tiersMetal.filter(t => t.id !== 'Escudo').map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}</select>
              <select value={l.slot} onChange={e => upd(i, { slot: e.target.value })}>{SLOTS.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}</select></>}
            {l.tipo === 'escudo' && <span>Escudo de metal</span>}
            {l.tipo !== 'couro' && <select value={l.mat} onChange={e => upd(i, { mat: e.target.value })}>{d.metais.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}</select>}
            {l.tipo === 'couro' && <>
              <select value={l.slot} onChange={e => upd(i, { slot: e.target.value })}>{d.pecasCouro.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select>
              <select value={l.mat} onChange={e => upd(i, { mat: e.target.value })}>{d.couros.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></>}
            <button onClick={() => setLinhas(linhas.filter((_, j) => j !== i))}>x</button>
          </div>
        ))}
        <p><b>AR total {tot.ar}</b> · Físico {tot.Fis} · Fogo {tot.Fogo} · Gelo {tot.Gelo} · Veneno {tot.Veneno} · Energia {tot.Energia} · DEX −{tot.dex}</p>
        <p className="discreto" style={{ margin: 0 }}>Durabilidade por peça: {tot.durab.join(' · ') || '—'}. Usa os valores editados na tela.</p>
      </div>
      <div className="painel painel-fino">
        <h3 style={{ marginTop: 0 }}>Arma × material</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select value={armaId} onChange={e => { setArmaId(e.target.value); const a = d.armas.find(x => x.id === e.target.value); setMatArma((a?.categoria === 'madeira' ? d.madeiras[0]?.id : d.metais[0]?.id) ?? '') }}>
            {armasLista.map(a => <option key={a.id} value={a.id}>{a.nome} ({a.categoria})</option>)}</select>
          <select value={matArma} onChange={e => setMatArma(e.target.value)}>
            {arma?.categoria === 'madeira' ? d.madeiras.map(w => <option key={w.id} value={w.id}>{w.nome}</option>) : d.metais.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}</select>
        </div>
        {resArma}
      </div>
    </>
  )
}

function Exports({ onAbrir }: { onAbrir: (d: DadosMateriais) => void }) {
  const [l, setL] = useState<ExportSalvo[] | null>(null), [erro, setErro] = useState('')
  useEffect(() => { listarExports().then(r => setL(r.data.exports)).catch(e => setErro(msgErro(e))) }, [])
  if (erro) return <Erro erro={erro} />
  if (!l) return <Carregando />
  return (
    <div className="tabela-envolve"><table className="tabela">
      <thead><tr><th>Arquivo (Data/Tybar/Balanco/)</th><th>Data</th><th>Tamanho</th><th></th></tr></thead>
      <tbody>{l.map(e => <tr key={e.arquivo}><td>{e.arquivo}</td><td>{e.data}</td><td>{(e.tamanho / 1024).toFixed(0)} KB</td>
        <td><button onClick={async () => baixarJson((await baixarExport(e.arquivo)).data, e.arquivo)}>Baixar</button>{' '}
          <button onClick={async () => onAbrir((await baixarExport(e.arquivo)).data)}>Abrir na tela</button></td></tr>)}
        {l.length === 0 && <tr><td colSpan={4} className="discreto">Nenhum export salvo ainda.</td></tr>}</tbody>
    </table></div>
  )
}
