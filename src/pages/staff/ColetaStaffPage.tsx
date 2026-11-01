import { useEffect, useMemo, useRef, useState } from 'react'
import { getMapaFauna, Retangulo, dentro, celulasDe, celulasForma, retangulosDe, CEL } from '../../api/fauna'
import { getZonasColeta, getTiposColeta, salvarZonasColeta, normalizarZonas, ZonaColeta, ItemZona, TipoZona } from '../../api/coleta'
import { msgErro } from '../../api/site'
import MapaFauna, { Ponteiro, ListaMarcavel } from '../../components/MapaFauna'
import { CabecalhoPagina, Carregando, Erro, Modal, useDados, useTitulo } from '../../components/ui'

type Modo = 'mover' | 'desenhar' | 'pincel' | 'quadrado' | 'circulo' | 'borracha'
type Arrasto =
  | { tipo: 'desenhar'; x0: number; y0: number; x1: number; y1: number }
  | { tipo: 'pintar'; apagar: boolean; cels: Set<number>; ux: number; uy: number }
  | { tipo: 'forma'; forma: 'quadrado' | 'circulo'; x0: number; y0: number; x1: number; y1: number }
  | { tipo: 'mover'; i: number; dx: number; dy: number; orig: Retangulo }
  | { tipo: 'alca'; i: number; canto: string; orig: Retangulo }

const FERRAMENTAS: { id: Modo; rotulo: string; dica: string }[] = [
  { id: 'mover', rotulo: '✥ Escolher / mover', dica: 'Arrastar o mapa, escolher, mover e redimensionar retângulos' },
  { id: 'desenhar', rotulo: '▭ Retângulo', dica: 'Arraste para criar um retângulo' },
  { id: 'pincel', rotulo: '🖌 Pincel', dica: 'Pinta arrastando (grade de 8x8 tiles)' },
  { id: 'quadrado', rotulo: '■ Quadrado', dica: 'Clique e arraste: o tamanho segue o arrasto' },
  { id: 'circulo', rotulo: '● Círculo', dica: 'Clique no centro e arraste para o raio' },
  { id: 'borracha', rotulo: '⌫ Borracha', dica: 'Apaga partes da zona escolhida, do tamanho do pincel' },
]
const norm = (a: number, b: number) => [Math.min(a, b), Math.abs(b - a)] as const
let seq = 0
function formaArrasto(a: { forma: 'quadrado' | 'circulo'; x0: number; y0: number; x1: number; y1: number }) {
  if (a.forma === 'circulo') { const raio = Math.hypot(a.x1 - a.x0, a.y1 - a.y0); return { cx: a.x0, cy: a.y0, d: raio * 2, raio } }
  const lado = Math.max(Math.abs(a.x1 - a.x0), Math.abs(a.y1 - a.y0))
  const x = a.x1 < a.x0 ? a.x0 - lado : a.x0, y = a.y1 < a.y0 ? a.y0 - lado : a.y0
  return { cx: x + lado / 2, cy: y + lado / 2, d: lado, raio: lado / 2 }
}
const CORES = ['#c9a227', '#4caf50', '#4aa3d6', '#c0508a', '#e8892b', '#8d6bd6', '#3fb8a8', '#d23c3c']
const pct = (v: number) => Math.round(v * 10000) / 100

