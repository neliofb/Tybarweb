import { useEffect, useMemo, useRef, useState } from 'react'
import { getMapaFauna, salvarZonas, normalizarMapa, Zona, Retangulo, Ajustes, Horario, dentro, MapaFauna as Mapa,
  getFaixasNivel, salvarFaixasNivel, normalizarFaixas, FaixaNivel, corDaFaixa, PERICIA_MAX, celulasDe, celulasForma, retangulosDe, CEL } from '../../api/fauna'
import { msgErro } from '../../api/site'
import MapaFauna, { corDoTipo, Ponteiro, ListaMarcavel } from '../../components/MapaFauna'
import { CabecalhoPagina, Carregando, Erro, Modal, useDados, useTitulo } from '../../components/ui'

type Modo = 'mover' | 'desenhar' | 'pincel' | 'quadrado' | 'circulo' | 'borracha'
type Aba = 'zonas' | 'niveis'
interface Item { id: string; retangulos: Retangulo[] }
type Arrasto =
  | { tipo: 'desenhar'; x0: number; y0: number; x1: number; y1: number }
  | { tipo: 'pintar'; apagar: boolean; cels: Set<number>; ux: number; uy: number }
  | { tipo: 'forma'; forma: 'quadrado' | 'circulo'; x0: number; y0: number; x1: number; y1: number }
  | { tipo: 'mover'; i: number; dx: number; dy: number; orig: Retangulo }
  | { tipo: 'alca'; i: number; canto: string; orig: Retangulo }

const AJUSTES: { id: keyof Ajustes; rotulo: string; dica: string; pct?: boolean }[] = [
  { id: 'pericia_ataque', rotulo: 'Perícia de ataque', dica: 'valor da perícia de ataque (0–120)' },
  { id: 'pericia_defesa', rotulo: 'Perícia de defesa', dica: 'valor da perícia de defesa (0–120)' },
  { id: 'dano', rotulo: 'Dano %', dica: 'variação em %, ex. 20 ou -15', pct: true },
  { id: 'vida', rotulo: 'Vida %', dica: 'variação em %', pct: true },
  { id: 'armadura', rotulo: 'Armadura %', dica: 'variação em %', pct: true },
  { id: 'velocidade', rotulo: 'Velocidade %', dica: 'variação em %', pct: true },
]

const norm = (a: number, b: number) => [Math.min(a, b), Math.abs(b - a)] as const
let seq = 0

/** quadrado: do canto inicial, lado = maior distância; círculo: centro no início, raio = distância */
function formaArrasto(a: { forma: 'quadrado' | 'circulo'; x0: number; y0: number; x1: number; y1: number }) {
  if (a.forma === 'circulo') { const raio = Math.hypot(a.x1 - a.x0, a.y1 - a.y0); return { cx: a.x0, cy: a.y0, d: raio * 2, raio } }
  const lado = Math.max(Math.abs(a.x1 - a.x0), Math.abs(a.y1 - a.y0))
  const x = a.x1 < a.x0 ? a.x0 - lado : a.x0, y = a.y1 < a.y0 ? a.y0 - lado : a.y0
  return { cx: x + lado / 2, cy: y + lado / 2, d: lado, raio: lado / 2 }
}
const FERRAMENTAS: { id: Modo; rotulo: string; dica: string }[] = [
  { id: 'mover', rotulo: '✥ Escolher / mover', dica: 'Arrastar o mapa, escolher, mover e redimensionar retângulos' },
  { id: 'desenhar', rotulo: '▭ Retângulo', dica: 'Arraste para criar um retângulo' },
  { id: 'pincel', rotulo: '🖌 Pincel', dica: 'Pinta arrastando (grade de 8x8 tiles)' },
  { id: 'quadrado', rotulo: '■ Quadrado', dica: 'Clique e arraste: o tamanho segue o arrasto' },
  { id: 'circulo', rotulo: '● Círculo', dica: 'Clique no centro e arraste para o raio' },
  { id: 'borracha', rotulo: '⌫ Borracha', dica: 'Apaga partes da área escolhida, do tamanho do pincel' },
]

