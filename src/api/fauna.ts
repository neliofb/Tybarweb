// Mapa da fauna: GET /api/fauna/mapa (público; com token de staff vêm também os números internos e os ajustes)
// e POST /api/staff/fauna/zonas (staff). O formato do servidor é convertido aqui (normalizarMapa), então as telas não
// dependem dos nomes exatos dos campos: aceita retângulo como {x,y,largura,altura} ou {x,y,w,h} ou [x,y,w,h],
// grade dos biomas como texto RLE ("id:qtd,id,...") ou array de números, horário "dia"|"noite"|"sempre" ou
// DayOnly|NightOnly|Always.
import { api } from './client'

export const MAPA_LARGURA = 6144
export const MAPA_ALTURA = 4096

export type Horario = 'sempre' | 'dia' | 'noite'

/** Uma criatura que aparece num bioma ou numa zona (o que o jogador vê). Números internos só vêm para a staff. */
export interface Aparicao {
  tipo: string
  nome: string
  horario: Horario
  perigoso: boolean
  clima?: string
  // staff
  peso?: number
  grupoMin?: number
  grupoMax?: number
  maximo?: number
}

export interface Bioma {
  id: number
  nome: string
  cor: string
  criaturas: Aparicao[]
}

export interface Retangulo { x: number; y: number; largura: number; altura: number }

export interface Ajustes {
  pericia_ataque?: number | null
  pericia_defesa?: number | null
  dano?: number | null
  vida?: number | null
  armadura?: number | null
  velocidade?: number | null
  nome?: string | null
}

export interface Zona {
  id: string
  nome: string
  /** tipo (classe) da criatura */
  criatura: string
  /** nome em português da criatura (só exibição) */
  nomeCriatura: string
  retangulos: Retangulo[]
  horario: Horario
  perigoso: boolean
  clima?: string
  // staff
  nivel?: number | null
  grupoMin?: number | null
  grupoMax?: number | null
  maximo?: number | null
  ajustes?: Ajustes
}

export interface CriaturaCatalogo { tipo: string; nome: string; perigoso?: boolean }

export interface MapaFauna {
  largura: number
  altura: number
  /** tamanho da célula da grade dos biomas, em tiles (8) */
  celula: number
  colunas: number
  linhas: number
  /** id do bioma por célula, linha a linha (0 = nenhum) */
  grade: Uint8Array
  biomas: Bioma[]
  zonas: Zona[]
  criaturas: CriaturaCatalogo[]
  climas: string[]
  geradoEm?: string
}

// Cores padrão por nome de bioma (se o servidor não mandar `cor`)
const CORES: [RegExp, string][] = [
  [/deserto/i, '#e0b45a'], [/numaja/i, '#3fb59a'], [/floresta/i, '#3d8b3a'], [/plan[ií]cie/i, '#a6c85a'],
  [/p[aâ]ntano/i, '#7a6a3a'], [/neve/i, '#dfe9f5'], [/orc/i, '#b0452f'], [/cemit/i, '#8a7aa8'],
  [/cidade/i, '#c8a24b'], [/fazenda/i, '#d79a4a'], [/cavalo/i, '#c47a3a'], [/montanha|caverna/i, '#8c8c8c'],
]
const RESERVA = ['#c06c84', '#6c8cc0', '#c0a46c', '#6cc0a4', '#a46cc0', '#c0846c']
function corPadrao(nome: string, i: number) {
  return CORES.find(([re]) => re.test(nome))?.[1] ?? RESERVA[i % RESERVA.length]
}

function horario(v: unknown): Horario {
  const s = String(v ?? '').toLowerCase()
  if (s.startsWith('d')) return 'dia'
  if (s.startsWith('n')) return 'noite'
  return 'sempre'
}
const num = (v: unknown) => (v === null || v === undefined || v === '' || isNaN(Number(v)) ? undefined : Number(v))

