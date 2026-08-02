import { supabase } from '../lib/supabase'
import type { Club } from '../types/club'

const TABLE = 'club'

export async function getClub(): Promise<Club | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}
