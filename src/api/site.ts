// API do site (contrato em TybarServer/Tybar/docs/planos/site_tybar.md, inclusive a seção "Ajustes do contrato").
// As funções daqui convertem o formato da API para o formato usado pelas telas (normalizar*), então as páginas não
// dependem dos nomes exatos dos campos do servidor.
import { api } from './client'

type Resp<T> = Promise<{ data: T }>
const mapa = <A, B>(p: Promise<{ data: A }>, f: (a: A) => B): Resp<B> => p.then(r => ({ data: f(r.data) }))
const enc = encodeURIComponent

// ── Códice ──────────────────────────────────────────────────────────
export interface CapituloResumo { id: string; titulo: string; ordem: number; secao?: string }
export interface Capitulo { id?: string; titulo: string; html: string; secao?: string; imagem?: number | string }

export const getCodice = () => api.get<CapituloResumo[]>('/api/codice')
export const getCapitulo = (id: string) => api.get<Capitulo>('/api/codice/' + enc(id))

// ── Ficha / simulador ───────────────────────────────────────────────
export interface Povo { id: string; nome: string; grupo?: string; descricao: string; vantagem?: string }
export interface Vantagem { id: string; nome: string; descricao: string; povos?: string[]; pontosExtras?: number }
export interface Caminho { id: string; nome: string; descricao: string }
export interface Kit {
  id: string; nome: string; descricao: string
  /** caminho → povos permitidos (lista vazia = todos). Sem o campo: kit livre. */
  permitido?: Record<string, string[]>
  pontosExtras?: number
}
export interface Classe { id: string; nome: string; descricao: string; caminho?: string; nivel?: number }
export interface Pericia {
  id: string; nome: string; grupo: string; descricao: string; formula?: string
  /** Custo por nível sem kit: número fixo ou por caminho ({Armas:1, Subterfugio:2, ...}) */
  custo: number | Record<string, number>
}
export interface Tier { id: string; nome: string; multiplicador: number; valor?: number; teto?: number }
export interface Regras {
  povos: Povo[]
  vantagens?: Vantagem[]
  caminhos: Caminho[]
  kits: Kit[]
  classes: Classe[]
  pericias: Pericia[]
  tiers?: Tier[]
  /** Custos finais calculados pelo jogo: custos[caminho][kit ou "_"][pericia] */
  custos?: Record<string, Record<string, Record<string, number>>>
  pontos: {
    pericias: number; atributos?: number; atributoMin?: number; atributoMax?: number; atributoBase?: number
    /** Limite de perícias Primárias (e o limite com o kit Sabe-Tudo) */
    primariasMax?: number; primariasMaxSabeTudo?: number
  }
}

