// Animações Vrark: GET /api/staff/vrark (Counselor+) e POST (GameMaster+, lista completa de corpos)
import { api } from './client'

export const getVrark = () => api.get<{ selecionadas: number[] }>('/api/staff/vrark')
export const salvarVrark = (selecionadas: number[]) => api.post<{ selecionadas: number[] }>('/api/staff/vrark', { selecionadas })
