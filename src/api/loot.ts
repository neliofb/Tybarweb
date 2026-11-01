// Motor de loot e esfolar (staff): GET/POST /api/staff/loot, /api/staff/esfolar, tipos, simular, historico, reverter.
// O servidor guarda os JSON de Data/Tybar/Loot; aqui editamos o objeto cru e mandamos o arquivo inteiro de volta.
import { api } from './client'

export interface Item { tipo: string; min?: number; max?: number; chance?: number; peso?: number; tier?: number; raro?: boolean }
export interface Regra { coinMin?: number; coinMax?: number; itens?: Item[]; tabelas?: string[] }
export interface Categoria { carregaMoedas?: boolean; curvaMoedas?: number[]; regra?: Regra; ladino?: Regra }
export interface Criatura { categoria?: string; carregaMoedas?: boolean; multMoedas?: number; excecao?: Regra; ladino?: Regra }
export interface Grupo { id: string; nome?: string; rolagens?: number; maxItens?: number; chance?: number; garantido?: string; itens: Item[] }
export interface DadosLoot {
  categorias: { global?: any; padrao?: Regra; categorias: Record<string, Categoria>; [k: string]: any }
  criaturas: { criaturas: Record<string, Criatura>; [k: string]: any }
  grupos: { grupos: Grupo[]; [k: string]: any }
  ativo: boolean
  avisos?: string[]
}
export interface Tipo { nome: string; completo: string; tipo: 'item' | 'criatura' }
export interface Simulacao {
  criatura: string; faixa: number; mortes: number; origem: string; carregaMoedas: boolean; mediaMoedasCobre: number
  itens: { tipo: string; total: number; mortesComItem: number; pctMortes: number; mediaPorMorte: number }[]
}
export interface Historico { id: string; quando: string; quem: string; arquivo: string; acao: string; resumo: string }

export const getLoot = () => api.get<DadosLoot>('/api/staff/loot')
export const salvarLoot = (d: Pick<DadosLoot, 'categorias' | 'criaturas' | 'grupos'>) => api.post<DadosLoot>('/api/staff/loot', d)
export const getEsfolar = () => api.get<any>('/api/staff/esfolar')
export const salvarEsfolar = (d: { couros: any[]; extras: any[] }) => api.post<any>('/api/staff/esfolar', d)
export const buscarTipos = (q: string, tipo?: 'item' | 'criatura') => api.get<Tipo[]>('/api/staff/loot/tipos', { params: { q, tipo } })
export const simular = (p: { criatura: string; faixa: number; mortes: number; ladino: boolean }) => api.post<Simulacao>('/api/staff/loot/simular', p)
export const getHistorico = (arquivo?: string) => api.get<Historico[]>('/api/staff/loot/historico', { params: { arquivo } })
export const reverter = (id: string) => api.post<{ ok: boolean }>('/api/staff/loot/reverter', { id })

/** nome curto de um tipo completo (Server.Mobiles.Orc vira Orc) */
export const curto = (t: string) => t.slice(t.lastIndexOf('.') + 1)