// Formato do servidor (Ajustes do contrato)
interface RegrasApi {
  atributos?: { base: number; min: number; max: number; pontos: number }
  pericias_pontos?: { base: number; sabeTudo?: number; versatilidade?: number; primariasMax?: number; primariasMaxSabeTudo?: number }
  tiers?: { id: string; nome: string; multiplicador: number; inicio?: number; teto?: number }[]
  povos: { id: string; nome: string; raca?: string; descricao: string; vantagemDoPovo?: string; grupo?: string; vantagem?: string }[]
  vantagens?: { id: string; nome: string; raca?: string; descricao: string; povos?: string[]; pontosExtras?: number }[]
  caminhos: Caminho[]
  kits: Kit[]
  classes?: Classe[]
  pericias: Pericia[]
  custos?: Regras['custos']
  pontos?: Regras['pontos']
}
export function normalizarRegras(a: RegrasApi): Regras {
  if (a.pontos) return a as unknown as Regras // já no formato das telas (mock antigo)
  const pp = a.pericias_pontos ?? { base: 22 }
  const raca = (id: string) => a.povos.find(p => p.id === id)?.raca
  return {
    povos: a.povos.map(p => ({ id: p.id, nome: p.nome, grupo: p.grupo ?? p.raca, descricao: p.descricao, vantagem: p.vantagem ?? p.vantagemDoPovo })),
    vantagens: (a.vantagens ?? []).map(v => ({
      id: v.id, nome: v.nome, descricao: v.descricao,
      povos: v.povos ?? (v.raca ? a.povos.filter(p => raca(p.id) === v.raca).map(p => p.id) : undefined),
      pontosExtras: v.pontosExtras ?? (v.id === 'Versatilidade' ? pp.versatilidade : undefined),
    })),
    caminhos: a.caminhos,
    kits: a.kits.map(k => ({ ...k, pontosExtras: k.pontosExtras ?? (k.id === 'SabeTudo' ? pp.sabeTudo : undefined) })),
    classes: a.classes ?? [],
    pericias: a.pericias,
    tiers: a.tiers?.map(t => ({ id: t.id, nome: t.nome, multiplicador: t.multiplicador, valor: t.inicio, teto: t.teto })),
    custos: a.custos,
    pontos: {
      pericias: pp.base,
      atributos: a.atributos?.pontos, atributoMin: a.atributos?.min, atributoMax: a.atributos?.max, atributoBase: a.atributos?.base,
      primariasMax: pp.primariasMax, primariasMaxSabeTudo: pp.primariasMaxSabeTudo,
    },
  }
}
let cacheRegras: Promise<{ data: Regras }> | null = null
export const getRegras = () => {
  cacheRegras ??= mapa(api.get<RegrasApi>('/api/ficha/regras'), normalizarRegras)
  cacheRegras.catch(() => { cacheRegras = null })
  return cacheRegras
}

// ── Builds ──────────────────────────────────────────────────────────
export type TipoBuild = 'oficial' | 'comunidade'
export interface Build {
  id: string
  nome: string
  descricao?: string
  tipo: TipoBuild
  autor?: string
  /** "Estilo": texto livre (ex.: "Guerreiro de uma mão"); NÃO é a classe de talento do nível 4 */
  estilo?: string
  /** Arte (caminho em /media/… ou URL), usada pelas builds padrão */
  imagem?: string
  comoJoga?: string
  porque?: string
  classe?: string
  povo?: string
  vantagem?: string
  caminho?: string
  kit?: string
  atributos?: { str: number; dex: number; int: number }
  /** perícia → índice do tier (1 = Terciária, 2 = Secundária, 3 = Primária) */
  pericias?: Record<string, number>
  pontos?: { gastos: number; total: number }
  criadaEm?: string
  atualizadaEm?: string
  minha?: boolean
  emUso?: boolean
}
export type BuildEntrada = Omit<Build, 'id' | 'tipo' | 'autor' | 'criadaEm' | 'atualizadaEm' | 'minha' | 'emUso' | 'pontos'> & { tipo?: TipoBuild }

const TIER_IDS = ['', 'Terciaria', 'Secundaria', 'Primaria']
function normalizarBuild(x: any): Build {
  const at = x.atributos
  const per: Record<string, number> = {}
  for (const [k, v] of Object.entries(x.pericias ?? {})) {
    const n = typeof v === 'number' ? v : TIER_IDS.indexOf(String(v))
    if (n > 0) per[k] = n
  }
  return {
    ...x,
    estilo: x.estilo ?? x.classe,
    comoJoga: x.comoJoga ?? x.como_joga,
    porque: x.porque ?? x.porQue ?? x.por_que,
    atributos: at ? { str: at.str ?? at.forca, dex: at.dex ?? at.destreza, int: at.int ?? at.inteligencia } : undefined,
    pericias: per,
    criadaEm: x.criadaEm ?? x.criada,
    atualizadaEm: x.atualizadaEm ?? x.atualizada,
  }
}
function paraApi(b: BuildEntrada) {
  const { atributos, pericias, ...resto } = b
  return {
    ...resto,
    atributos: atributos ? { forca: atributos.str, destreza: atributos.dex, inteligencia: atributos.int } : undefined,
    pericias: Object.fromEntries(Object.entries(pericias ?? {}).filter(([, t]) => t > 0).map(([k, t]) => [k, TIER_IDS[t]])),
  }
}
const lista = (d: any): any[] => (Array.isArray(d) ? d : d?.builds ?? [])

