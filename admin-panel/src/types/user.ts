import type { ID } from './common'

export type UserRole = 'admin' | 'colaborador'

export interface AppUser {
  id: ID
  name: string
  email: string
  role: UserRole
  created_at: string
}
