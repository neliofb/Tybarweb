// Regras da ficha usadas pelo simulador e pela página de build. Os números vêm de /api/ficha/regras.
import type { Regras, Build, Tier, Kit } from './api/site'

export const TIERS_PADRAO: Tier[] = [
  { id: 'Terciaria', nome: 'Terciária', multiplicador: 1 },
  { id: 'Secundaria', nome: 'Secundária', multiplicador: 2 },
  { id: 'Primaria', nome: 'Primária', multiplicador: 3 },
]
export const tiersDe = (r: Regras) => (r.tiers?.length ? r.tiers : TIERS_PADRAO)

/** Custo de 1 nível da perícia para o caminho e kit escolhidos (igual ao CustoDaPericia do jogo, se a API mandar a tabela) */
export function custoPericia(r: Regras, pericia: string, caminho?: string, kit?: string): number {
  if (caminho && r.custos?.[caminho]) {
    const t = r.custos[caminho]
    const v = (kit && t[kit]?.[pericia]) ?? t['_']?.[pericia]
    if (typeof v === 'number') return v
  }
  const p = r.pericias.find(x => x.id === pericia)
  if (!p) return 3
  if (typeof p.custo === 'number') return p.custo
  if (caminho && typeof p.custo?.[caminho] === 'number') return p.custo[caminho]
  const vals = Object.values(p.custo ?? {})
  return vals.length ? Math.max(...vals) : 3
}

export function pontosTotais(r: Regras, kit?: string, vantagem?: string): number {
  const k = r.kits.find(x => x.id === kit)
  const v = r.vantagens?.find(x => x.id === vantagem)
  return r.pontos.pericias + (k?.pontosExtras ?? 0) + (v?.pontosExtras ?? 0)
}

export function pontosGastos(r: Regras, pericias: Record<string, number>, caminho?: string, kit?: string): number {
  const tiers = tiersDe(r)
  let total = 0
  for (const [id, t] of Object.entries(pericias)) {
    if (!t) continue
    total += custoPericia(r, id, caminho, kit) * (tiers[t - 1]?.multiplicador ?? t)
  }
  return total
}

/** permitido = {caminho: [povos]} (lista vazia = todos os povos); sem o campo, o kit serve para todos */
export function kitPermitido(k: Kit, povo?: string, caminho?: string) {
  if (!k.permitido) return true
  const caminhos = Object.keys(k.permitido)
  if (!caminho) return !povo || caminhos.some(c => !k.permitido![c].length || k.permitido![c].includes(povo))
  const povos = k.permitido[caminho]
  return !!povos && (!povos.length || !povo || povos.includes(povo))
}

/** Quantas perícias podem ser Primárias (null = sem limite) */
export function maxPrimarias(r: Regras, kit?: string): number | null {
  const p = r.pontos
  if (kit === 'SabeTudo' && p.primariasMaxSabeTudo != null) return p.primariasMaxSabeTudo
  return p.primariasMax ?? null
}
export const contaPrimarias = (r: Regras, pericias: Record<string, number>) => {
  const n = tiersDe(r).length
  return Object.values(pericias).filter(t => t === n).length
}

export const nomeDe = (lista: { id: string; nome: string }[] | undefined, id?: string) =>
  (id && lista?.find(x => x.id === id)?.nome) || id || '—'

export interface Problema { texto: string }
/** O que impede a build de valer no jogo (mesmas regras da criação) */
export function problemas(r: Regras, b: Partial<Build>): string[] {
  const out: string[] = []
  if (!b.povo) out.push('Escolha um povo.')
  else if (r.povos.find(p => p.id === b.povo)?.disponivel === false) out.push(`O povo ${nomeDe(r.povos, b.povo)} está indisponível para criação por enquanto.`)
  if (!b.caminho) out.push('Escolha um caminho.')
  const k = r.kits.find(x => x.id === b.kit)
  if (k && !kitPermitido(k, b.povo, b.caminho)) out.push(`O kit ${k.nome} não serve para esse povo ou caminho.`)
  const mp = maxPrimarias(r, b.kit)
  const np = contaPrimarias(r, b.pericias ?? {})
  if (mp != null && np > mp) out.push(`No máximo ${mp} perícia(s) Primária(s); a build tem ${np}.`)
  const v = r.vantagens?.find(x => x.id === b.vantagem)
  if (v?.povos?.length && b.povo && !v.povos.includes(b.povo)) out.push(`A vantagem ${v.nome} não é desse povo.`)
  const gastos = pontosGastos(r, b.pericias ?? {}, b.caminho, b.kit)
  const total = pontosTotais(r, b.kit, b.vantagem)
  if (gastos > total) out.push(`Perícias gastam ${gastos} de ${total} pontos.`)
  const a = b.atributos
  if (a && r.pontos.atributos) {
    const base = r.pontos.atributoBase ?? 30
    const g = a.str + a.dex + a.int - 3 * base
    if (g > r.pontos.atributos) out.push(`Atributos gastam ${g} de ${r.pontos.atributos} pontos.`)
  }
  return out
}
