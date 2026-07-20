import { supabase } from '../lib/supabase'
import type { Match, CreateMatchDTO, UpdateMatchDTO } from '../types/matches'

const TABLE = 'matches'

export async function getMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('date', { ascending: false })

  if (error) throw error
  return data
}

export async function getMatchById(id: string): Promise<Match> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createMatch(dto: CreateMatchDTO): Promise<Match> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(dto)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateMatch(id: string, dto: UpdateMatchDTO): Promise<Match> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(dto)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteMatch(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)

  if (error) throw error
}
