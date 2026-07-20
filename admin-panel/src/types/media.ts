import type { ID } from './common'

export type MediaType = 'image' | 'video'

export interface Media {
  id: ID
  gallery_id: ID
  type: MediaType
  url: string
  thumbnail_url: string | null
  created_at: string
}

export interface CreateMediaDTO {
  gallery_id: ID
  type: MediaType
  url: string
  thumbnail_url: string | null
}

export interface UpdateMediaDTO {
  gallery_id?: ID
  type?: MediaType
  url?: string
  thumbnail_url?: string | null
}
