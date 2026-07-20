import type { ID } from './common'

export interface Club {
  id: ID
  history: string
  mission: string | null
  values: string | null
  location: string
  logo_url: string
  updated_at: string
}

export interface UpdateClubDTO {
  history?: string
  mission?: string | null
  values?: string | null
  location?: string
  logo_url?: string
}
