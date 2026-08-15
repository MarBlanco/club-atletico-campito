import type { ID } from './common'

export interface Rival {
  id: ID
  name: string
  created_at: string
}

export interface CreateRivalDTO {
  name: string
}