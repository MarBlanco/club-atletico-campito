import { supabase } from '../lib/supabase'
import type { Media } from '../types/media'

const TABLE = 'media'

export async function getLatestMedia(limit = 4): Promise<Media[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
