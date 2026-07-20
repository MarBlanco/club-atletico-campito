import { supabase } from '../lib/supabase'
import type { Player, CreatePlayerDTO, UpdatePlayerDTO } from '../types/players'

const TABLE = 'players'

export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('surname', { ascending: true })

  if (error) throw error
  return data
}

export async function getPlayerById(id: string): Promise<Player> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createPlayer(dto: CreatePlayerDTO): Promise<Player> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(dto)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updatePlayer(id: string, dto: UpdatePlayerDTO): Promise<Player> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(dto)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deletePlayer(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)

  if (error) throw error
}