export default function FaunaStaffPage() {
  useTitulo('Fauna (staff)')
  const d = useDados(getMapaFauna)
  const [mapa, setMapa] = useState<Mapa | null>(null)
  const [zonas, setZonas] = useState<Zona[]>([])
  const [sel, setSel] = useState<string | null>(null)
  const [retSel, setRetSel] = useState<number | null>(null)
  const [modo, setModo] = useState<Modo>('mover')
  const [arrasto, setArrasto] = useState<Arrasto | null>(null)
  const [sujo, setSujo] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null)
  const [apagar, setApagar] = useState<Zona | null>(null)
  const [busca, setBusca] = useState('')
  const [aba, setAba] = useState<Aba>('zonas')
  const [tamanho, setTamanho] = useState(48)
  const [pairar, setPairar] = useState<{ x: number; y: number } | null>(null)
  // nada desenhado de início: a staff marca o que quer ver
  const [visBiomas, setVisBiomas] = useState<Set<number>>(new Set())
  const [visZonas, setVisZonas] = useState<Set<string>>(new Set())
  const [visFaixas, setVisFaixas] = useState<Set<string>>(new Set())
  const dn = useDados(getFaixasNivel)
  const [faixas, setFaixas] = useState<FaixaNivel[]>([])
  const [selF, setSelF] = useState<string | null>(null)
  const [sujoF, setSujoF] = useState(false)
  const [apagarF, setApagarF] = useState<FaixaNivel | null>(null)

  useEffect(() => { if (d.dados) { setMapa(d.dados); setZonas(d.dados.zonas) } }, [d.dados])
  useEffect(() => { if (dn.dados) setFaixas(dn.dados) }, [dn.dados])
  useEffect(() => {
    if (!sujo && !sujoF) return
    const f = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', f)
    return () => window.removeEventListener('beforeunload', f)
  }, [sujo, sujoF])

  const zona = zonas.find(z => z.id === sel) ?? null
  const faixa = faixas.find(f => f.id === selF) ?? null
  const mudarZona = (id: string, f: (z: Zona) => Zona) => { setZonas(zs => zs.map(z => z.id === id ? f(z) : z)); setSujo(true); setAviso(null) }
  const mudarFaixa = (id: string, f: (z: FaixaNivel) => FaixaNivel) => { setFaixas(fs => fs.map(z => z.id === id ? f(z) : z)); setSujoF(true); setAviso(null) }

  // ── item em edição, genérico para as duas abas (zona de fauna ou faixa de nível) ──
  const item: Item | null = aba === 'zonas' ? zona : faixa
  const itens: Item[] = aba === 'zonas' ? zonas : faixas
  const visItens = aba === 'zonas' ? visZonas : visFaixas
  const mudarItem = (id: string, f: (i: Item) => Item) => aba === 'zonas' ? mudarZona(id, z => ({ ...z, ...f(z) })) : mudarFaixa(id, z => ({ ...z, ...f(z) }))
  /** escolher para editar já marca o item como visível */
  const escolher = (id: string | null) => {
    if (aba === 'zonas') { setSel(id); if (id) setVisZonas(v => v.has(id) ? v : new Set(v).add(id)) }
    else { setSelF(id); if (id) setVisFaixas(v => v.has(id) ? v : new Set(v).add(id)) }
    setRetSel(null)
  }
  const mudarRet = (i: number, r: Retangulo) => item && mudarItem(item.id, z => ({ ...z, retangulos: z.retangulos.map((x, j) => j === i ? r : x) }))
  const tirarRet = (i: number) => { if (!item) return; mudarItem(item.id, z => ({ ...z, retangulos: z.retangulos.filter((_, j) => j !== i) })); setRetSel(null) }

  const novaZona = (rets: Retangulo[] = []) => {
    const z: Zona = { id: 'novo-' + (++seq), nome: 'Zona nova', criatura: '', nomeCriatura: '', retangulos: rets, horario: 'sempre', perigoso: false, ajustes: {} }
    setZonas(zs => [...zs, z]); setSel(z.id); setVisZonas(v => new Set(v).add(z.id)); setRetSel(rets.length === 1 ? 0 : null); setSujo(true)
    return z
  }
  const novaFaixa = (rets: Retangulo[] = []) => {
    const f: FaixaNivel = { id: 'novo-' + (++seq), nome: 'Região nova', min: 0, max: 20, cor: corDaFaixa(0, 20), retangulos: rets }
    setFaixas(fs => [...fs, f]); setSelF(f.id); setVisFaixas(v => new Set(v).add(f.id)); setRetSel(null); setSujoF(true)
    return f
  }
  const novoItem = (rets: Retangulo[]) => { if (aba === 'zonas') novaZona(rets); else novaFaixa(rets) }

  /** pinta (ou apaga) células 8x8 na área do item escolhido; sem item, pintar cria um novo */
  const aplicarCelulas = (cels: Set<number>, apagar: boolean) => {
    if (cels.size === 0) return
    if (!item) { if (!apagar) novoItem(retangulosDe(cels)); return }
    mudarItem(item.id, z => {
      const atuais = celulasDe(z.retangulos)
      for (const c of cels) { if (apagar) atuais.delete(c); else atuais.add(c) }
      return { ...z, retangulos: retangulosDe(atuais) }
    })
    setRetSel(null)
  }

  // Tecla Delete apaga o retângulo escolhido; Esc solta a seleção
  const tiraRef = useRef(tirarRet); tiraRef.current = tirarRet
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (/INPUT|SELECT|TEXTAREA/.test(t.tagName)) return
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
      if (modo === 'borracha' && !item) { setAviso({ ok: false, texto: 'Escolha na lista a área a apagar.' }); return true }
      setArrasto({ tipo: 'pintar', apagar: modo === 'borracha', cels: celulasForma(p.x, p.y, tamanho, 'circulo'), ux: p.x, uy: p.y }); return true
    }
    if (modo === 'quadrado' || modo === 'circulo') { setArrasto({ tipo: 'forma', forma: modo, x0: p.x, y0: p.y, x1: p.x, y1: p.y }); return true }
    const zona = item
    const canto = p.alvo.getAttribute('data-alca'), ri = p.alvo.getAttribute('data-ret')
    if (zona && canto && retSel !== null) { setArrasto({ tipo: 'alca', i: retSel, canto, orig: zona.retangulos[retSel] }); return true }
    if (zona && ri !== null) {
      const i = +ri, r = zona.retangulos[i]
      setRetSel(i); setArrasto({ tipo: 'mover', i, dx: x - r.x, dy: y - r.y, orig: r }); return true
    }
    // clicou numa outra área visível: escolhe ela
    const outra = [...itens].reverse().find(z => z.id !== item?.id && visItens.has(z.id) && z.retangulos.some(r => dentro(r, p.x, p.y)))
    if (outra) { escolher(outra.id); setRetSel(outra.retangulos.findIndex(r => dentro(r, p.x, p.y))); return true }
    return false
  }
  const aoMover = (p: Ponteiro) => {
    if (!arrasto) return
    if (arrasto.tipo === 'pintar') {
      // interpola entre o último ponto e o atual para o traço não ficar com buracos
      const dist = Math.hypot(p.x - arrasto.ux, p.y - arrasto.uy), passo = Math.max(CEL / 2, tamanho / 4)
      const n = Math.ceil(dist / passo), cels = new Set(arrasto.cels)
      for (let k = 1; k <= n; k++) celulasForma(arrasto.ux + (p.x - arrasto.ux) * k / n, arrasto.uy + (p.y - arrasto.uy) * k / n, tamanho, 'circulo', cels)
      setArrasto({ ...arrasto, cels, ux: p.x, uy: p.y }); return
    }
    if (arrasto.tipo === 'forma') { setArrasto({ ...arrasto, x1: p.x, y1: p.y }); return }
    if (!item && arrasto.tipo !== 'desenhar') return
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
        if (item) { mudarItem(item.id, z => ({ ...z, retangulos: [...z.retangulos, r] })); setRetSel(item.retangulos.length) }
        else novoItem([r])
      }
    }
    if (arrasto?.tipo === 'pintar') aplicarCelulas(arrasto.cels, arrasto.apagar)
    if (arrasto?.tipo === 'forma') {
      const f = formaArrasto(arrasto)
      if (f.d >= CEL) aplicarCelulas(celulasForma(f.cx, f.cy, f.d, arrasto.forma), false)
    }
    setArrasto(null)
  }
  const previaTraco = useMemo(() => {
    if (arrasto?.tipo === 'pintar') return retangulosDe(arrasto.cels)
    if (arrasto?.tipo === 'forma') { const f = formaArrasto(arrasto); return f.d >= CEL ? retangulosDe(celulasForma(f.cx, f.cy, f.d, arrasto.forma)) : [] }
    return null
  }, [arrasto])

  const salvarFaixas = async () => {
    const ruins = faixas.filter(f => !f.nome.trim() || f.min < 0 || f.max > PERICIA_MAX || f.min > f.max || !f.retangulos.length)
    if (ruins.length) { setAviso({ ok: false, texto: `Confira nome, perícias (0 a ${PERICIA_MAX}, mín. ≤ máx.) e área de: ${ruins.map(f => f.nome || f.id).join(', ')}.` }); escolher(ruins[0].id); return }
    setSalvando(true); setAviso(null)
    try {
      const r = await salvarFaixasNivel(faixas)
      if (r.data?.regioes) {
        const novas = normalizarFaixas(r.data.regioes)
        // as novas ganham id do servidor: manter visibilidade e escolha pelo nome
        const nomesVis = new Set(faixas.filter(f => visFaixas.has(f.id)).map(f => f.nome))
        setFaixas(novas); setVisFaixas(new Set(novas.filter(f => nomesVis.has(f.nome)).map(f => f.id)))
        setSelF(faixa ? novas.find(f => f.nome === faixa.nome)?.id ?? null : null)
      }
      setSujoF(false)
      setAviso({ ok: true, texto: 'Faixas salvas. Os monstros que nascerem a partir de agora já seguem as novas faixas.' })
    } catch (e) {
      const prob = (e as any)?.response?.data?.problemas as string[] | undefined
      setAviso({ ok: false, texto: msgErro(e) + (prob?.length ? ': ' + prob.join('; ') : '') })
    } finally { setSalvando(false) }
  }

  const salvar = async () => {
    const semCriatura = zonas.filter(z => !z.criatura)
    if (semCriatura.length) { setAviso({ ok: false, texto: `Escolha a criatura de: ${semCriatura.map(z => z.nome || z.id).join(', ')}.` }); setSel(semCriatura[0].id); return }
    setSalvando(true); setAviso(null)
    try {
      const r = await salvarZonas(zonas)
      if (r.data?.zonas && mapa) {
        const m = normalizarMapa({ zonas: r.data.zonas, biomas: [], criaturas: mapa.criaturas })
        setZonas(m.zonas)
        if (sel?.startsWith('novo-')) setSel(null)
      }
      setSujo(false)
      setAviso({ ok: true, texto: 'Zonas salvas. O servidor já está usando as novas áreas.' })
    } catch (e) {
      const prob = (e as any)?.response?.data?.problemas as string[] | undefined
      setAviso({ ok: false, texto: msgErro(e) + (prob?.length ? ': ' + prob.join('; ') : '') })
    } finally { setSalvando(false) }
  }

  const ocultas = useMemo(() => new Set(aba === 'zonas' && sel ? [sel] : []), [sel, aba])
  const lista = useMemo(() => {
    const t = busca.toLowerCase()
    return zonas.filter(z => !t || (z.nome + ' ' + z.nomeCriatura + ' ' + z.criatura).toLowerCase().includes(t))
  }, [zonas, busca])

  if (d.carregando && !mapa) return <div className="pagina"><Carregando /></div>
  if (d.erro) return <div className="pagina"><Erro erro={d.erro} tentar={d.carregar} /></div>
  if (!mapa) return null

  const n = (v: string) => (v === '' ? null : Number(v))
  const campoNum = (rotulo: string, valor: number | null | undefined, mudar: (v: number | null) => void, extra?: { min?: number; max?: number; dica?: string }) => (
    <label className="campo-fauna" key={rotulo}>
      <span>{rotulo}</span>
      <input className="entrada" type="number" inputMode="numeric" value={valor ?? ''} min={extra?.min} max={extra?.max} placeholder={extra?.dica ?? 'padrão'} onChange={e => mudar(n(e.target.value))} />
    </label>
  )

  const listaRets = item && (
    <>
              <h4 style={{ marginTop: 12 }}>Retângulos ({item.retangulos.length})</h4>
              {item.retangulos.length === 0 && <p className="discreto">Use “Desenhar” e arraste no mapa.</p>}
              <div className="lista-rets">
                {item.retangulos.slice(0, 200).map((r, i) => (
                  <div key={i} className={'ret-linha' + (i === retSel ? ' ativo' : '')} onFocus={() => setRetSel(i)}>
                    {(['x', 'y', 'largura', 'altura'] as const).map(k => (
                      <label key={k}><span className="sr-only">{k} do retângulo {i + 1}</span>
                        <input className="entrada" type="number" min={k === 'x' || k === 'y' ? 0 : 1} value={r[k]} title={k} onChange={e => mudarRet(i, { ...r, [k]: Math.max(0, +e.target.value || 0) })} />
                      </label>
                    ))}
                    <button className="btn btn-2 btn-p" onClick={() => tirarRet(i)} aria-label={`Apagar retângulo ${i + 1}`}>✕</button>
                  </div>
                ))}
                {item.retangulos.length > 200 && <p className="discreto">… e mais {item.retangulos.length - 200} (edite pelo mapa).</p>}
              </div>
    </>
  )
  const ferramenta = FERRAMENTAS.find(f => f.id === modo)!
  const usaTamanho = modo === 'pincel' || modo === 'borracha'
  const sujoAba = aba === 'zonas' ? sujo : sujoF

  return (
    <div className="pagina pagina-larga">
      <CabecalhoPagina sobre="Staff" titulo="Fauna">
        Zonas de criaturas e faixas de perícia de combate por região. Coordenadas em tiles de Felucca. Nada vale até apertar Salvar.
      </CabecalhoPagina>
      <div className="abas-mapa" role="tablist" aria-label="Editor">
        <button role="tab" aria-selected={aba === 'zonas'} onClick={() => { setAba('zonas'); setRetSel(null); setAviso(null) }}>Zonas{sujo ? ' •' : ''}</button>
        <button role="tab" aria-selected={aba === 'niveis'} onClick={() => { setAba('niveis'); setRetSel(null); setAviso(null) }}>Níveis{sujoF ? ' •' : ''}</button>
      </div>
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
            {sujoAba && <span className="selo selo-pendente">Alterações não salvas</span>}
            <button className="btn" onClick={aba === 'zonas' ? salvar : salvarFaixas} disabled={salvando || !sujoAba}>{salvando ? 'Salvando…' : 'Salvar'}</button>
          </div>
          {aviso && <div className={'aviso ' + (aviso.ok ? 'aviso-ok' : 'aviso-erro')} role={aviso.ok ? 'status' : 'alert'} style={{ marginBottom: 10 }}>{aviso.texto}</div>}
          <MapaFauna
            mapa={mapa} zonas={zonas} rotulo={aba === 'zonas' ? 'Editor de zonas de fauna' : 'Editor de faixas de perícia'}
            biomasVisiveis={visBiomas} zonasVisiveis={visZonas}
            zonasOcultas={ocultas} cursor={modo === 'mover' ? undefined : usaTamanho ? 'none' : 'crosshair'}
            aoApertar={aoApertar} aoMover={aoMover} aoSoltar={aoSoltar} aoCancelar={() => setArrasto(null)} aoPairar={setPairar}
            aoTocar={(x, y) => { if (modo === 'mover') { const z = [...itens].reverse().find(z => visItens.has(z.id) && z.retangulos.some(r => dentro(r, x, y))); escolher(z?.id ?? null); if (z) setRetSel(z.retangulos.findIndex(r => dentro(r, x, y))) } }}
          >
            {s => (
              <g>
                {aba === 'niveis' && faixas.filter(f => visFaixas.has(f.id) && f.id !== selF).map(f => (
                  <g key={f.id}>
                    {f.retangulos.map((r, i) => <rect key={i} x={r.x} y={r.y} width={r.largura} height={r.altura} fill={f.cor} fillOpacity={.35} stroke={f.cor} strokeWidth={1.2 / s} />)}
                  </g>
                ))}
                {item && item.retangulos.map((r, i) => (
                  <rect key={i} data-ret={i} x={r.x} y={r.y} width={r.largura} height={r.altura}
                    fill={aba === 'zonas' ? corDoTipo(zona?.criatura || item.id) : faixa!.cor} fillOpacity={i === retSel ? .55 : .4}
                    stroke={i === retSel ? '#fff' : '#ecd38a'} strokeWidth={(i === retSel ? 2 : 1.2) / s}
                    shapeRendering="crispEdges" style={{ cursor: modo === 'mover' ? 'move' : undefined }} />
                ))}
                {aba === 'niveis' && faixas.filter(f => visFaixas.has(f.id)).map(f => {
                  const r = f.retangulos.reduce((m, q) => (q.largura * q.altura > m.largura * m.altura ? q : m), f.retangulos[0])
                  if (!r) return null
                  const fonte = Math.min(20 / s, r.largura / 4.5, r.altura / 1.6)
                  return fonte * s < 8 ? null : <text key={f.id + 't'} x={r.x + r.largura / 2} y={r.y + r.altura / 2} textAnchor="middle" dominantBaseline="middle" fontSize={fonte} fontWeight={700} fill="#fff" stroke="#000" strokeWidth={fonte / 7} paintOrder="stroke" style={{ pointerEvents: 'none' }}>{f.nome} · perícia {f.min}–{f.max}</text>
                })}
                {item && retSel !== null && item.retangulos[retSel] && modo === 'mover' && (() => {
                  const r = item.retangulos[retSel], h = 10 / s
                  const cantos: [string, number, number, string][] = [
                    ['no', r.x, r.y, 'nwse-resize'], ['nl', r.x + r.largura, r.y, 'nesw-resize'],
                    ['so', r.x, r.y + r.altura, 'nesw-resize'], ['sl', r.x + r.largura, r.y + r.altura, 'nwse-resize'],
                  ]
                  return cantos.map(([c, x, y, cur]) => <rect key={c} data-alca={c} x={x - h / 2} y={y - h / 2} width={h} height={h} fill="#ecd38a" stroke="#000" strokeWidth={1 / s} style={{ cursor: cur }} />)
                })()}
                {arrasto?.tipo === 'desenhar' && (() => {
                  const [x, w] = norm(arrasto.x0, arrasto.x1), [y, h] = norm(arrasto.y0, arrasto.y1)
                  return <rect x={x} y={y} width={w} height={h} fill="rgba(236,211,138,.25)" stroke="#ecd38a" strokeDasharray={`${6 / s} ${4 / s}`} strokeWidth={1.5 / s} />
                })()}
                {previaTraco && previaTraco.map((r, i) => (
                  <rect key={'p' + i} x={r.x} y={r.y} width={r.largura} height={r.altura}
                    fill={arrasto?.tipo === 'pintar' && arrasto.apagar ? 'rgba(210,60,60,.45)' : 'rgba(236,211,138,.45)'} />
                ))}
                {arrasto?.tipo === 'forma' && (() => {
                  const f = formaArrasto(arrasto)
                  return arrasto.forma === 'circulo'
                    ? <circle cx={f.cx} cy={f.cy} r={f.raio} fill="none" stroke="#ecd38a" strokeDasharray={`${6 / s} ${4 / s}`} strokeWidth={1.5 / s} />
                    : <rect x={f.cx - f.raio} y={f.cy - f.raio} width={f.d} height={f.d} fill="none" stroke="#ecd38a" strokeDasharray={`${6 / s} ${4 / s}`} strokeWidth={1.5 / s} />
                })()}
                {usaTamanho && pairar && (
                  <circle cx={pairar.x} cy={pairar.y} r={tamanho / 2} fill={modo === 'borracha' ? 'rgba(210,60,60,.15)' : 'rgba(236,211,138,.15)'}
                    stroke={modo === 'borracha' ? '#ff8080' : '#ecd38a'} strokeWidth={1.5 / s} style={{ pointerEvents: 'none' }} />
                )}
              </g>
            )}
          </MapaFauna>
          <p className="discreto" style={{ marginTop: 6 }}>
            {ferramenta.dica}. Pincel, quadrado, círculo e borracha trabalham numa grade de 8x8 tiles e somam (ou tiram) da área escolhida na lista; sem área
            escolhida, pintar cria uma nova. Escolher/mover: toque numa área visível, arraste o retângulo ou os cantos; Delete apaga o retângulo escolhido.
            Roda do mouse ou pinça aproximam.
          </p>
        </div>

        <aside className="mapa-lateral">
          {aba === 'zonas' ? (
            <section className="painel painel-fino">
              <div className="linha linha-entre" style={{ marginBottom: 8 }}>
                <h3 style={{ margin: 0 }}>Zonas ({zonas.length})</h3>
                <button className="btn btn-2 btn-p" onClick={() => { novaZona(); setModo('pincel') }}>+ Nova zona</button>
              </div>
              <input className="entrada" type="search" placeholder="Filtrar zonas" aria-label="Filtrar zonas" value={busca} onChange={e => setBusca(e.target.value)} style={{ marginBottom: 8 }} />
              <ListaMarcavel titulo="Mostrar no mapa" marcados={visZonas} mudar={setVisZonas} escolhido={sel} aoEscolher={id => escolher(id === sel ? null : id)} vazio="Nenhuma zona."
                itens={lista.map(z => ({ id: z.id, nome: (z.nome || '(sem nome)') + ' · ' + (z.nomeCriatura || 'sem criatura'), cor: corDoTipo(z.criatura || z.id), extra: <small className="discreto">{z.retangulos.length} ▭</small> }))} />
            </section>
          ) : (
            <section className="painel painel-fino">
              <div className="linha linha-entre" style={{ marginBottom: 8 }}>
                <h3 style={{ margin: 0 }}>Faixas de perícia ({faixas.length})</h3>
                <button className="btn btn-2 btn-p" onClick={() => { novaFaixa(); setModo('pincel') }}>+ Nova região</button>
              </div>
              {dn.erro && <p className="aviso aviso-erro">{dn.erro}</p>}
              <ListaMarcavel titulo="Mostrar no mapa" marcados={visFaixas} mudar={setVisFaixas} escolhido={selF} aoEscolher={id => escolher(id === selF ? null : id)} vazio="Nenhuma região ainda: use + Nova região e pinte."
                itens={faixas.map(f => ({ id: f.id, nome: f.nome || '(sem nome)', cor: f.cor, extra: <strong>{f.min}–{f.max}</strong> }))} />
              <p className="discreto" style={{ marginTop: 6 }}>Regiões sobrepostas: vale a menor (mais específica). Faixa = perícia de combate (1 Mão/Tactics) do jogador que deve upar ali; o monstro Tybar que nasce dentro dela é ajustado para essa perícia (ataque/defesa, vida, dano, armadura).</p>
            </section>
          )}

          <section className="painel painel-fino">
            <ListaMarcavel titulo="Biomas" itens={mapa.biomas.map(b => ({ id: b.id, nome: b.nome, cor: b.cor }))} marcados={visBiomas} mudar={setVisBiomas} />
            {aba === 'niveis' && <p className="discreto" style={{ marginTop: 6 }}>As zonas de fauna marcadas na aba Zonas também aparecem aqui como referência.</p>}
          </section>

          {aba === 'niveis' && faixa && (
            <section className="painel painel-fino form-zona" aria-label={'Região ' + faixa.nome}>
              <div className="linha linha-entre"><h3 style={{ margin: 0 }}>Região</h3><button className="btn btn-perigo btn-p" onClick={() => setApagarF(faixa)}>Apagar região</button></div>
              <label className="campo-fauna largo"><span>Nome</span>
                <input className="entrada" value={faixa.nome} maxLength={60} onChange={e => mudarFaixa(faixa.id, f => ({ ...f, nome: e.target.value }))} />
              </label>
              <div className="grade-campos">
                {campoNum('Perícia mín.', faixa.min, v => mudarFaixa(faixa.id, f => { const min = Math.max(0, Math.min(PERICIA_MAX, v ?? 0)); return { ...f, min, cor: f.cor === corDaFaixa(f.min, f.max) ? corDaFaixa(min, f.max) : f.cor } }), { min: 0, max: PERICIA_MAX })}
                {campoNum('Perícia máx.', faixa.max, v => mudarFaixa(faixa.id, f => { const max = Math.max(0, Math.min(PERICIA_MAX, v ?? 0)); return { ...f, max, cor: f.cor === corDaFaixa(f.min, f.max) ? corDaFaixa(f.min, max) : f.cor } }), { min: 0, max: PERICIA_MAX })}
              </div>
              {faixa.min > faixa.max && <p className="aviso aviso-erro">O mínimo está maior que o máximo.</p>}
              <p className="linha" style={{ gap: 8, margin: '6px 0', alignItems: 'center' }}>
                <input type="color" value={faixa.cor} onChange={e => { const cor = e.target.value; mudarFaixa(faixa.id, f => ({ ...f, cor })) }} aria-label="Cor da região" style={{ width: 40, height: 28, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }} />
                <span className="discreto">Cor no mapa dos jogadores.</span>
                {faixa.cor !== corDaFaixa(faixa.min, faixa.max) && <button type="button" className="btn-link" onClick={() => mudarFaixa(faixa.id, f => ({ ...f, cor: corDaFaixa(f.min, f.max) }))}>usar a automática</button>}
              </p>
              {listaRets}
            </section>
          )}

          {aba === 'zonas' && zona && (
            <section className="painel painel-fino form-zona" aria-label={'Zona ' + zona.nome}>
              <div className="linha linha-entre"><h3 style={{ margin: 0 }}>Zona</h3><button className="btn btn-perigo btn-p" onClick={() => setApagar(zona)}>Apagar zona</button></div>
              <label className="campo-fauna largo"><span>Nome da zona</span>
                <input className="entrada" value={zona.nome} onChange={e => mudarZona(zona.id, z => ({ ...z, nome: e.target.value }))} />
              </label>
              <label className="campo-fauna largo"><span>Criatura</span>
                <select className="entrada" value={zona.criatura} onChange={e => {
                  const c = mapa.criaturas.find(c => c.tipo === e.target.value)
                  mudarZona(zona.id, z => ({ ...z, criatura: e.target.value, nomeCriatura: c?.nome ?? e.target.value, perigoso: c?.perigoso ?? z.perigoso }))
                }}>
                  <option value="">— escolha —</option>
                  {mapa.criaturas.map(c => <option key={c.tipo} value={c.tipo}>{c.nome} ({c.tipo})</option>)}
                </select>
              </label>
              <div className="grade-campos">
                {campoNum('Nível', zona.nivel, v => mudarZona(zona.id, z => ({ ...z, nivel: v })), { min: 0 })}
                <label className="campo-fauna"><span>Horário</span>
                  <select className="entrada" value={zona.horario} onChange={e => mudarZona(zona.id, z => ({ ...z, horario: e.target.value as Horario }))}>
                    <option value="sempre">Sempre</option><option value="dia">Só de dia</option><option value="noite">Só à noite</option>
                  </select>
                </label>
                {campoNum('Grupo mín.', zona.grupoMin, v => mudarZona(zona.id, z => ({ ...z, grupoMin: v })), { min: 1 })}
                {campoNum('Grupo máx.', zona.grupoMax, v => mudarZona(zona.id, z => ({ ...z, grupoMax: v })), { min: 1 })}
                {campoNum('Máximo vivos', zona.maximo, v => mudarZona(zona.id, z => ({ ...z, maximo: v })), { min: 0 })}
                <label className="campo-fauna"><span>Clima</span>
                  <select className="entrada" value={zona.clima ?? ''} onChange={e => mudarZona(zona.id, z => ({ ...z, clima: e.target.value || undefined }))}>
                    <option value="">Qualquer</option>
                    {mapa.climas.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
              </div>
              <fieldset className="ajustes">
                <legend>Ajustes de status <small>(vazio = padrão da criatura)</small></legend>
                <div className="grade-campos">
                  {AJUSTES.map(a => campoNum(a.rotulo, zona.ajustes?.[a.id] as number | null | undefined, v => mudarZona(zona.id, z => ({ ...z, ajustes: { ...z.ajustes, [a.id]: v } })), { dica: a.dica, ...(a.pct ? { min: -90, max: 500 } : { min: 0, max: 120 }) }))}
                  <label className="campo-fauna largo"><span>Nome (da criatura nesta zona)</span>
                    <input className="entrada" value={zona.ajustes?.nome ?? ''} placeholder="padrão" onChange={e => mudarZona(zona.id, z => ({ ...z, ajustes: { ...z.ajustes, nome: e.target.value || null } }))} />
                  </label>
                </div>
              </fieldset>
              {listaRets}
            </section>
          )}
        </aside>
      </div>

      <Modal titulo="Apagar região?" aberto={!!apagarF} fechar={() => setApagarF(null)}
        acoes={<><button className="btn btn-2" onClick={() => setApagarF(null)}>Cancelar</button>
          <button className="btn btn-perigo" onClick={() => { setFaixas(fs => fs.filter(f => f.id !== apagarF!.id)); setSelF(null); setRetSel(null); setSujoF(true); setApagarF(null) }}>Apagar</button></>}>
        <p>A região “{apagarF?.nome}” (perícia {apagarF?.min}–{apagarF?.max}) some da lista. Só vale no jogo depois de Salvar.</p>
      </Modal>
      <Modal titulo="Apagar zona?" aberto={!!apagar} fechar={() => setApagar(null)}
        acoes={<><button className="btn btn-2" onClick={() => setApagar(null)}>Cancelar</button>
          <button className="btn btn-perigo" onClick={() => { setZonas(zs => zs.filter(z => z.id !== apagar!.id)); setSel(null); setRetSel(null); setSujo(true); setApagar(null) }}>Apagar</button></>}>
        <p>A zona “{apagar?.nome}” ({apagar?.retangulos.length} retângulos) some da lista. Só vale no jogo depois de Salvar.</p>
      </Modal>
    </div>
  )
}
