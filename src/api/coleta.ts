// Zonas de coleta: GET /api/staff/coleta (Counselor+), POST (GameMaster+, lista completa), GET /api/staff/coleta/tipos
import { api } from './client'
import type { Retangulo } from './fauna'

export type TipoZona = 'mina' | 'floresta' | 'ambos'
export interface ItemZona { tipo: string; peso: number; periciaMin: number | null }
export interface ExtraZona { id: string; chance: number; periciaMin: number | null }
export interface ZonaColeta {
  id: string; nome: string; cor: string; tipo: TipoZona
  minerios: ItemZona[]; madeiras: ItemZona[]; extras: ExtraZona[]; retangulos: Retangulo[]
}
export interface TiposColeta {
  minerios: { tipo: string; nome: string; periciaMin: number; periciaMax: number }[]
  madeiras: { tipo: string; nome: string; periciaMin: number; periciaMax: number }[]
  extras: { id: string; nome: string; chance: number; periciaMin: number }[]
}

const item = (i: any): ItemZona => ({ tipo: String(i.tipo), peso: +(i.peso ?? 0), periciaMin: i.periciaMin ?? null })
export function normalizarZonas(d: any): ZonaColeta[] {
  return (d?.zonas ?? []).map((z: any, i: number): ZonaColeta => ({
    id: String(z.id ?? 'z' + i), nome: String(z.nome ?? ''), cor: z.cor || '#c9a227', tipo: z.tipo ?? 'ambos',
    minerios: (z.minerios ?? []).map(item), madeiras: (z.madeiras ?? []).map(item),
    extras: (z.extras ?? []).map((e: any) => ({ id: String(e.id), chance: +e.chance, periciaMin: e.periciaMin ?? null })),
    retangulos: (z.retangulos ?? []).map((r: any) => ({ x: +r.x, y: +r.y, largura: +r.largura, altura: +r.altura })),
  }))
}
export const getZonasColeta = () => api.get<any>('/api/staff/coleta').then(r => ({ data: normalizarZonas(r.data) }))
export const getTiposColeta = () => api.get<TiposColeta>('/api/staff/coleta/tipos')
export const salvarZonasColeta = (zs: ZonaColeta[]) =>
  api.post<{ ok: boolean; zonas?: any[] }>('/api/staff/coleta', {
    zonas: zs.map(z => ({
      id: z.id.startsWith('novo-') ? null : z.id, nome: z.nome, cor: z.cor, tipo: z.tipo,
      minerios: z.tipo === 'floresta' ? [] : z.minerios, madeiras: z.tipo === 'mina' ? [] : z.madeiras, extras: z.extras,
      retangulos: z.retangulos.map(r => ({ x: Math.round(r.x), y: Math.round(r.y), largura: Math.round(r.largura), altura: Math.round(r.altura) })),
    })),
  })