export const getBuilds = (tipo?: TipoBuild) =>
  mapa(api.get<any>('/api/builds', { params: tipo ? { tipo } : undefined }), d => lista(d).map(normalizarBuild))
export const getMinhasBuilds = () =>
  mapa(api.get<any>('/api/builds/minhas'), d => {
    const usando = d?.usando ?? null
    return lista(d).map(x => ({ ...normalizarBuild(x), minha: true, emUso: x.id === usando || !!x.emUso }))
  })
export const getBuild = (id: string) => mapa(api.get<any>('/api/builds/' + enc(id)), normalizarBuild)
export const criarBuild = (b: BuildEntrada) => mapa(api.post<any>('/api/builds', paraApi(b)), normalizarBuild)
export const salvarBuild = (id: string, b: BuildEntrada) => mapa(api.put<any>('/api/builds/' + enc(id), paraApi(b)), normalizarBuild)
export const apagarBuild = (id: string) => api.delete('/api/builds/' + enc(id))
export const usarBuild = (id: string) => api.post<{ ok: boolean; usando?: string; mensagem?: string }>('/api/builds/' + enc(id) + '/usar')
export const desmarcarBuild = () => api.delete('/api/builds/usar')

// ── Cadastro (Discord → pedido) ─────────────────────────────────────
export type StatusPedido = 'sem_discord' | 'fora_do_servidor' | 'sem_pedido' | 'pendente' | 'aprovado' | 'recusado'
export interface StatusCadastro {
  status: StatusPedido
  discord?: { id: string; nome: string; avatar?: string | null }
  login?: string
  motivo?: string
  criadoEm?: string
}
export const URL_DISCORD_LOGIN = (import.meta.env.VITE_API_URL ?? '') + '/api/discord/login'
/** Junta GET /api/discord/sessao e GET /api/contas/pedido/status num estado só */
export async function getStatusPedido(): Resp<StatusCadastro> {
  const s = await api.get<{ conectado: boolean; discordId?: string; nome?: string; avatar?: string | null }>('/api/discord/sessao')
    .then(r => r.data).catch(e => { if ([401, 404].includes(e?.response?.status)) return { conectado: false } as { conectado: boolean; discordId?: string; nome?: string; avatar?: string | null }; throw e })
  if (!s.conectado) return { data: { status: 'sem_discord' } }
  const discord = { id: s.discordId ?? '', nome: s.nome ?? '', avatar: s.avatar }
  const p = await api.get<{ status: string; login?: string; motivo?: string; criado?: string }>('/api/contas/pedido/status')
    .then(r => r.data).catch(e => { if (e?.response?.status === 404) return { status: 'nenhum' } as { status: string; login?: string; motivo?: string; criado?: string }; throw e })
  const st = (p.status === 'nenhum' ? 'sem_pedido' : p.status) as StatusPedido
  return { data: { status: st, discord, login: p.login, motivo: p.motivo, criadoEm: p.criado } }
}
export const enviarPedido = (login: string, senha: string) =>
  api.post<{ ok: boolean; status: string; id?: string }>('/api/contas/pedido', { login, senha })

// ── Bestiário e ofícios (logado) ────────────────────────────────────
export interface Criatura {
  tipo: string; nome: string; pt?: string; custom?: boolean
  vida?: number; str?: number; dex?: number; int?: number; dmin?: number; dmax?: number; armadura?: number
  /** físico, fogo, frio, veneno, energia */
  res?: number[]
  domavel?: boolean; domar?: number; vagas?: number; montaria?: boolean
  carne?: number; couro?: number; tipocouro?: string; comida?: string; fama?: number
  onde?: string[]; img?: string
}
export const getBestiario = () =>
  mapa(api.get<any>('/api/bestiario'), d => (Array.isArray(d) ? d : d?.animais ?? d?.criaturas ?? []) as Criatura[])

