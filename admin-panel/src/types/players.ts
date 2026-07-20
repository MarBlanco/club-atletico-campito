import type { ID } from './common'

export type Position = 'Arquero' | 'Defensor' | 'Mediocampista' | 'Delantero'

export interface Player {
  id: ID
  name: string
  surname: string
  number: number
  position: Position
  image_url: string
  active: boolean
  created_at: string
}

export interface CreatePlayerDTO {
  name: string
  surname: string
  number: number
  position: Position
  image_url: string
  active: boolean
}

export interface UpdatePlayerDTO {
  name?: string
  surname?: string
  number?: number
  position?: Position
  image_url?: string
  active?: boolean
}
