import type { ID } from './common'

export interface Competition {
  id: ID
  name: string
  created_at: string
}

export interface CreateCompetitionDTO {
  name: string
}