function aparicao(a: any): Aparicao {
  return {
    tipo: String(a.tipo ?? a.type ?? a.criatura ?? ''),
    nome: String(a.nome ?? a.pt ?? a.tipo ?? ''),
    horario: horario(a.horario ?? a.schedule),
    perigoso: !!(a.perigoso ?? a.agressivo ?? a.isRed ?? a.red),
    clima: a.clima || undefined,
    peso: num(a.peso ?? a.chance),
    grupoMin: num(a.grupoMin ?? a.grupo_min ?? a.grupo?.[0] ?? a.grupo?.min),
    grupoMax: num(a.grupoMax ?? a.grupo_max ?? a.grupo?.[1] ?? a.grupo?.max),
    maximo: num(a.maximo ?? a.max ?? a.maxVivos ?? a.max_vivos),
  }
}

function retangulo(r: any): Retangulo {
  if (Array.isArray(r)) return { x: +r[0], y: +r[1], largura: +r[2], altura: +r[3] }
  return { x: +r.x, y: +r.y, largura: +(r.largura ?? r.w ?? r.width), altura: +(r.altura ?? r.h ?? r.height) }
}

function grade(g: any, total: number): Uint8Array {
  const out = new Uint8Array(total)
  if (Array.isArray(g)) { out.set(g.slice(0, total)); return out }
  if (typeof g === 'string') {
    let i = 0
    for (const parte of g.split(',')) {
      if (!parte) continue
      const [id, qtd] = parte.split(':')
      const n = qtd ? +qtd : 1
      out.fill(+id, i, Math.min(total, i + n))
      i += n
    }
  }
  return out
}

