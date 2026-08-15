import { supabase } from '../lib/supabase'
import type { Player } from '../types/player'

const TABLE = 'players'

export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('active', true)
    .order('surname', { ascending: true })

  if (error) throw error
  return data
}