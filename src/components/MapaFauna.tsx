// Mapa navegável de Felucca (1 unidade = 1 tile do jogo): arrastar, roda do mouse, pinça no celular, teclado.
// Camadas: radar (public/media/mapa/felucca_<1536|3072|6144>.webp), biomas (grade 8x8 em canvas) e zonas (canvas).
// Por cima, um <svg> em coordenadas de tile para a página desenhar o que quiser (seleção, alças da staff).
import { ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { MapaFauna as Mapa, Zona } from '../api/fauna'

export interface Ponteiro { x: number; y: number; botao: number; shift: boolean; alvo: Element }

interface Props {
  mapa: Mapa
  zonas?: Zona[]
  mostrarBiomas?: boolean
  mostrarZonas?: boolean
  /** só estes biomas/zonas ficam fortes (null = todos) */
  biomasDestaque?: Set<number> | null
  zonasDestaque?: Set<string> | null
  /** zonas que a página desenha por conta própria no svg (não vão para o canvas) */
  zonasOcultas?: Set<string>
  /** só estes biomas/zonas são desenhados (undefined = todos; conjunto vazio = nenhum) */
  biomasVisiveis?: Set<number>
  zonasVisiveis?: Set<string>
  /** posição do mouse sobre o mapa, em tiles (null = saiu) */
  aoPairar?: (p: { x: number; y: number } | null) => void
  corZona?: (z: Zona) => string
  aoTocar?: (x: number, y: number) => void
  /** devolve true para tomar o gesto (desenhar/mover); aí o mapa não arrasta */
  aoApertar?: (p: Ponteiro) => boolean
  aoMover?: (p: Ponteiro) => void
  aoSoltar?: (p: Ponteiro) => void
  /** o gesto da página virou pinça (segundo dedo): desistir do que estava fazendo */
  aoCancelar?: () => void
  cursor?: string
  rotulo: string
  children?: (escala: number) => ReactNode
  altura?: string
}

export function corDoTipo(tipo: string) {
  let h = 0
  for (const c of tipo) h = (h * 31 + c.charCodeAt(0)) % 360
  return `hsl(${h} 70% 55%)`
}

const LIMITE_ZOOM = 4 // até 4 px de tela por tile

export default function MapaFauna(p: Props) {
  const { mapa } = p
  // só o mundo aberto (5660 x 4096, onde o radar tem a faixa preta): a área a leste de x=5660 (dungeons e áreas internas) fica de fora e é cortada
  const L = Math.min(mapa.largura, 5660), A = Math.min(mapa.altura, 4096)
  const caixa = useRef<HTMLDivElement>(null)
  const [vista, setVista] = useState({ s: 0.1, tx: 0, ty: 0 })
  const vref = useRef(vista); vref.current = vista
  const [tam, setTam] = useState({ w: 0, h: 0 })
  const [sob, setSob] = useState<{ x: number; y: number } | null>(null)
  const minS = useRef(0.05)

  // Ajusta ao tamanho da caixa
  const enquadrar = useCallback(() => {
    const el = caixa.current; if (!el) return
    const w = el.clientWidth, h = el.clientHeight
    const s = Math.min(w / L, h / A)
    minS.current = s * 0.8
    setVista({ s, tx: (w - L * s) / 2, ty: (h - A * s) / 2 })
  }, [L, A])
  useLayoutEffect(() => {
    const el = caixa.current; if (!el) return
    let primeiro = true
    const ro = new ResizeObserver(() => {
      setTam({ w: el.clientWidth, h: el.clientHeight })
      if (primeiro) { primeiro = false; enquadrar() }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [enquadrar])

  const zoomEm = useCallback((fator: number, cx: number, cy: number) => {
    setVista(v => {
      const s = Math.max(minS.current, Math.min(LIMITE_ZOOM, v.s * fator))
      const k = s / v.s
      return { s, tx: cx - (cx - v.tx) * k, ty: cy - (cy - v.ty) * k }
    })
  }, [])

  const paraTile = useCallback((cx: number, cy: number) => {
    const r = caixa.current!.getBoundingClientRect(), v = vref.current
    return { x: (cx - r.left - v.tx) / v.s, y: (cy - r.top - v.ty) / v.s }
  }, [])

  // Roda do mouse (passiva: false para impedir a rolagem da página)
  useEffect(() => {
    const el = caixa.current; if (!el) return
    const roda = (e: WheelEvent) => {
      e.preventDefault()
      const r = el.getBoundingClientRect()
      zoomEm(Math.pow(1.0015, -e.deltaY), e.clientX - r.left, e.clientY - r.top)
    }
    el.addEventListener('wheel', roda, { passive: false })
    return () => el.removeEventListener('wheel', roda)
  }, [zoomEm])

  // Gestos
  const toques = useRef(new Map<number, { x: number; y: number }>())
  const gesto = useRef<{ tipo: 'arrastar' | 'pinca' | 'pagina' | null; ix: number; iy: number; moveu: boolean; d0?: number; s0?: number; tx0?: number; ty0?: number; mx?: number; my?: number }>({ tipo: null, ix: 0, iy: 0, moveu: false })
  const ponteiro = (e: React.PointerEvent): Ponteiro => ({ ...paraTile(e.clientX, e.clientY), botao: e.button, shift: e.shiftKey, alvo: e.target as Element })

  const apertar = (e: React.PointerEvent) => {
    const el = caixa.current!
    el.setPointerCapture(e.pointerId)
    toques.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const g = gesto.current
    if (toques.current.size === 2) {
      if (g.tipo === 'pagina') p.aoCancelar?.()
      const [a, b] = [...toques.current.values()]
      const r = el.getBoundingClientRect(), v = vref.current
      Object.assign(g, { tipo: 'pinca', d0: Math.hypot(a.x - b.x, a.y - b.y), s0: v.s, tx0: v.tx, ty0: v.ty, mx: (a.x + b.x) / 2 - r.left, my: (a.y + b.y) / 2 - r.top, moveu: true })
      return
    }
    if (toques.current.size > 2) return
    Object.assign(g, { ix: e.clientX, iy: e.clientY, moveu: false, tx0: vref.current.tx, ty0: vref.current.ty })
    g.tipo = e.button === 0 && p.aoApertar?.(ponteiro(e)) ? 'pagina' : 'arrastar'
  }
  const mover = (e: React.PointerEvent) => {
    const t = paraTile(e.clientX, e.clientY)
    setSob({ x: Math.floor(t.x), y: Math.floor(t.y) })
    p.aoPairar?.(t)
    if (!toques.current.has(e.pointerId)) return
    toques.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const g = gesto.current
    if (Math.hypot(e.clientX - g.ix, e.clientY - g.iy) > 5) g.moveu = true
    if (g.tipo === 'pagina') p.aoMover?.(ponteiro(e))
    else if (g.tipo === 'arrastar') setVista(v => ({ ...v, tx: g.tx0! + e.clientX - g.ix, ty: g.ty0! + e.clientY - g.iy }))
    else if (g.tipo === 'pinca' && toques.current.size === 2) {
      const [a, b] = [...toques.current.values()]
      const r = caixa.current!.getBoundingClientRect()
      const s = Math.max(minS.current, Math.min(LIMITE_ZOOM, g.s0! * Math.hypot(a.x - b.x, a.y - b.y) / g.d0!))
      const mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top
      const k = s / g.s0!
      setVista({ s, tx: mx - (g.mx! - g.tx0!) * k, ty: my - (g.my! - g.ty0!) * k })
    }
  }
  const soltar = (e: React.PointerEvent) => {
    if (!toques.current.has(e.pointerId)) return
    toques.current.delete(e.pointerId)
    const g = gesto.current
    if (g.tipo === 'pagina') p.aoSoltar?.(ponteiro(e))
    else if (g.tipo === 'arrastar' && !g.moveu && e.button === 0) {
      const t = paraTile(e.clientX, e.clientY)
      if (t.x >= 0 && t.y >= 0 && t.x < L && t.y < A) p.aoTocar?.(Math.floor(t.x), Math.floor(t.y))
    }
    if (toques.current.size === 0) g.tipo = null
    else if (g.tipo === 'pinca') { // sobrou um dedo: continua arrastando a partir dele
      const [a] = [...toques.current.values()]
      Object.assign(g, { tipo: 'arrastar', ix: a.x, iy: a.y, tx0: vref.current.tx, ty0: vref.current.ty })
    }
  }

  const tecla = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement) !== caixa.current) return
    const passo = 80
    const mapaT: Record<string, () => void> = {
      ArrowLeft: () => setVista(v => ({ ...v, tx: v.tx + passo })), ArrowRight: () => setVista(v => ({ ...v, tx: v.tx - passo })),
      ArrowUp: () => setVista(v => ({ ...v, ty: v.ty + passo })), ArrowDown: () => setVista(v => ({ ...v, ty: v.ty - passo })),
      '+': () => zoomEm(1.4, tam.w / 2, tam.h / 2), '=': () => zoomEm(1.4, tam.w / 2, tam.h / 2),
      '-': () => zoomEm(1 / 1.4, tam.w / 2, tam.h / 2), '0': enquadrar,
      Enter: () => { const v = vref.current; p.aoTocar?.(Math.floor((tam.w / 2 - v.tx) / v.s), Math.floor((tam.h / 2 - v.ty) / v.s)) },
    }
    const f = mapaT[e.key]; if (f) { e.preventDefault(); f() }
  }

  // Resolução do radar conforme o zoom (a menor fica sempre por baixo)
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const px = vista.s * dpr
  const alta = px > 0.55 ? 6144 : px > 0.28 ? 3072 : 0

  // Camada de biomas
  const canvasBiomas = useRef<HTMLCanvasElement>(null)
  const cores = useMemo(() => {
    const m = new Map<number, [number, number, number]>()
    const c = document.createElement('canvas').getContext('2d')!
    for (const b of mapa.biomas) {
      c.fillStyle = b.cor; c.fillRect(0, 0, 1, 1)
      const d = c.getImageData(0, 0, 1, 1).data; m.set(b.id, [d[0], d[1], d[2]])
    }
    return m
  }, [mapa.biomas])
  useEffect(() => {
    const cv = canvasBiomas.current; if (!cv) return
    cv.width = mapa.colunas; cv.height = mapa.linhas
    const ctx = cv.getContext('2d')!
    const img = ctx.createImageData(mapa.colunas, mapa.linhas)
    const dest = p.biomasDestaque, vis = p.biomasVisiveis
    for (let i = 0; i < mapa.grade.length; i++) {
      const id = mapa.grade[i]; if (!id) continue
      if (vis && !vis.has(id)) continue
      const c = cores.get(id); if (!c) continue
      const o = i * 4
      img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]
      img.data[o + 3] = !dest ? 120 : dest.has(id) ? 210 : 20
    }
    ctx.putImageData(img, 0, 0)
  }, [mapa, cores, p.biomasDestaque, p.biomasVisiveis])

  // Camada de zonas (1 px = 4 tiles)
  const canvasZonas = useRef<HTMLCanvasElement>(null)
  const zonas = p.zonas ?? mapa.zonas
  useEffect(() => {
    const cv = canvasZonas.current; if (!cv) return
    const k = 4
    cv.width = L / k; cv.height = A / k
    const ctx = cv.getContext('2d')!
    ctx.clearRect(0, 0, cv.width, cv.height)
    const dest = p.zonasDestaque
    for (const z of zonas) {
      if (p.zonasOcultas?.has(z.id)) continue
      if (p.zonasVisiveis && !p.zonasVisiveis.has(z.id)) continue
      const forte = !dest || dest.has(z.id)
      ctx.globalAlpha = !dest ? 0.3 : forte ? 0.85 : 0.06
      ctx.fillStyle = p.corZona?.(z) ?? corDoTipo(z.criatura)
      for (const r of z.retangulos) ctx.fillRect(r.x / k, r.y / k, Math.max(1, r.largura / k), Math.max(1, r.altura / k))
    }
  }, [zonas, L, A, p.zonasDestaque, p.zonasOcultas, p.zonasVisiveis, p.corZona])

  const mundo: React.CSSProperties = {
    position: 'absolute', left: 0, top: 0, width: L, height: A,
    transform: `translate(${vista.tx}px, ${vista.ty}px) scale(${vista.s})`, transformOrigin: '0 0', overflow: 'hidden',
  }
  const camada: React.CSSProperties = { position: 'absolute', left: 0, top: 0, width: L, height: A }
  // a imagem do radar cobre só os 6144 x 4096 tiles do mundo aberto (o mapa do servidor tem 7168 de largura,
  // o resto é a área de dungeons): desenhar a imagem no tamanho dela, não esticada até a largura do mapa
  const camadaImg: React.CSSProperties = { position: 'absolute', left: 0, top: 0, width: 6144, height: 4096 }

  return (
    <div className="mapa-fauna" style={{ height: p.altura }}>
      <div
        ref={caixa} className="mapa-caixa" tabIndex={0} role="application" aria-label={p.rotulo + '. Setas movem, + e − aproximam, 0 enquadra, Enter consulta o centro.'}
        onPointerDown={apertar} onPointerMove={mover} onPointerUp={soltar} onPointerCancel={soltar}
        onPointerLeave={() => { setSob(null); p.aoPairar?.(null) }} onKeyDown={tecla} onContextMenu={e => e.preventDefault()}
        style={{ cursor: p.cursor ?? (gesto.current.tipo === 'arrastar' ? 'grabbing' : 'grab') }}
      >
        <div style={mundo}>
          <img src="/media/mapa/felucca_1536.webp" alt="" draggable={false} style={camadaImg} />
          {alta > 0 && <img src={`/media/mapa/felucca_${alta}.webp`} alt="" draggable={false} style={camadaImg} />}
          <canvas ref={canvasBiomas} aria-hidden="true" style={{ ...camada, width: mapa.colunas * 8, height: mapa.linhas * 8, imageRendering: 'pixelated', display: p.mostrarBiomas === false ? 'none' : undefined }} />
          <canvas ref={canvasZonas} aria-hidden="true" style={{ ...camada, imageRendering: 'pixelated', display: p.mostrarZonas === false ? 'none' : undefined }} />
          <svg viewBox={`0 0 ${L} ${A}`} style={{ ...camada, overflow: 'visible' }} aria-hidden="true">
            {p.children?.(vista.s)}
          </svg>
        </div>
        <div className="mapa-coord" aria-hidden="true">{sob && sob.x >= 0 && sob.y >= 0 && sob.x < L && sob.y < A ? `x ${sob.x}, y ${sob.y}` : 'Felucca'}</div>
      </div>
      <div className="mapa-zoom" role="group" aria-label="Zoom do mapa">
        <button className="btn btn-2 btn-p" onClick={() => zoomEm(1.5, tam.w / 2, tam.h / 2)} aria-label="Aproximar">+</button>
        <button className="btn btn-2 btn-p" onClick={() => zoomEm(1 / 1.5, tam.w / 2, tam.h / 2)} aria-label="Afastar">−</button>
        <button className="btn btn-2 btn-p" onClick={enquadrar} aria-label="Ver o mapa inteiro">⤢</button>
      </div>
    </div>
  )
}

