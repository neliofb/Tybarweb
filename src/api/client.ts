import axios from 'axios'

// Em dev o vite.config.ts faz proxy de /api → localhost:8085
// Em produção usa a variável de ambiente VITE_API_URL
const BASE = import.meta.env.VITE_API_URL ?? ''

const api = axios.create({ baseURL: BASE })

// Injeta o token em todas as requisições
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers!.Authorization = `Bearer ${token}`
  return cfg
})

// Se o servidor devolver 401, limpa o token e redireciona para login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Tipos de resposta ──────────────────────────────────────────────────

export interface LoginResponse {
  token:       string
  charName:    string
  factionId:   number
  factionRole: string
  isGM:        boolean
}

export interface Coins {
  gold:        number
  silver:      number
  copper:      number
  totalCopper: number
}

export interface MeResponse {
  name:        string
  factionId:   number
  factionName: string
  factionRole: string
  online:      boolean
  coins:       Coins
}

export interface FactionSummary {
  id:          number
  name:        string
  description: string
  hue:         number
  parentId:    number
  bankBalance: number
  memberCount: number
}

export interface FactionMember {
  name:   string
  role:   string
  online: boolean
}

export interface FactionDetail extends FactionSummary {
  ledger:  string[]
  members: FactionMember[]
}

export interface Territory {
  id:           number
  name:         string
  mapX:         number
  mapY:         number
  imagePath:    string
  factionOwner: number
  adjacentIds:  number[]
}

export interface PendingMove {
  playerName: string
  factionId:  number
  fromId:     number
  toId:       number
  troops:     number
}

export interface WarFaction {
  id:   number
  name: string
  hue:  number
}

export interface WarState {
  territories:   Territory[]
  pendingMoves:  PendingMove[]
  history:       string[]
  nextTurnAt:    string
  copperPerTroop:number
  maxTroops:     number
  warFactions:   WarFaction[]  // facções mães para colorir o mapa
}

export interface MyMove {
  from:        string
  to:          string
  troops:      number
  submittedAt: string
}

// ── Funções da API ─────────────────────────────────────────────────────

export const login = (username: string, password: string) =>
  api.post<LoginResponse>('/api/login', { username, password })

export const getMe = () =>
  api.get<MeResponse>('/api/me')

export const getFactions = () =>
  api.get<{ factions: FactionSummary[] }>('/api/factions')

export const getFactionById = (id: number) =>
  api.get<FactionDetail>('/api/factions/' + id)

export const getWarState = () =>
  api.get<WarState>('/api/war/state')

export const submitWarMove = (fromTerritory: number, toTerritory: number, troops: number) =>
  api.post<{ success: boolean; message: string }>('/api/war/move', {
    fromTerritory,
    toTerritory,
    troops,
  })

export const getMyMoves = () =>
  api.get<{ moves: MyMove[] }>('/api/war/mymoves')
