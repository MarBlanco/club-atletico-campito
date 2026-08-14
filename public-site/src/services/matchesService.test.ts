import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { createQueryBuilder } from '../test/mockSupabase'
import { supabase } from '../lib/supabase'
import { getMatches, getNextMatch } from './matchesService'
import type { Match } from '../types/matches'

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

function mockFrom(result: { data?: unknown; error?: unknown }) {
  const from = supabase.from as unknown as Mock
  from.mockReturnValue(createQueryBuilder({ data: result.data ?? null, error: result.error ?? null }))
  return from
}

const row: Match = {
  id: 'match-1',
  rival: 'River',
  date: '2026-03-01T20:00:00.000Z',
  competition: 'Liga',
  status: 'upcoming',
  goals_for: null,
  goals_against: null,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('public matchesService', () => {
  it('getNextMatch filtra por status upcoming y limita a 1', async () => {
    const from = mockFrom({ data: row })
    await expect(getNextMatch()).resolves.toEqual(row)
    expect(supabase.from).toHaveBeenCalledWith('matches')
    expect(from().eq).toHaveBeenCalledWith('status', 'upcoming')
    expect(from().limit).toHaveBeenCalledWith(1)
    expect(from().maybeSingle).toHaveBeenCalled()
  })

  it('getNextMatch devuelve null cuando no hay partido', async () => {
    mockFrom({ data: null })
    await expect(getNextMatch()).resolves.toBeNull()
  })

  it('getNextMatch lanza el error cuando la consulta falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(getNextMatch()).rejects.toEqual(error)
  })

  it('getMatches devuelve las filas', async () => {
    const from = mockFrom({ data: [row] })
    await expect(getMatches()).resolves.toEqual([row])
    expect(supabase.from).toHaveBeenCalledWith('matches')
    expect(from().order).toHaveBeenCalledWith('date', { ascending: true })
  })

  it('getMatches devuelve array vacío cuando no hay datos', async () => {
    mockFrom({ data: null })
    await expect(getMatches()).resolves.toEqual([])
  })
})