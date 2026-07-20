import { supabase } from '../lib/supabase'
import type { Club, UpdateClubDTO } from '../types/club'

const TABLE = 'club'

export async function getClub(): Promise<Club> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .limit(1)
    .single()

  if (error) throw error
  return data
}

export async function updateClub(id: string, dto: UpdateClubDTO): Promise<Club> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(dto)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