export default function ColetaStaffPage() {
  useTitulo('Coleta (staff)')
  const dm = useDados(getMapaFauna)
  const dz = useDados(getZonasColeta)
  const dt = useDados(getTiposColeta)
  const [zonas, setZonas] = useState<ZonaColeta[]>([])
  const [sel, setSel] = useState<string | null>(null)
  const [vis, setVis] = useState<Set<string>>(new Set())
  const [retSel, setRetSel] = useState<number | null>(null)
  const [modo, setModo] = useState<Modo>('mover')
  const [arrasto, setArrasto] = useState<Arrasto | null>(null)
  const [sujo, setSujo] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null)
  const [apagar, setApagar] = useState<ZonaColeta | null>(null)
  const [tamanho, setTamanho] = useState(48)
  const [pairar, setPairar] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => { if (dz.dados) setZonas(dz.dados) }, [dz.dados])
  useEffect(() => {
    if (!sujo) return
    const f = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', f)
    return () => window.removeEventListener('beforeunload', f)
  }, [sujo])

  const zona = zonas.find(z => z.id === sel) ?? null
  const mudar = (id: string, f: (z: ZonaColeta) => ZonaColeta) => { setZonas(zs => zs.map(z => z.id === id ? f(z) : z)); setSujo(true); setAviso(null) }
  const escolher = (id: string | null) => { setSel(id); if (id) setVis(v => v.has(id) ? v : new Set(v).add(id)); setRetSel(null) }
  const mudarRet = (i: number, r: Retangulo) => zona && mudar(zona.id, z => ({ ...z, retangulos: z.retangulos.map((x, j) => j === i ? r : x) }))
  const tirarRet = (i: number) => { if (!zona) return; mudar(zona.id, z => ({ ...z, retangulos: z.retangulos.filter((_, j) => j !== i) })); setRetSel(null) }

  const novaZona = (rets: Retangulo[] = []) => {
    const z: ZonaColeta = { id: 'novo-' + (++seq), nome: 'Zona nova', cor: CORES[zonas.length % CORES.length], tipo: 'ambos', minerios: [], madeiras: [], extras: [], retangulos: rets }
    setZonas(zs => [...zs, z]); setSel(z.id); setVis(v => new Set(v).add(z.id)); setRetSel(null); setSujo(true)
  }
  const aplicarCelulas = (cels: Set<number>, apagarC: boolean) => {
    if (cels.size === 0) return
    if (!zona) { if (!apagarC) novaZona(retangulosDe(cels)); return }
    mudar(zona.id, z => {
      const atuais = celulasDe(z.retangulos)
      for (const c of cels) { if (apagarC) atuais.delete(c); else atuais.add(c) }
      return { ...z, retangulos: retangulosDe(atuais) }
    })
    setRetSel(null)
  }

  const tiraRef = useRef(tirarRet); tiraRef.current = tirarRet
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (/INPUT|SELECT|TEXTAREA/.test((e.target as HTMLElement).tagName)) return
      if ((e.key === 'Delete' || e.key === 'Backspace') && retSel !== null) { e.preventDefault(); tiraRef.current(retSel) }
      if (e.key === 'Escape') setRetSel(null)
    }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [retSel])

  const T = (v: number) => Math.max(0, Math.round(v))
  const aoApertar = (p: Ponteiro) => {
    const x = T(p.x), y = T(p.y)
    if (modo === 'desenhar') { setArrasto({ tipo: 'desenhar', x0: x, y0: y, x1: x, y1: y }); return true }
    if (modo === 'pincel' || modo === 'borracha') {
      if (modo === 'borracha' && !zona) { setAviso({ ok: false, texto: 'Escolha na lista a zona a apagar.' }); return true }
      setArrasto({ tipo: 'pintar', apagar: modo === 'borracha', cels: celulasForma(p.x, p.y, tamanho, 'circulo'), ux: p.x, uy: p.y }); return true
    }
    if (modo === 'quadrado' || modo === 'circulo') { setArrasto({ tipo: 'forma', forma: modo, x0: p.x, y0: p.y, x1: p.x, y1: p.y }); return true }
    const canto = p.alvo.getAttribute('data-alca'), ri = p.alvo.getAttribute('data-ret')
    if (zona && canto && retSel !== null) { setArrasto({ tipo: 'alca', i: retSel, canto, orig: zona.retangulos[retSel] }); return true }
    if (zona && ri !== null) { const i = +ri, r = zona.retangulos[i]; setRetSel(i); setArrasto({ tipo: 'mover', i, dx: x - r.x, dy: y - r.y, orig: r }); return true }
    const outra = [...zonas].reverse().find(z => z.id !== zona?.id && vis.has(z.id) && z.retangulos.some(r => dentro(r, p.x, p.y)))
    if (outra) { escolher(outra.id); setRetSel(outra.retangulos.findIndex(r => dentro(r, p.x, p.y))); return true }
    return false
  }
  const aoMover = (p: Ponteiro) => {
    if (!arrasto) return
    if (arrasto.tipo === 'pintar') {
      const dist = Math.hypot(p.x - arrasto.ux, p.y - arrasto.uy), passo = Math.max(CEL / 2, tamanho / 4)
      const n = Math.ceil(dist / passo), cels = new Set(arrasto.cels)
      for (let k = 1; k <= n; k++) celulasForma(arrasto.ux + (p.x - arrasto.ux) * k / n, arrasto.uy + (p.y - arrasto.uy) * k / n, tamanho, 'circulo', cels)
      setArrasto({ ...arrasto, cels, ux: p.x, uy: p.y }); return
    }
    if (arrasto.tipo === 'forma') { setArrasto({ ...arrasto, x1: p.x, y1: p.y }); return }
    if (!zona && arrasto.tipo !== 'desenhar') return
    const x = T(p.x), y = T(p.y)
    if (arrasto.tipo === 'desenhar') setArrasto({ ...arrasto, x1: x, y1: y })
    else if (arrasto.tipo === 'mover') mudarRet(arrasto.i, { ...arrasto.orig, x: T(x - arrasto.dx), y: T(y - arrasto.dy) })
    else {
      const o = arrasto.orig
      let x0 = o.x, y0 = o.y, x1 = o.x + o.largura, y1 = o.y + o.altura
      if (arrasto.canto.includes('o')) x0 = x; if (arrasto.canto.includes('l')) x1 = x
      if (arrasto.canto.includes('n')) y0 = y; if (arrasto.canto.includes('s')) y1 = y
      const [nx, w] = norm(x0, x1), [ny, h] = norm(y0, y1)
      mudarRet(arrasto.i, { x: nx, y: ny, largura: Math.max(1, w), altura: Math.max(1, h) })
    }
  }
  const aoSoltar = () => {
    if (arrasto?.tipo === 'desenhar') {
      const [x, w] = norm(arrasto.x0, arrasto.x1), [y, h] = norm(arrasto.y0, arrasto.y1)
      if (w >= 2 && h >= 2) {
        const r = { x, y, largura: w, altura: h }
        if (zona) { mudar(zona.id, z => ({ ...z, retangulos: [...z.retangulos, r] })); setRetSel(zona.retangulos.length) } else novaZona([r])
      }
    }
    if (arrasto?.tipo === 'pintar') aplicarCelulas(arrasto.cels, arrasto.apagar)
    if (arrasto?.tipo === 'forma') { const f = formaArrasto(arrasto); if (f.d >= CEL) aplicarCelulas(celulasForma(f.cx, f.cy, f.d, arrasto.forma), false) }
    setArrasto(null)
  }
  const previa = useMemo(() => {
    if (arrasto?.tipo === 'pintar') return retangulosDe(arrasto.cels)
    if (arrasto?.tipo === 'forma') { const f = formaArrasto(arrasto); return f.d >= CEL ? retangulosDe(celulasForma(f.cx, f.cy, f.d, arrasto.forma)) : [] }
    return null
  }, [arrasto])

  const salvar = async () => {
    const ruins = zonas.filter(z => !z.nome.trim() || !z.retangulos.length)
    if (ruins.length) { setAviso({ ok: false, texto: `Confira nome e área de: ${ruins.map(z => z.nome || z.id).join(', ')}.` }); escolher(ruins[0].id); return }
    setSalvando(true); setAviso(null)
    try {
      const r = await salvarZonasColeta(zonas)
      if (r.data?.zonas) {
        const novas = normalizarZonas({ zonas: r.data.zonas })
        const nomesVis = new Set(zonas.filter(z => vis.has(z.id)).map(z => z.nome))
        setVis(new Set(novas.filter(z => nomesVis.has(z.nome)).map(z => z.id)))
        setSel(zona ? novas.find(z => z.nome === zona.nome)?.id ?? null : null)
        setZonas(novas)
      }
      setSujo(false)
      setAviso({ ok: true, texto: 'Zonas salvas. O servidor já usa as novas áreas.' })
    } catch (e) {
      const prob = (e as any)?.response?.data?.problemas as string[] | undefined
      setAviso({ ok: false, texto: msgErro(e) + (prob?.length ? ': ' + prob.join('; ') : '') })
    } finally { setSalvando(false) }
  }

  if ((dm.carregando && !dm.dados) || (dz.carregando && !dz.dados)) return <div className="pagina"><Carregando /></div>
  if (dm.erro) return <div className="pagina"><Erro erro={dm.erro} tentar={dm.carregar} /></div>
  if (dz.erro) return <div className="pagina"><Erro erro={dz.erro} tentar={dz.carregar} /></div>
  if (!dm.dados) return null
  const mapa = dm.dados, tipos = dt.dados
  const usaTamanho = modo === 'pincel' || modo === 'borracha'
  const ferramenta = FERRAMENTAS.find(f => f.id === modo)!

  const editorItens = (rotulo: string, chave: 'minerios' | 'madeiras', z: ZonaColeta) => {
    const lista = z[chave], opcoes = (chave === 'minerios' ? tipos?.minerios : tipos?.madeiras) ?? []
    const total = lista.reduce((s, i) => s + i.peso, 0)
    const set = (tipo: string, f: (i: ItemZona) => ItemZona) => mudar(z.id, zz => ({ ...zz, [chave]: zz[chave].map(i => i.tipo === tipo ? f(i) : i) }))
    return (
      <fieldset className="ajustes">
        <legend>{rotulo} <small>(todos com peso 0 = sorteio clássico por perícia)</small></legend>
        {opcoes.map(o => {
          const i = lista.find(x => x.tipo === o.tipo)
          return (
            <div className="linha" key={o.tipo} style={{ gap: 6, alignItems: 'center', marginBottom: 4 }}>
              <input type="checkbox" checked={!!i} aria-label={o.nome}
                onChange={e => mudar(z.id, zz => ({ ...zz, [chave]: e.target.checked ? [...zz[chave], { tipo: o.tipo, peso: 0, periciaMin: null }] : zz[chave].filter(x => x.tipo !== o.tipo) }))} />
              <span style={{ flex: 1 }}>{o.nome} <small className="discreto">({o.periciaMin}+)</small></span>
              {i && <>
                <input className="entrada" type="number" min={0} style={{ width: 70 }} value={i.peso} title="peso" onChange={e => set(o.tipo, x => ({ ...x, peso: Math.max(0, +e.target.value || 0) }))} />
                <small className="discreto" style={{ minWidth: '5ch' }}>{total > 0 ? pct(i.peso / total) + '%' : '—'}</small>
                <input className="entrada" type="number" min={0} max={120} style={{ width: 64 }} value={i.periciaMin ?? ''} placeholder="perícia" title="perícia mínima (vazio = padrão)" onChange={e => set(o.tipo, x => ({ ...x, periciaMin: e.target.value === '' ? null : +e.target.value }))} />
              </>}
            </div>
          )
        })}
        {!opcoes.length && <p className="discreto">Carregando tipos…</p>}
      </fieldset>
    )
  }

  return (
    <div className="pagina pagina-larga">
      <CabecalhoPagina sobre="Staff" titulo="Coleta">
        Zonas de minério e madeira pintadas no mapa de Felucca. Nada vale até apertar Salvar.
      </CabecalhoPagina>
      <div className="mapa-layout mapa-layout-staff">
        <div>
          <div className="ferramentas-pintura">
            <div className="chips" role="group" aria-label="Ferramenta">
              {FERRAMENTAS.map(f => <button key={f.id} className="chip" aria-pressed={modo === f.id} onClick={() => setModo(f.id)} title={f.dica}>{f.rotulo}</button>)}
            </div>
            {usaTamanho && (
              <label className="linha" style={{ gap: 6 }}>
                <span>Tamanho</span>
                <input type="range" min={8} max={200} step={8} value={tamanho} onChange={e => setTamanho(+e.target.value)} aria-label="Tamanho do pincel em tiles" />
                <strong style={{ minWidth: '4ch' }}>{tamanho}</strong><small className="discreto">tiles</small>
              </label>
            )}
            <span style={{ flex: 1 }} />
            {sujo && <span className="selo selo-pendente">Alterações não salvas</span>}
            <button className="btn" onClick={salvar} disabled={salvando || !sujo}>{salvando ? 'Salvando…' : 'Salvar'}</button>
          </div>
          {aviso && <div className={'aviso ' + (aviso.ok ? 'aviso-ok' : 'aviso-erro')} role={aviso.ok ? 'status' : 'alert'} style={{ marginBottom: 10 }}>{aviso.texto}</div>}
          <MapaFauna mapa={mapa} rotulo="Editor de zonas de coleta" biomasVisiveis={new Set()} zonasVisiveis={new Set()}
            cursor={modo === 'mover' ? undefined : usaTamanho ? 'none' : 'crosshair'}
            aoApertar={aoApertar} aoMover={aoMover} aoSoltar={aoSoltar} aoCancelar={() => setArrasto(null)} aoPairar={setPairar}
            aoTocar={(x, y) => { if (modo === 'mover') { const z = [...zonas].reverse().find(z => vis.has(z.id) && z.retangulos.some(r => dentro(r, x, y))); escolher(z?.id ?? null); if (z) setRetSel(z.retangulos.findIndex(r => dentro(r, x, y))) } }}>
            {s => (
              <g>
                {zonas.filter(z => vis.has(z.id) && z.id !== sel).map(z => z.retangulos.map((r, i) =>
                  <rect key={z.id + i} x={r.x} y={r.y} width={r.largura} height={r.altura} fill={z.cor} fillOpacity={.35} stroke={z.cor} strokeWidth={1.2 / s} />))}
                {zona && zona.retangulos.map((r, i) => (
                  <rect key={i} data-ret={i} x={r.x} y={r.y} width={r.largura} height={r.altura} fill={zona.cor} fillOpacity={i === retSel ? .55 : .4}
                    stroke={i === retSel ? '#fff' : '#ecd38a'} strokeWidth={(i === retSel ? 2 : 1.2) / s} shapeRendering="crispEdges" style={{ cursor: modo === 'mover' ? 'move' : undefined }} />
                ))}
                {zonas.filter(z => vis.has(z.id) && z.retangulos.length).map(z => {
                  const r = z.retangulos.reduce((m, q) => (q.largura * q.altura > m.largura * m.altura ? q : m), z.retangulos[0])
                  const fonte = Math.min(20 / s, r.largura / 4.5, r.altura / 1.6)
                  return fonte * s < 8 ? null : <text key={z.id + 't'} x={r.x + r.largura / 2} y={r.y + r.altura / 2} textAnchor="middle" dominantBaseline="middle" fontSize={fonte} fontWeight={700} fill="#fff" stroke="#000" strokeWidth={fonte / 7} paintOrder="stroke" style={{ pointerEvents: 'none' }}>{z.nome}</text>
                })}
                {zona && retSel !== null && zona.retangulos[retSel] && modo === 'mover' && (() => {
                  const r = zona.retangulos[retSel], h = 10 / s
                  const cantos: [string, number, number, string][] = [['no', r.x, r.y, 'nwse-resize'], ['nl', r.x + r.largura, r.y, 'nesw-resize'], ['so', r.x, r.y + r.altura, 'nesw-resize'], ['sl', r.x + r.largura, r.y + r.altura, 'nwse-resize']]
                  return cantos.map(([c, x, y, cur]) => <rect key={c} data-alca={c} x={x - h / 2} y={y - h / 2} width={h} height={h} fill="#ecd38a" stroke="#000" strokeWidth={1 / s} style={{ cursor: cur }} />)
                })()}
                {arrasto?.tipo === 'desenhar' && (() => {
                  const [x, w] = norm(arrasto.x0, arrasto.x1), [y, h] = norm(arrasto.y0, arrasto.y1)
                  return <rect x={x} y={y} width={w} height={h} fill="rgba(236,211,138,.25)" stroke="#ecd38a" strokeDasharray={`${6 / s} ${4 / s}`} strokeWidth={1.5 / s} />
                })()}
                {previa && previa.map((r, i) => <rect key={'p' + i} x={r.x} y={r.y} width={r.largura} height={r.altura} fill={arrasto?.tipo === 'pintar' && arrasto.apagar ? 'rgba(210,60,60,.45)' : 'rgba(236,211,138,.45)'} />)}
                {arrasto?.tipo === 'forma' && (() => {
                  const f = formaArrasto(arrasto)
                  return arrasto.forma === 'circulo'
                    ? <circle cx={f.cx} cy={f.cy} r={f.raio} fill="none" stroke="#ecd38a" strokeDasharray={`${6 / s} ${4 / s}`} strokeWidth={1.5 / s} />
                    : <rect x={f.cx - f.raio} y={f.cy - f.raio} width={f.d} height={f.d} fill="none" stroke="#ecd38a" strokeDasharray={`${6 / s} ${4 / s}`} strokeWidth={1.5 / s} />
                })()}
                {usaTamanho && pairar && <circle cx={pairar.x} cy={pairar.y} r={tamanho / 2} fill={modo === 'borracha' ? 'rgba(210,60,60,.15)' : 'rgba(236,211,138,.15)'} stroke={modo === 'borracha' ? '#ff8080' : '#ecd38a'} strokeWidth={1.5 / s} style={{ pointerEvents: 'none' }} />}
              </g>
            )}
          </MapaFauna>
          <p className="discreto" style={{ marginTop: 6 }}>{ferramenta.dica}. Delete apaga o retângulo escolhido. Roda do mouse ou pinça aproximam.</p>
        </div>

        <aside className="mapa-lateral">
          <section className="painel painel-fino">
            <div className="linha linha-entre" style={{ marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>Zonas ({zonas.length})</h3>
              <button className="btn btn-2 btn-p" onClick={() => { novaZona(); setModo('pincel') }}>+ Nova zona</button>
            </div>
            <ListaMarcavel titulo="Mostrar no mapa" marcados={vis} mudar={setVis} escolhido={sel} aoEscolher={id => escolher(id === sel ? null : id)} vazio="Nenhuma zona ainda: use + Nova zona e pinte."
              itens={zonas.map(z => ({ id: z.id, nome: z.nome || '(sem nome)', cor: z.cor, extra: <small className="discreto">{z.tipo}</small> }))} />
          </section>

          <section className="painel painel-fino">
            <h3 style={{ marginTop: 0 }}>Como usar</h3>
            <ol className="discreto" style={{ paddingLeft: 18, margin: 0 }}>
              <li>+ Nova zona e pinte a área (pincel, quadrado, círculo; borracha tira).</li>
              <li>Dê nome e escolha mina, floresta ou ambos.</li>
              <li>Marque os minérios/madeiras que saem ali. Pesos: todos 0 = sorteio clássico por perícia (mais raro primeiro); com pesos, sorteia entre os liberados pela perícia, na proporção.</li>
              <li>Extras: chance por golpe bem-sucedido (desmarcado = padrão do jogo). Os talentos continuam valendo.</li>
              <li>Áreas sobrepostas: vale a menor. Fora de zona: ferro e madeira comum. Aperte Salvar.</li>
            </ol>
          </section>

          {zona && (
            <section className="painel painel-fino form-zona" aria-label={'Zona ' + zona.nome}>
              <div className="linha linha-entre"><h3 style={{ margin: 0 }}>Zona</h3><button className="btn btn-perigo btn-p" onClick={() => setApagar(zona)}>Apagar zona</button></div>
              <label className="campo-fauna largo"><span>Nome</span>
                <input className="entrada" value={zona.nome} maxLength={60} onChange={e => mudar(zona.id, z => ({ ...z, nome: e.target.value }))} /></label>
              <label className="campo-fauna largo"><span>Tipo</span>
                <select className="entrada" value={zona.tipo} onChange={e => mudar(zona.id, z => ({ ...z, tipo: e.target.value as TipoZona }))}>
                  <option value="mina">Mina</option><option value="floresta">Floresta</option><option value="ambos">Ambos</option>
                </select></label>
              <p className="linha" style={{ gap: 8, margin: '6px 0', alignItems: 'center' }}>
                <input type="color" value={zona.cor} onChange={e => { const cor = e.target.value; mudar(zona.id, z => ({ ...z, cor })) }} aria-label="Cor da zona" style={{ width: 40, height: 28, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }} />
                <span className="discreto">Cor no mapa.</span></p>
              {zona.tipo !== 'floresta' && editorItens('Minérios', 'minerios', zona)}
              {zona.tipo !== 'mina' && editorItens('Madeiras', 'madeiras', zona)}
              {zona.tipo !== 'floresta' && (
                <fieldset className="ajustes">
                  <legend>Extras na mineração <small>(chance por golpe; desmarcado = padrão)</small></legend>
                  {(tipos?.extras ?? []).map(o => {
                    const e = zona.extras.find(x => x.id === o.id)
                    return (
                      <div className="linha" key={o.id} style={{ gap: 6, alignItems: 'center', marginBottom: 4 }}>
                        <input type="checkbox" checked={!!e} aria-label={o.nome}
                          onChange={ev => mudar(zona.id, z => ({ ...z, extras: ev.target.checked ? [...z.extras, { id: o.id, chance: o.chance, periciaMin: null }] : z.extras.filter(x => x.id !== o.id) }))} />
                        <span style={{ flex: 1 }}>{o.nome} <small className="discreto">(padrão {pct(o.chance)}%, perícia {o.periciaMin}+)</small></span>
                        {e && <>
                          <input className="entrada" type="number" min={0} max={100} step={0.1} style={{ width: 70 }} value={pct(e.chance)} title="chance em %"
                            onChange={ev => mudar(zona.id, z => ({ ...z, extras: z.extras.map(x => x.id === o.id ? { ...x, chance: Math.min(1, Math.max(0, (+ev.target.value || 0) / 100)) } : x) }))} /><small>%</small>
                          <input className="entrada" type="number" min={0} max={120} style={{ width: 64 }} value={e.periciaMin ?? ''} placeholder="perícia" title="perícia mínima (vazio = padrão)"
                            onChange={ev => mudar(zona.id, z => ({ ...z, extras: z.extras.map(x => x.id === o.id ? { ...x, periciaMin: ev.target.value === '' ? null : +ev.target.value } : x) }))} />
                        </>}
                      </div>
                    )
                  })}
                </fieldset>
              )}
              <h4 style={{ marginTop: 12 }}>Retângulos ({zona.retangulos.length})</h4>
              <div className="lista-rets">
                {zona.retangulos.slice(0, 200).map((r, i) => (
                  <div key={i} className={'ret-linha' + (i === retSel ? ' ativo' : '')} onFocus={() => setRetSel(i)}>
                    {(['x', 'y', 'largura', 'altura'] as const).map(k => (
                      <label key={k}><span className="sr-only">{k} do retângulo {i + 1}</span>
                        <input className="entrada" type="number" min={k === 'x' || k === 'y' ? 0 : 1} value={r[k]} title={k} onChange={e => mudarRet(i, { ...r, [k]: Math.max(0, +e.target.value || 0) })} /></label>
                    ))}
                    <button className="btn btn-2 btn-p" onClick={() => tirarRet(i)} aria-label={`Apagar retângulo ${i + 1}`}>✕</button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>

      <Modal titulo="Apagar zona?" aberto={!!apagar} fechar={() => setApagar(null)}
        acoes={<><button className="btn btn-2" onClick={() => setApagar(null)}>Cancelar</button>
          <button className="btn btn-perigo" onClick={() => { setZonas(zs => zs.filter(z => z.id !== apagar!.id)); setSel(null); setRetSel(null); setSujo(true); setApagar(null) }}>Apagar</button></>}>
        <p>A zona “{apagar?.nome}” some da lista. Só vale no jogo depois de Salvar.</p>
      </Modal>
    </div>
  )
}