export interface Material { tipo?: string; nome: string; quantidade: number }
export interface Receita {
  id: string; oficio: string; categoria?: string; nome: string
  pericia?: string; requisito?: number; secundarias?: unknown
  materiais?: Material[]; resultado?: number; tempo_s?: number | null; estacao?: string
}
export interface OficioInfo { pericia?: string; chance?: string; ganho?: string; tempo?: string; variantes?: { nome: string; requisito: number }[] }
export interface Oficios { oficios?: Record<string, OficioInfo>; itens: Receita[]; gerado_em?: string }
export const getOficios = () => api.get<Oficios>('/api/oficios')

// ── Staff ───────────────────────────────────────────────────────────
export interface PedidoConta {
  id: string; login: string; status: StatusPedido
  discordId: string; discordNome: string
  criadoEm: string; motivo?: string; decididoPor?: string; decididoEm?: string
}
export interface ContaStaff {
  login: string; nivel: string; banido: boolean
  discordId?: string; discordNome?: string
  personagens?: { nome: string; online?: boolean }[]
  criadaEm?: string; ultimoAcesso?: string
}
export const getPedidos = () =>
  mapa(api.get<any[]>('/api/staff/pedidos', { params: { status: 'todos' } }), d =>
    d.map((p): PedidoConta => ({ ...p, criadoEm: p.criadoEm ?? p.criado })))
export const aprovarPedido = (id: string) => api.post('/api/staff/pedidos/' + enc(id) + '/aprovar')
export const recusarPedido = (id: string, motivo: string) => api.post('/api/staff/pedidos/' + enc(id) + '/recusar', { motivo })
export const getContas = (busca: string) =>
  mapa(api.get<any[]>('/api/staff/contas', { params: { busca } }), d => d.map((c): ContaStaff => ({
    ...c,
    discordId: c.discordId ?? c.discord?.id, discordNome: c.discordNome ?? c.discord?.nome,
    criadaEm: c.criadaEm ?? c.criada, ultimoAcesso: c.ultimoAcesso ?? c.ultimoLogin,
  })))
export const trocarSenha = (login: string, senha: string) => api.post('/api/staff/contas/' + enc(login) + '/senha', { senha })
export const mudarNivel = (login: string, nivel: string) => api.post('/api/staff/contas/' + enc(login) + '/nivel', { nivel })
export const banir = (login: string, banido: boolean, motivo?: string) =>
  api.post('/api/staff/contas/' + enc(login) + '/ban', { banido, motivo })
export const tornarOficial = (id: string, oficial = true) => api.post('/api/staff/builds/' + enc(id) + '/oficial', { oficial })

/** Mensagem de erro amigável a partir de um erro do axios ({error} no contrato; {problemas} ao salvar build) */
export function msgErro(e: any, padrao = 'Não foi possível falar com o servidor.'): string {
  const d = e?.response?.data
  if (typeof d === 'string' && d.length < 200 && !d.startsWith('<')) return d
  const base = d?.error ?? d?.erro ?? d?.mensagem
  if (Array.isArray(d?.problemas) && d.problemas.length) return (base ? base + ' ' : '') + d.problemas.join(' ')
  if (base) return base
  const st = e?.response?.status
  if (st === 403) return 'Sua conta não tem permissão para isso.'
  if (st === 404) return 'Ainda não disponível no servidor.'
  if (st === 429) return 'Muitas tentativas. Espere um pouco e tente de novo.'
  if (st === 503) return 'Serviço ainda não configurado no servidor.'
  return padrao
}