export function normalizarMapa(d: any): MapaFauna {
  const largura = +(d.largura ?? MAPA_LARGURA), altura = +(d.altura ?? MAPA_ALTURA)
  const g = d.grade && typeof d.grade === 'object' && !Array.isArray(d.grade) ? d.grade : { dados: d.grade }
  const celula = +(g.celula ?? d.celula ?? 8)
  const colunas = +(g.colunas ?? Math.ceil(largura / celula)), linhas = +(g.linhas ?? Math.ceil(altura / celula))
  const biomas: Bioma[] = (d.biomas ?? []).map((b: any, i: number) => ({
    id: +(b.id ?? i + 1), nome: String(b.nome ?? ''), cor: b.cor || corPadrao(String(b.nome ?? ''), i),
    criaturas: (b.criaturas ?? []).map(aparicao),
  }))
  const zonas: Zona[] = (d.zonas ?? []).map((z: any, i: number): Zona => {
    const a = aparicao(z)
    const tipo = String(z.criatura?.tipo ?? z.criatura ?? z.tipo ?? '')
    return {
      id: String(z.id ?? 'z' + i), nome: String(z.nome ?? ''), criatura: tipo,
      nomeCriatura: String(z.criatura?.nome ?? z.nomeCriatura ?? z.nome_criatura ?? z.pt ?? tipo),
      retangulos: (z.retangulos ?? z.areas ?? []).map(retangulo),
      horario: a.horario, perigoso: a.perigoso, clima: z.clima || undefined,
      nivel: num(z.nivel), grupoMin: a.grupoMin, grupoMax: a.grupoMax, maximo: a.maximo,
      ajustes: z.ajustes ?? undefined,
    }
  })
  const vistos = new Map<string, CriaturaCatalogo>()
  for (const c of d.criaturas ?? []) vistos.set(String(c.tipo), { tipo: String(c.tipo), nome: String(c.nome ?? c.pt ?? c.tipo), perigoso: !!(c.perigoso ?? c.agressivo) })
  for (const b of biomas) for (const c of b.criaturas) if (!vistos.has(c.tipo)) vistos.set(c.tipo, { tipo: c.tipo, nome: c.nome, perigoso: c.perigoso })
  for (const z of zonas) if (z.criatura && !vistos.has(z.criatura)) vistos.set(z.criatura, { tipo: z.criatura, nome: z.nomeCriatura, perigoso: z.perigoso })
  return {
    largura, altura, celula, colunas, linhas, grade: grade(g.dados ?? g.rle ?? g.celulas, colunas * linhas),
    biomas, zonas, criaturas: [...vistos.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt')),
    climas: d.climas ?? ['chuva', 'tempestade', 'neve', 'nevasca', 'névoa', 'calor'],
    geradoEm: d.gerado_em ?? d.geradoEm,
  }
}

export const getMapaFauna = () => api.get<any>('/api/fauna/mapa').then(r => ({ data: normalizarMapa(r.data) }))

/** Converte a zona da tela para o corpo do POST (campos vazios viram null; ajustes vazios somem). */
export function zonaParaApi(z: Zona) {
  const aj = Object.fromEntries(Object.entries(z.ajustes ?? {}).filter(([, v]) => v !== null && v !== undefined && v !== ''))
  return {
    id: z.id.startsWith('novo-') ? null : z.id,
    nome: z.nome, criatura: z.criatura,
    retangulos: z.retangulos.map(r => ({ x: Math.round(r.x), y: Math.round(r.y), largura: Math.round(r.largura), altura: Math.round(r.altura) })),
    horario: z.horario, clima: z.clima || null,
    nivel: z.nivel ?? null, grupoMin: z.grupoMin ?? null, grupoMax: z.grupoMax ?? null, maximo: z.maximo ?? null,
    ajustes: Object.keys(aj).length ? aj : null,
  }
}

export const salvarZonas = (zonas: Zona[]) =>
  api.post<{ ok: boolean; zonas?: any[]; problemas?: string[] }>('/api/staff/fauna/zonas', { zonas: zonas.map(zonaParaApi) })

// ── Consultas usadas pelas telas ──
export function biomaEm(m: MapaFauna, x: number, y: number): Bioma | undefined {
  const cx = Math.floor(x / m.celula), cy = Math.floor(y / m.celula)
  if (cx < 0 || cy < 0 || cx >= m.colunas || cy >= m.linhas) return undefined
  const id = m.grade[cy * m.colunas + cx]
  return id ? m.biomas.find(b => b.id === id) : undefined
}
export const dentro = (r: Retangulo, x: number, y: number) => x >= r.x && y >= r.y && x < r.x + r.largura && y < r.y + r.altura
export const zonasEm = (m: { zonas: Zona[] }, x: number, y: number) => m.zonas.filter(z => z.retangulos.some(r => dentro(r, x, y)))

export const ROTULO_HORARIO: Record<Horario, string> = { sempre: 'Dia e noite', dia: 'De dia', noite: 'À noite' }

// ── Faixas por PERÍCIA DE COMBATE do jogador (1 Mão/Tactics, 0–120), por região: GET /api/fauna/niveis (público) e POST /api/staff/fauna/niveis (GameMaster+) ──
/** min/max = perícia de combate do jogador que deve upar ali (no JSON: periciaMin/periciaMax) */
export interface FaixaNivel { id: string; nome: string; min: number; max: number; cor: string; retangulos: Retangulo[] }

/** verde (fácil) → amarelo → laranja → vermelho (difícil), pela média da faixa (mesma regra do servidor) */
export function corDaFaixa(min: number, max: number) {
  const m = (min + max) / 2
  return m <= 30 ? '#4caf50' : m <= 60 ? '#d4c43a' : m <= 90 ? '#e8892b' : '#d23c3c'
}
export const PERICIA_MAX = 120
export const LEGENDA_FAIXAS = [
  { cor: '#4caf50', rotulo: 'Iniciante', dica: 'perícia até ~30' },
  { cor: '#d4c43a', rotulo: 'Médio', dica: '~31 a 60' },
  { cor: '#e8892b', rotulo: 'Avançado', dica: '~61 a 90' },
  { cor: '#d23c3c', rotulo: 'Mestre', dica: 'acima de 90' },
]

export function normalizarFaixas(d: any): FaixaNivel[] {
  return (Array.isArray(d) ? d : d?.regioes ?? []).map((r: any, i: number) => ({
    id: String(r.id ?? 'r' + i), nome: String(r.nome ?? ''), min: +(r.periciaMin ?? r.min ?? 0), max: +(r.periciaMax ?? r.max ?? 0),
    cor: corDaFaixa(+(r.periciaMin ?? r.min ?? 0), +(r.periciaMax ?? r.max ?? 0)), retangulos: (r.retangulos ?? []).map(retangulo),
  }))
}
export const getFaixasNivel = () => api.get<any>('/api/fauna/niveis').then(r => ({ data: normalizarFaixas(r.data) }))
export const salvarFaixasNivel = (fs: FaixaNivel[]) =>
  api.post<{ ok: boolean; regioes?: any[]; problemas?: string[] }>('/api/staff/fauna/niveis', {
    regioes: fs.map(f => ({ id: f.id.startsWith('novo-') ? null : f.id, nome: f.nome, periciaMin: f.min, periciaMax: f.max,
      retangulos: f.retangulos.map(r => ({ x: Math.round(r.x), y: Math.round(r.y), largura: Math.round(r.largura), altura: Math.round(r.altura) })) })),
  })

/** a faixa que vale no ponto: a menor (mais específica) entre as que contêm o ponto */
export function faixaEm(fs: FaixaNivel[], x: number, y: number) {
  let melhor: FaixaNivel | undefined, area = Infinity
  for (const f of fs) {
    if (!f.retangulos.some(r => dentro(r, x, y))) continue
    const a = f.retangulos.reduce((s, r) => s + r.largura * r.altura, 0)
    // regiões que se cruzam: vale a de perícia mais baixa (igual ao servidor, FaixasDeNivel.FaixaEm)
    if (!melhor || f.min < melhor.min || (f.min === melhor.min && (f.max < melhor.max || (f.max === melhor.max && a < area)))) { melhor = f; area = a }
  }
  return melhor
}

// ── Pintura em grade de 8x8 tiles (pincel, quadrado, círculo, borracha) ──
export const CEL = 8
const chave = (cx: number, cy: number) => cy * 4096 + cx
/** células (8x8) tocadas pelos retângulos */
export function celulasDe(rets: Retangulo[]): Set<number> {
  const s = new Set<number>()
  for (const r of rets) {
    const x0 = Math.floor(r.x / CEL), y0 = Math.floor(r.y / CEL)
    const x1 = Math.ceil((r.x + r.largura) / CEL), y1 = Math.ceil((r.y + r.altura) / CEL)
    for (let cy = y0; cy < y1; cy++) for (let cx = x0; cx < x1; cx++) s.add(chave(cx, cy))
  }
  return s
}
/** células cujo centro cai no círculo (cx, cy em tiles; diâmetro em tiles) ou no quadrado */
export function celulasForma(x: number, y: number, diametro: number, forma: 'circulo' | 'quadrado', saida = new Set<number>()) {
  const raio = Math.max(CEL / 2, diametro / 2)
  const a = Math.floor((x - raio) / CEL), b = Math.floor((x + raio) / CEL)
  const c = Math.floor((y - raio) / CEL), d = Math.floor((y + raio) / CEL)
  for (let cy = Math.max(0, c); cy <= d; cy++) for (let cx = Math.max(0, a); cx <= b; cx++) {
    const px = cx * CEL + CEL / 2, py = cy * CEL + CEL / 2
    if (forma === 'quadrado' ? Math.abs(px - x) <= raio && Math.abs(py - y) <= raio : (px - x) ** 2 + (py - y) ** 2 <= raio * raio) saida.add(chave(cx, cy))
  }
  return saida
}
/** junta as células em retângulos: corridas por linha e depois corridas iguais em linhas seguidas */
export function retangulosDe(cels: Set<number>): Retangulo[] {
  const linhas = new Map<number, number[]>()
  for (const k of cels) { const cy = Math.floor(k / 4096); (linhas.get(cy) ?? linhas.set(cy, []).get(cy)!).push(k % 4096) }
  const abertos = new Map<string, Retangulo>(), fim: Retangulo[] = []
  let ultima = -2
  for (const cy of [...linhas.keys()].sort((a, b) => a - b)) {
    const xs = linhas.get(cy)!.sort((a, b) => a - b)
    const corridas: [number, number][] = []
    for (const x of xs) { const u = corridas[corridas.length - 1]; if (u && u[0] + u[1] === x) u[1]++; else corridas.push([x, 1]) }
    const novos = new Map<string, Retangulo>()
    for (const [x, w] of corridas) {
      const k = x + ',' + w, a = cy === ultima + 1 ? abertos.get(k) : undefined
      if (a) { a.altura += CEL; novos.set(k, a); abertos.delete(k) }
      else novos.set(k, { x: x * CEL, y: cy * CEL, largura: w * CEL, altura: CEL })
    }
    for (const r of abertos.values()) fim.push(r)
    abertos.clear(); for (const [k, r] of novos) abertos.set(k, r)
    ultima = cy
  }
  for (const r of abertos.values()) fim.push(r)
  return fim
}
