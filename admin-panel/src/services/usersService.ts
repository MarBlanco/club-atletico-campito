import { supabase } from '../lib/supabase'
import type { AppUser } from '../types/user'

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