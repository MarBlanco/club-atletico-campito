import type { ID } from './common'

export type MatchStatus = 'upcoming' | 'finished' | 'suspended'

export interface Match {
  id: ID
  competition_id: ID
  rival_id: ID
  date: string
  status: MatchStatus
  goals_for: number | null
  goals_against: number | null
}

export interface CreateMatchDTO {
  competition_id: ID
  rival_id: ID
  date: string
  status: MatchStatus
  goals_for: number | null
  goals_against: number | null
}

export interface UpdateMatchDTO {
  competition_id?: ID
  rival_id?: ID
  date?: string
  status?: MatchStatus
  goals_for?: number | null
  goals_against?: number | null
}