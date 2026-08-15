import type { ID } from './common'

export type UserRole = 'admin' | 'colaborador'

export interface AppUser {
  id: ID
  name: string
  email: string
  role: UserRole
  created_at: string
}

export interface AdminUser extends AppUser {
  banned: boolean
}

export interface CreateColaboradorDTO {
  name: string
  email: string
  password: string
}

export interface UpdateColaboradorDTO {
  name: string
  email: string
}