/** Lista de camadas com caixas de seleção, "Selecionar tudo" e "Limpar". Só o que estiver marcado aparece no mapa. */
export function ListaMarcavel<K extends string | number>({ titulo, itens, marcados, mudar, aoEscolher, escolhido, vazio }: {
  titulo: string
  itens: { id: K; nome: string; cor: string; extra?: ReactNode }[]
  marcados: Set<K>
  mudar: (s: Set<K>) => void
  /** clicar no nome (editar): a página marca o item sozinha */
  aoEscolher?: (id: K) => void
  escolhido?: K | null
  vazio?: string
}) {
  const alternar = (id: K) => { const s = new Set(marcados); if (s.has(id)) s.delete(id); else s.add(id); mudar(s) }
  return (
    <div className="lista-marcavel">
      <div className="linha linha-entre" style={{ gap: 6, marginBottom: 6 }}>
        <strong className="lm-titulo">{titulo} <small className="discreto">({marcados.size}/{itens.length})</small></strong>
        <span className="linha" style={{ gap: 4 }}>
          <button className="btn btn-2 btn-p" onClick={() => mudar(new Set(itens.map(i => i.id)))}>Selecionar tudo</button>
          <button className="btn btn-2 btn-p" onClick={() => mudar(new Set())}>Limpar</button>
        </span>
      </div>
      <ul aria-label={titulo}>
        {itens.map(i => (
          <li key={String(i.id)} className={escolhido === i.id ? 'ativo' : undefined}>
            <input type="checkbox" checked={marcados.has(i.id)} onChange={() => alternar(i.id)} aria-label={'Mostrar ' + i.nome} />
            <span className="ponto-cor" style={{ background: i.cor }} aria-hidden="true" />
            {aoEscolher
              ? <button className="btn-link lm-nome" aria-pressed={escolhido === i.id} onClick={() => aoEscolher(i.id)}>{i.nome}</button>
              : <label className="lm-nome" onClick={() => alternar(i.id)}>{i.nome}</label>}
            {i.extra}
          </li>
        ))}
        {itens.length === 0 && <li className="discreto">{vazio ?? 'Nada aqui.'}</li>}
      </ul>
    </div>
  )
}
