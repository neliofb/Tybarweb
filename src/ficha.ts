// Regras da ficha usadas pelo simulador e pela página de build. Os números vêm de /api/ficha/regras.
// Vocações e Traços (13/11/2026): custo = caminho + vocação + traço (RegrasDaVocacao.Custo no jogo);
// build antiga com "kit" é convertida pela tabela (a) do plano (kit de vocação → vocação; kit de traço → traço).
import type { Regras, Build, Tier, Vocacao, Traco } from './api/site'

export const TIERS_PADRAO: Tier[] = [
  { id: 'Terciaria', nome: 'Terciária', multiplicador: 1 },
  { id: 'Secundaria', nome: 'Secundária', multiplicador: 2 },
  { id: 'Primaria', nome: 'Primária', multiplicador: 3 },
]
export const tiersDe = (r: Regras) => (r.tiers?.length ? r.tiers : TIERS_PADRAO)

export const NOME_CAMINHO_VOC: Record<string, string> = { Armas: 'Armas', Subterfugio: 'Subterfúgio', Sabedoria: 'Sabedoria', Oficios: 'Ofícios' }

/** Custo de 1 nível da perícia para caminho + vocação + traço (igual ao RegrasDaVocacao.Custo do jogo) */
export function custoPericia(r: Regras, pericia: string, caminho?: string, vocacao?: string, traco?: string): number {
  if (caminho && vocacao && r.custosVocacao?.[caminho]?.[vocacao]) {
    const base = r.custosVocacao[caminho][vocacao][pericia]
    const t = traco ? r.custosTraco?.[caminho]?.[vocacao]?.[traco]?.[pericia] : undefined
    if (typeof t === 'number') return t
    if (typeof base === 'number') return base
  }
  const p = r.pericias.find(x => x.id === pericia)
  if (!p) return 3
  if (typeof p.custo === 'number') return p.custo
  if (caminho && typeof p.custo?.[caminho] === 'number') return p.custo[caminho]
  const vals = Object.values(p.custo ?? {})
  return vals.length ? Math.max(...vals) : 3
}

export function pontosTotais(r: Regras, vocacao?: string, traco?: string, vantagem?: string): number {
  const v = r.vocacoes.find(x => x.id === vocacao)
  const t = r.tracos.find(x => x.id === traco)
  const va = r.vantagens?.find(x => x.id === vantagem)
  const base = r.pontosVocacao?.base ?? r.pontos.pericias
  const vers = vantagem === 'Versatilidade' ? (r.pontosVocacao?.versatilidade ?? va?.pontosExtras ?? 0) : (va?.pontosExtras ?? 0)
  return base + (v?.pontosExtra ?? 0) + (t?.pontosExtra ?? 0) + vers
}

export function pontosGastos(r: Regras, pericias: Record<string, number>, caminho?: string, vocacao?: string, traco?: string): number {
  const tiers = tiersDe(r)
  let total = 0
  for (const [id, t] of Object.entries(pericias)) {
    if (!t) continue
    total += custoPericia(r, id, caminho, vocacao, traco) * (tiers[t - 1]?.multiplicador ?? t)
  }
  return total
}

/** A vocação serve para o povo/caminho/vantagem? (Ofícios: qualquer caminho) */
export function vocacaoPermitida(v: Vocacao, povo?: string, caminho?: string, vantagem?: string): boolean {
  if (caminho && v.caminho !== 'Oficios' && v.caminho !== caminho) return false
  const caminhos = caminho ? [caminho] : Object.keys(v.permitido ?? {})
  if (!v.permitido) return true
  return caminhos.some(c => {
    const pp = v.permitido[c]
    if (!pp) return false
    if (!povo) return Object.keys(pp).length > 0
    const vs = pp[povo]
    return !!vs && (!vantagem || vs.includes(vantagem))
  })
}

/** Motivo em texto quando a vocação não serve (para mostrar no cartão). */
export function motivoVocacao(r: Regras, v: Vocacao, povo?: string, caminho?: string, vantagem?: string): string | null {
  if (vocacaoPermitida(v, povo, caminho, vantagem)) return null
  if (caminho && v.caminho !== 'Oficios' && v.caminho !== caminho) return `É do caminho ${NOME_CAMINHO_VOC[v.caminho] ?? v.caminho}.`
  const pp = caminho ? v.permitido?.[caminho] : undefined
  if (povo && pp && pp[povo] && vantagem) return `Com ${nomeDe(r.povos, povo)}, só com a vantagem ${pp[povo].map(x => nomeDe(r.vantagens, x)).join(' ou ')}.`
  const povos = pp ? Object.keys(pp) : []
  return povos.length ? `Exige ${povos.map(x => nomeDe(r.povos, x)).join(', ')}.` : 'Não serve para esta combinação.'
}

