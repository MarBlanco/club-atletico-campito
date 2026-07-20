import { supabase } from '../lib/supabase'
import type { Staff, CreateStaffDTO, UpdateStaffDTO } from '../types/staff'

const TABLE = 'staff'

export async function getStaff(): Promise<Staff[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

export async function getStaffById(id: string): Promise<Staff> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createStaff(dto: CreateStaffDTO): Promise<Staff> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(dto)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateStaff(id: string, dto: UpdateStaffDTO): Promise<Staff> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(dto)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteStaff(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)

  if (error) throw error
}
