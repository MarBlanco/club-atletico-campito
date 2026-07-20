import type { ID } from './common'

export type MatchStatus = 'upcoming' | 'finished'

export interface Match {
  id: ID
  rival: string
  date: string
  competition: string
  status: MatchStatus
  goals_for: number | null
  goals_against: number | null
}

export interface CreateMatchDTO {
  rival: string
  date: string
  competition: string
  status: MatchStatus
  goals_for: number | null
  goals_against: number | null
}

export interface UpdateMatchDTO {
  rival?: string
  date?: string
  competition?: string
  status?: MatchStatus
  goals_for?: number | null
  goals_against?: number | null
}