export function tracoPermitido(t: Traco, povo?: string, caminho?: string, vocacao?: string, vantagem?: string): boolean {
  if (vocacao && t.proibidoComVocacoes?.includes(vocacao)) return false
  if (vantagem && t.proibidoComVantagens?.includes(vantagem)) return false
  if (!t.permitido) return true
  const caminhos = caminho ? [caminho] : Object.keys(t.permitido)
  return caminhos.some(c => !!t.permitido[c] && (!povo || t.permitido[c].includes(povo)))
}

/** Quantas perícias podem ser Primárias (Sabe-tudo: 1) */
export function maxPrimarias(r: Regras, traco?: string): number | null {
  const t = r.tracos.find(x => x.id === traco)
  if (t) return t.primariasMax
  return r.pontosVocacao?.primariasMax ?? r.pontos.primariasMax ?? null
}
export const contaPrimarias = (r: Regras, pericias: Record<string, number>) => {
  const n = tiersDe(r).length
  return Object.values(pericias).filter(t => t === n).length
}

export const nomeDe = (lista: { id: string; nome: string }[] | undefined, id?: string) =>
  (id && lista?.find(x => x.id === id)?.nome) || id || '—'

/** Vocação/traço da build: os gravados; senão convertidos do kit antigo pela tabela (a). */
export function vocacaoTracoDe(r: Regras | null | undefined, b: Partial<Build>): { vocacao?: string; traco?: string; convertida: boolean; kitAntigo?: string } {
  if (b.vocacao || b.traco) return { vocacao: b.vocacao, traco: b.traco, convertida: !!b.convertida, kitAntigo: b.convertida ? b.kit : undefined }
  if (!b.kit || !r) return { convertida: false }
  const v = r.vocacoes.find(x => x.kitsAntigos?.includes(b.kit!))
  const t = r.tracos.find(x => x.kitAntigo === b.kit)
  return { vocacao: v?.id, traco: t?.id, convertida: true, kitAntigo: b.kit }
}

/** Aviso para build salva no sistema antigo de kits. */
export function avisoConversao(r: Regras | null | undefined, b: Partial<Build>): string | null {
  const c = vocacaoTracoDe(r, b)
  if (!c.convertida) return null
  const kit = c.kitAntigo ?? b.kit
  const kitNome = nomeDe(r?.kits, kit)
  const partes = [c.vocacao ? `vocação ${nomeDe(r?.vocacoes, c.vocacao)}` : 'vocação a escolher', c.traco ? `traço ${nomeDe(r?.tracos, c.traco)}` : 'traço a escolher']
  return `Build feita no sistema antigo de kits (${kitNome}). Foi convertida para ${partes.join(' e ')}; abra no simulador e salve para confirmar.`
}

/** O que impede a build de valer no jogo (mesmas regras da criação) */
export function problemas(r: Regras, b: Partial<Build>): string[] {
  const out: string[] = []
  const { vocacao, traco } = vocacaoTracoDe(r, b)
  if (!b.povo) out.push('Escolha um povo.')
  else if (r.povos.find(p => p.id === b.povo)?.disponivel === false) out.push(`O povo ${nomeDe(r.povos, b.povo)} está indisponível para criação por enquanto.`)
  if (!b.caminho) out.push('Escolha um caminho.')
  const v = r.vocacoes.find(x => x.id === vocacao)
  if (!v) out.push('Escolha uma vocação.')
  else {
    const m = motivoVocacao(r, v, b.povo, b.caminho, b.vantagem)
    if (m) out.push(`Vocação ${v.nome}: ${m}`)
    if (b.linha && !v.linhas.some(l => l.id === b.linha)) out.push(`A linha escolhida não é da vocação ${v.nome}.`)
    if (v.id === 'MedicoDeCombate' && (b.pericias?.Medicine ?? 0) < 2) out.push('O Médico de Combate exige Medicine primária ou secundária.')
  }
  const t = r.tracos.find(x => x.id === traco)
  if (!t) out.push('Escolha um traço.')
  else if (!tracoPermitido(t, b.povo, b.caminho, vocacao, b.vantagem)) out.push(`O traço ${t.nome} não serve para esse povo, vocação ou vantagem.`)
  const mp = maxPrimarias(r, traco)
  const np = contaPrimarias(r, b.pericias ?? {})
  if (mp != null && np > mp) out.push(`No máximo ${mp} perícia(s) Primária(s); a build tem ${np}.`)
  const va = r.vantagens?.find(x => x.id === b.vantagem)
  if (va?.povos?.length && b.povo && !va.povos.includes(b.povo)) out.push(`A vantagem ${va.nome} não é desse povo.`)
  const gastos = pontosGastos(r, b.pericias ?? {}, b.caminho, vocacao, traco)
  const total = pontosTotais(r, vocacao, traco, b.vantagem)
  if (gastos > total) out.push(`Perícias gastam ${gastos} de ${total} pontos.`)
  const a = b.atributos
  if (a && r.pontos.atributos) {
    const base = r.pontos.atributoBase ?? 30
    const g = a.str + a.dex + a.int - 3 * base
    if (g > r.pontos.atributos) out.push(`Atributos gastam ${g} de ${r.pontos.atributos} pontos.`)
  }
  return out
}
