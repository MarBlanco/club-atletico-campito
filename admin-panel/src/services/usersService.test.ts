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
  supabase: { from: vi.fn(), rpc: vi.fn() },
}))

function mockFrom(result: { data?: unknown; error?: unknown }) {
  const from = supabase.from as unknown as Mock
  from.mockReturnValue(createQueryBuilder({ data: result.data ?? null, error: result.error ?? null }))
  return from
}

function mockRpc(result: { data?: unknown; error?: unknown }) {
  const rpc = supabase.rpc as unknown as Mock
  rpc.mockResolvedValue(result)
  return rpc
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

  it('getAdminUsers llama al RPC admin_list_users y devuelve el estado de baneo', async () => {
    const data = [{ ...row, banned: true }]
    const rpc = mockRpc({ data })
    await expect(getAdminUsers()).resolves.toEqual(data)
    expect(rpc).toHaveBeenCalledWith('admin_list_users')
  })

  it('getAdminUsers lanza el error cuando el RPC falla', async () => {
    const error = { message: 'no autorizado' }
    mockRpc({ error })
    await expect(getAdminUsers()).rejects.toEqual(error)
  })

  it('adminCreateUser llama al RPC con nombre, email y contraseña', async () => {
    const rpc = mockRpc({ data: 'user-2', error: null })
    await expect(adminCreateUser({ name: 'Leo', email: 'leo@campito.com', password: 'secreta123' })).resolves.toBeUndefined()
    expect(rpc).toHaveBeenCalledWith('admin_create_user', {
      p_name: 'Leo',
      p_email: 'leo@campito.com',
      p_password: 'secreta123',
    })
  })

  it('adminCreateUser lanza el error del RPC', async () => {
    const error = { message: 'email inválido' }
    mockRpc({ data: null, error })
    await expect(adminCreateUser({ name: 'Leo', email: 'bad', password: 'secreta123' })).rejects.toEqual(error)
  })

  it('adminUpdateUser llama al RPC con id, nombre y email', async () => {
    const rpc = mockRpc({ data: null, error: null })
    await expect(adminUpdateUser('user-2', { name: 'Leo M', email: 'leo@campito.com' })).resolves.toBeUndefined()
    expect(rpc).toHaveBeenCalledWith('admin_update_user', {
      p_id: 'user-2',
      p_name: 'Leo M',
      p_email: 'leo@campito.com',
    })
  })

  it('adminUpdateUserPassword llama al RPC con id y contraseña', async () => {
    const rpc = mockRpc({ data: null, error: null })
    await expect(adminUpdateUserPassword('user-2', 'nueva123')).resolves.toBeUndefined()
    expect(rpc).toHaveBeenCalledWith('admin_update_user_password', { p_id: 'user-2', p_password: 'nueva123' })
  })

  it('adminSetUserBanned llama al RPC con id y estado', async () => {
    const rpc = mockRpc({ data: null, error: null })
    await expect(adminSetUserBanned('user-2', true)).resolves.toBeUndefined()
    expect(rpc).toHaveBeenCalledWith('admin_set_user_banned', { p_id: 'user-2', p_banned: true })
  })

  it('adminDeleteUser llama al RPC con el id', async () => {
    const rpc = mockRpc({ data: null, error: null })
    await expect(adminDeleteUser('user-2')).resolves.toBeUndefined()
    expect(rpc).toHaveBeenCalledWith('admin_delete_user', { p_id: 'user-2' })
  })
})