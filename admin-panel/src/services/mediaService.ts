import { supabase } from '../lib/supabase'
import type { Media, CreateMediaDTO, UpdateMediaDTO } from '../types/media'

const TABLE = 'media'

export async function getMedia(): Promise<Media[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getMediaById(id: string): Promise<Media> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createMedia(dto: CreateMediaDTO): Promise<Media> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(dto)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateMedia(id: string, dto: UpdateMediaDTO): Promise<Media> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(dto)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteMedia(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)

  if (error) throw error
}
