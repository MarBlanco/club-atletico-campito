import type { ID } from './common'

export type GalleryCategory = 'primera' | 'infanto' | 'femenino' | 'veteranos' | 'familias' | 'hinchas'

export interface Gallery {
  id: ID
  title: string
  category: GalleryCategory
  match_date: string
  cover_image: string
  created_at: string
}
