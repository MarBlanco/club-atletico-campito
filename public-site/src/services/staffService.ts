import { supabase } from '../lib/supabase'
import type { Staff } from '../types/staff'

const TABLE = 'staff'

export async function getStaff(): Promise<Staff[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('active', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw error
  return data
}