import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { createQueryBuilder } from '../test/mockSupabase'
import { supabase } from '../lib/supabase'
import { getClub } from './clubService'
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

describe('public clubService', () => {
  it('getClub consulta la tabla club con límite 1 y devuelve la fila', async () => {
    const from = mockFrom({ data: row })
    await expect(getClub()).resolves.toEqual(row)
    expect(supabase.from).toHaveBeenCalledWith('club')
    expect(from().limit).toHaveBeenCalledWith(1)
  })

  it('getClub devuelve null cuando no hay fila', async () => {
    mockFrom({ data: null })
    await expect(getClub()).resolves.toBeNull()
  })

  it('getClub lanza el error cuando la consulta falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(getClub()).rejects.toEqual(error)
  })
})