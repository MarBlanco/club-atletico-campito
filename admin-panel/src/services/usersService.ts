import { supabase } from '../lib/supabase'
import type { AppUser, AdminUser, CreateColaboradorDTO, UpdateColaboradorDTO } from '../types/user'

const TABLE = 'users'
const FUNCTION = 'admin-users'

export async function getUsers(): Promise<AppUser[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function getUserById(id: string): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

function extractMessage(raw: string, data: unknown): string {
  if (data && typeof data === 'object' && 'error' in data) {
    const e = (data as { error: unknown }).error
    if (typeof e === 'string') return e
  }
  try {
    const parsed = JSON.parse(raw) as { error?: string }
    if (typeof parsed.error === 'string') return parsed.error
  } catch {
    // noop
  }
  return raw
}

async function invoke<T>(body: Record<string, unknown>): Promise<T> {
  const res = await supabase.functions.invoke(FUNCTION, { body })
  if (res.error) throw new Error(extractMessage(res.error.message, res.data))
  const payload = res.data as { error?: unknown } | null
  if (payload && typeof payload.error === 'string') throw new Error(payload.error)
  return res.data as T
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  return invoke<AdminUser[]>({ action: 'list' })
}

export async function adminCreateUser(dto: CreateColaboradorDTO): Promise<void> {
  await invoke<{ ok: boolean }>({
    action: 'create',
    name: dto.name,
    email: dto.email,
    password: dto.password,
  })
}

export async function adminUpdateUser(id: string, dto: UpdateColaboradorDTO): Promise<void> {
  await invoke<{ ok: boolean }>({ action: 'update', id, name: dto.name, email: dto.email })
}

export async function adminUpdateUserPassword(id: string, password: string): Promise<void> {
  await invoke<{ ok: boolean }>({ action: 'updatePassword', id, password })
}

export async function adminSetUserBanned(id: string, banned: boolean): Promise<void> {
  await invoke<{ ok: boolean }>({ action: 'setBanned', id, banned })
}

export async function adminDeleteUser(id: string): Promise<void> {
  await invoke<{ ok: boolean }>({ action: 'delete', id })
}