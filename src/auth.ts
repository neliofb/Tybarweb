import { useEffect, useState } from 'react'
import type { LoginResponse } from './api/client'

// Níveis do ServUO em ordem
export const NIVEIS = ['Player', 'VIP', 'Counselor', 'Decorator', 'Spawner', 'GameMaster', 'Seer', 'Administrator', 'Developer', 'CoOwner', 'Owner']
export const nivelIdx = (n?: string | null) => Math.max(0, NIVEIS.indexOf(n ?? 'Player'))

export interface Sessao {
  logado: boolean
  nome: string
  nivel: string
  staff: boolean
  admin: boolean
}

export function lerSessao(): Sessao {
  const token = localStorage.getItem('token')
  const isGM = localStorage.getItem('isGM') === 'true'
  const nivel = localStorage.getItem('nivel') || (isGM ? 'GameMaster' : 'Player')
  const i = nivelIdx(nivel)
  const flagStaff = localStorage.getItem('isStaff'), flagAdmin = localStorage.getItem('isAdmin')
  return {
    logado: !!token,
    nome: localStorage.getItem('charName') ?? '',
    nivel,
    staff: !!token && (flagStaff != null ? flagStaff === 'true' : isGM || i >= nivelIdx('Counselor')),
    // Sem accessLevel na resposta do login, não sabemos se é Administrator: a página de Jogadores aparece para
    // qualquer staff e a API recusa (403) o que não for permitido.
    admin: !!token && (flagAdmin != null ? flagAdmin === 'true' : i >= nivelIdx('Administrator') || (isGM && !localStorage.getItem('nivel'))),
  }
}

export function gravarLogin(r: LoginResponse) {
  localStorage.setItem('token', r.token)
  localStorage.setItem('charName', r.charName ?? '')
  localStorage.setItem('factionId', String(r.factionId ?? 0))
  localStorage.setItem('factionRole', r.factionRole ?? '')
  localStorage.setItem('isGM', String(!!r.isGM))
  const nivel = r.nivel ?? r.accessLevel
  if (nivel) localStorage.setItem('nivel', nivel); else localStorage.removeItem('nivel')
  if (r.isStaff != null) localStorage.setItem('isStaff', String(r.isStaff)); else localStorage.removeItem('isStaff')
  if (r.isAdmin != null) localStorage.setItem('isAdmin', String(r.isAdmin)); else localStorage.removeItem('isAdmin')
  window.dispatchEvent(new Event('tybar-sessao'))
}

export function sair() {
  localStorage.clear()
  window.dispatchEvent(new Event('tybar-sessao'))
}

export function useSessao(): Sessao {
  const [s, setS] = useState(lerSessao)
  useEffect(() => {
    const f = () => setS(lerSessao())
    window.addEventListener('tybar-sessao', f)
    window.addEventListener('storage', f)
    return () => { window.removeEventListener('tybar-sessao', f); window.removeEventListener('storage', f) }
  }, [])
  return s
}
