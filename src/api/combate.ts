// Registro de combate agregado: GET /api/staff/combate?dias=N (Counselor+). {calculando:true} até o cache ficar pronto.
import { api } from './client'

export interface LinhaCombate { chave: string; causado: number; nCausado: number; recebido: number; nRecebido: number; cura: number; nCura: number; golpes: number; acertos: number; criticos: number }
export type DimCombate = 'classe' | 'estilo' | 'modelo' | 'matArma' | 'matArmadura' | 'magia' | 'escola' | 'jogador'
export type StatsCombate = { calculando?: boolean; dias?: number; arquivos?: number; eventos?: number; geradoEm?: string } & Partial<Record<DimCombate, LinhaCombate[]>>

export const getCombate = (dias: number) => api.get<StatsCombate>('/api/staff/combate', { params: { dias } })
