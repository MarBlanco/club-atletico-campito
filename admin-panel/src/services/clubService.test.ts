import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { createQueryBuilder } from '../test/mockSupabase'
import { supabase } from '../lib/supabase'
import { getClub, updateClub } from './clubService'
import type { Club } from '../types/club'

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

function mockFrom(result: { data?: unknown; error?: unknown }) {
  const from = supabase.from as unknown as Mock
  from.mockReturnValue(createQueryBuilder({ data: result.data ?? null, error: result.error ?? null }))
  return from
}

const row: Club = {
  id: 'club-1',
  history: 'Historia',
  mission: null,
  values: null,
  location: 'Campito',
  logo_url: 'logo.jpg',
  updated_at: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('clubService', () => {
  it('getClub devuelve la fila y consulta la tabla club', async () => {
    mockFrom({ data: row })
    await expect(getClub()).resolves.toEqual(row)
    expect(supabase.from).toHaveBeenCalledWith('club')
  })

  it('getClub lanza el error cuando la consulta falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(getClub()).rejects.toEqual(error)
  })

  it('updateClub actualiza por id y devuelve la fila', async () => {
    const from = mockFrom({ data: row })
    await expect(updateClub('club-1', { location: 'Nuevo' })).resolves.toEqual(row)
    expect(from().update).toHaveBeenCalledWith({ location: 'Nuevo' })
    expect(from().eq).toHaveBeenCalledWith('id', 'club-1')
  })

  it('updateClub lanza el error cuando la consulta falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(updateClub('club-1', { location: 'Nuevo' })).rejects.toEqual(error)
  })
})