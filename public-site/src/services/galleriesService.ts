import { supabase } from '../lib/supabase'
import type { Gallery } from '../types/galleries'

const TABLE = 'galleries'

export async function getLatestGalleries(limit = 4): Promise<Gallery[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('match_date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export async function getGalleries(): Promise<Gallery[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('match_date', { ascending: false })

  if (error) throw error
  return data ?? []
}
