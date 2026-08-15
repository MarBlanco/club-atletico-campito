import { supabase } from '../lib/supabase'
import type { Competition, CreateCompetitionDTO } from '../types/competitions'

const TABLE = 'competitions'

export async function getCompetitions(): Promise<Competition[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

export async function createCompetition(dto: CreateCompetitionDTO): Promise<Competition> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(dto)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCompetition(id: string, name: string): Promise<Competition> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ name })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCompetition(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)

  if (error) throw error
}