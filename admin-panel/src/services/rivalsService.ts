import { supabase } from '../lib/supabase'
import type { Rival, CreateRivalDTO } from '../types/rivals'

const TABLE = 'rivals'

export async function getRivals(): Promise<Rival[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

export async function createRival(dto: CreateRivalDTO): Promise<Rival> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(dto)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateRival(id: string, name: string): Promise<Rival> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ name })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteRival(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)

  if (error) throw error
}