import { supabase } from '../lib/supabase'
import type { News } from '../types/news'

const TABLE = 'news'

export async function getLatestNews(limit = 3): Promise<News[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getPublishedNews(): Promise<News[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
