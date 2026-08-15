import { supabase } from '../lib/supabase'
import type { AppUser, AdminUser, CreateColaboradorDTO, UpdateColaboradorDTO } from '../types/user'

const TABLE = 'users'

export async function getUsers(): Promise<AppUser[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function getUserById(id: string): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase.rpc('admin_list_users')
  if (error) throw error
  return data
}

export async function adminCreateUser(dto: CreateColaboradorDTO): Promise<void> {
  const { error } = await supabase.rpc('admin_create_user', {
    p_name: dto.name,
    p_email: dto.email,
    p_password: dto.password,
  })
  if (error) throw error
}

export async function adminUpdateUser(id: string, dto: UpdateColaboradorDTO): Promise<void> {
  const { error } = await supabase.rpc('admin_update_user', {
    p_id: id,
    p_name: dto.name,
    p_email: dto.email,
  })
  if (error) throw error
}

export async function adminUpdateUserPassword(id: string, password: string): Promise<void> {
  const { error } = await supabase.rpc('admin_update_user_password', {
    p_id: id,
    p_password: password,
  })
  if (error) throw error
}

export async function adminSetUserBanned(id: string, banned: boolean): Promise<void> {
  const { error } = await supabase.rpc('admin_set_user_banned', {
    p_id: id,
    p_banned: banned,
  })
  if (error) throw error
}

export async function adminDeleteUser(id: string): Promise<void> {
  const { error } = await supabase.rpc('admin_delete_user', { p_id: id })
  if (error) throw error
}