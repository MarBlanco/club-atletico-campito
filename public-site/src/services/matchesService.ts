import { supabase } from '../lib/supabase'
import type { Match } from '../types/matches'

const TABLE = 'matches'

export async function getNextMatch(): Promise<Match | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('status', 'upcoming')
    .order('date', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('date', { ascending: true })

  if (error) throw error
  return data ?? []
}
