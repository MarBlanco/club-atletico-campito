import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { createQueryBuilder } from '../test/mockSupabase'
import { supabase } from '../lib/supabase'
import { getUserById, getUsers } from './usersService'
import type { AppUser } from '../types/user'

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

function mockFrom(result: { data?: unknown; error?: unknown }) {
  const from = supabase.from as unknown as Mock
  from.mockReturnValue(createQueryBuilder({ data: result.data ?? null, error: result.error ?? null }))
  return from
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
})