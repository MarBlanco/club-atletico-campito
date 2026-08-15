import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { createQueryBuilder } from '../test/mockSupabase'
import { supabase } from '../lib/supabase'
import {
  getUserById,
  getUsers,
  getAdminUsers,
  adminCreateUser,
  adminUpdateUser,
  adminUpdateUserPassword,
  adminSetUserBanned,
  adminDeleteUser,
} from './usersService'
import type { AppUser } from '../types/user'

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn(), functions: { invoke: vi.fn() } },
}))

function mockFrom(result: { data?: unknown; error?: unknown }) {
  const from = supabase.from as unknown as Mock
  from.mockReturnValue(createQueryBuilder({ data: result.data ?? null, error: result.error ?? null }))
  return from
}

function mockInvoke(result: { data?: unknown; error?: unknown }) {
  const invoke = (supabase.functions as unknown as { invoke: Mock }).invoke
  invoke.mockResolvedValue({ data: result.data ?? null, error: result.error ?? null })
  return invoke
}

const row: AppUser = {
  id: 'user-1',
  name: 'Ana',
  email: 'ana@campito.com',
  role: 'admin',
  created_at: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('usersService', () => {
  it('getUsers devuelve las filas y consulta la tabla users', async () => {
    const from = mockFrom({ data: [row] })
    await expect(getUsers()).resolves.toEqual([row])
    expect(supabase.from).toHaveBeenCalledWith('users')
    expect(from().select).toHaveBeenCalledWith('*')
    expect(from().order).toHaveBeenCalledWith('created_at', { ascending: true })
  })

  it('getUsers lanza el error cuando la consulta falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(getUsers()).rejects.toEqual(error)
  })

  it('getUserById filtra por id y devuelve la fila', async () => {
    const from = mockFrom({ data: row })
    await expect(getUserById('user-1')).resolves.toEqual(row)
    expect(from().eq).toHaveBeenCalledWith('id', 'user-1')
    expect(from().maybeSingle).toHaveBeenCalled()
  })

  it('getUserById devuelve null cuando no hay fila', async () => {
    mockFrom({ data: null })
    await expect(getUserById('missing')).resolves.toBeNull()
  })

  it('getAdminUsers invoca la Edge Function admin-users con action list', async () => {
    const data = [{ ...row, banned: false }]
    const invoke = mockInvoke({ data })
    await expect(getAdminUsers()).resolves.toEqual(data)
    expect(invoke).toHaveBeenCalledWith('admin-users', { body: { action: 'list' } })
  })

  it('getAdminUsers lanza el error devuelto por la Edge Function', async () => {
    const invoke = mockInvoke({ data: null, error: { message: '{"error":"no autorizado"}' } })
    await expect(getAdminUsers()).rejects.toThrow('no autorizado')
    expect(invoke).toHaveBeenCalledWith('admin-users', { body: { action: 'list' } })
  })

  it('getAdminUsers lanza el error cuando el body tiene error', async () => {
    mockInvoke({ data: { error: 'boom' } })
    await expect(getAdminUsers()).rejects.toThrow('boom')
  })

  it('adminCreateUser invoca la Edge Function con action create', async () => {
    const invoke = mockInvoke({ data: { ok: true } })
    await expect(adminCreateUser({ name: 'Leo', email: 'leo@campito.com', password: 'secreta123' })).resolves.toBeUndefined()
    expect(invoke).toHaveBeenCalledWith('admin-users', {
      body: { action: 'create', name: 'Leo', email: 'leo@campito.com', password: 'secreta123' },
    })
  })

  it('adminUpdateUser invoca la Edge Function con action update', async () => {
    const invoke = mockInvoke({ data: { ok: true } })
    await expect(adminUpdateUser('user-2', { name: 'Leo M', email: 'leo@campito.com' })).resolves.toBeUndefined()
    expect(invoke).toHaveBeenCalledWith('admin-users', {
      body: { action: 'update', id: 'user-2', name: 'Leo M', email: 'leo@campito.com' },
    })
  })

  it('adminUpdateUserPassword invoca la Edge Function con action updatePassword', async () => {
    const invoke = mockInvoke({ data: { ok: true } })
    await expect(adminUpdateUserPassword('user-2', 'nueva123')).resolves.toBeUndefined()
    expect(invoke).toHaveBeenCalledWith('admin-users', {
      body: { action: 'updatePassword', id: 'user-2', password: 'nueva123' },
    })
  })

  it('adminSetUserBanned invoca la Edge Function con action setBanned', async () => {
    const invoke = mockInvoke({ data: { ok: true } })
    await expect(adminSetUserBanned('user-2', true)).resolves.toBeUndefined()
    expect(invoke).toHaveBeenCalledWith('admin-users', {
      body: { action: 'setBanned', id: 'user-2', banned: true },
    })
  })

  it('adminDeleteUser invoca la Edge Function con action delete', async () => {
    const invoke = mockInvoke({ data: { ok: true } })
    await expect(adminDeleteUser('user-2')).resolves.toBeUndefined()
    expect(invoke).toHaveBeenCalledWith('admin-users', {
      body: { action: 'delete', id: 'user-2' },
    })
  })
})