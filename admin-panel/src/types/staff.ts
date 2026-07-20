import type { ID } from './common'

export type StaffCategory = 'primera' | 'infanto' | 'directivos'

export interface Staff {
  id: ID
  name: string
  role: string
  category: StaffCategory
  image_url: string | null
  active: boolean
}

export interface CreateStaffDTO {
  name: string
  role: string
  category: StaffCategory
  image_url: string | null
  active: boolean
}

export interface UpdateStaffDTO {
  name?: string
  role?: string
  category?: StaffCategory
  image_url?: string | null
  active?: boolean
}
