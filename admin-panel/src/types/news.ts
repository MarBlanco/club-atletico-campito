import type { ID } from './common'

export interface News {
  id: ID
  title: string
  excerpt: string
  content: string
  image_url: string
  published: boolean
  author_id: ID | null
  created_at: string
}

export interface CreateNewsDTO {
  title: string
  excerpt: string
  content: string
  image_url: string
  published: boolean
}

export interface UpdateNewsDTO {
  title?: string
  excerpt?: string
  content?: string
  image_url?: string
  published?: boolean
}
