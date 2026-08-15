import { supabase } from '../lib/supabase'
import type { Match } from '../types/matches'

const TABLE = 'matches'

interface MatchRow {
  id: string
  date: string
  status: Match['status']
  goals_for: number | null
  goals_against: number | null
  competitions: { name: string } | null
  rivals: { name: string } | null
}

function toMatch(row: MatchRow): Match {
  return {
    id: row.id,
    rival: row.rivals?.name ?? '',
    date: row.date,
    competition: row.competitions?.name ?? '',
    status: row.status,
    goals_for: row.goals_for,
    goals_against: row.goals_against,
  }
}

export async function getNextMatch(): Promise<Match | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*, competitions(name), rivals(name)')
    .eq('status', 'upcoming')
    .order('date', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data ? toMatch(data) : null
}

export async function getMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*, competitions(name), rivals(name)')
    .order('date', { ascending: true })

  if (error) throw error
  return (data ?? []).map(toMatch)
}