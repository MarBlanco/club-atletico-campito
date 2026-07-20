import { supabase } from '../lib/supabase'
import type { Gallery, CreateGalleryDTO, UpdateGalleryDTO } from '../types/galleries'

const TABLE = 'galleries'

export async function getGalleries(): Promise<Gallery[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('match_date', { ascending: false })

  if (error) throw error
  return data
}

export async function getGalleryById(id: string): Promise<Gallery> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createGallery(dto: CreateGalleryDTO): Promise<Gallery> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(dto)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateGallery(id: string, dto: UpdateGalleryDTO): Promise<Gallery> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(dto)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteGallery(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)

  if (error) throw error
}
