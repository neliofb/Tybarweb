// Materiais, armaduras e armas: GET /api/staff/materiais (Counselor+, cache gerado pelo servidor),
// POST /api/staff/materiais/export (GM+, salva em Data/Tybar/Balanco), GET .../exports e .../exports/{arquivo}
import { api } from './client'

export interface Metal { id: string; nome: string; cor: number; nivel: number; arBase: number; durabilidade: number; resFis: number; resFogo: number; resGelo: number; resVeneno: number; resEnergia: number; pericia: number; bonusDanoArma: number; elementoArma: string; pctElemental: number }
export interface TierMetal { id: string; nome: string; mult: number; bonusAR: number; bonusFisTier: number; extraFis: number; penDex: number; penMageryPct: number; penSneakPct: number; nota: string }
export interface Couro { id: string; nome: string; nivel: number; elemento: string; bonus: number; hue: number; periciaMin: number; periciaMax: number }
export interface PecaCouro { id: string; nome: string; arBase: number; camada: string; durabMin: number; durabMax: number; peso: number; linha: string }
export interface Madeira { id: string; nome: string; hue: number; danoPct: number; velocPct: number; durabPct: number; pesoPct: number; defesaPct: number; pericia: number }
export interface Tecido { id: string; nome: string; nivel: number; hue: number; pericia: number }
export interface Arma { id: string; nome: string; categoria: 'forjada' | 'madeira' | 'vanilla'; forca: number; min: number; max: number; segundos: number; alcMin: number; alcMax: number; critico: string; chance: number; bonus: string }
export interface DadosMateriais {
  calculando?: boolean; geradoEm?: string; editadoEm?: string
  metais: Metal[]; tiersMetal: TierMetal[]; couros: Couro[]; pecasCouro: PecaCouro[]; madeiras: Madeira[]; tecidos: Tecido[]; armas: Arma[]
  formulas: Record<string, string>
}
export interface ExportSalvo { arquivo: string; tamanho: number; data: string }

export const getMateriais = () => api.get<DadosMateriais>('/api/staff/materiais')
export const salvarExport = (dados: DadosMateriais) => api.post<{ ok: boolean; arquivo: string; caminho: string }>('/api/staff/materiais/export', { dados })
export const listarExports = () => api.get<{ exports: ExportSalvo[] }>('/api/staff/materiais/exports')
export const baixarExport = (arquivo: string) => api.get<DadosMateriais>('/api/staff/materiais/exports/' + encodeURIComponent(arquivo))
