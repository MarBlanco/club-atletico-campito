import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { createQueryBuilder } from '../test/mockSupabase'
import { supabase } from '../lib/supabase'
import { createMatch, deleteMatch, getMatchById, getMatches, updateMatch } from './matchesService'
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
  rival_id: 'rival-1',
  date: '2026-03-01T20:00:00.000Z',
  competition_id: 'comp-1',
  status: 'upcoming',
  goals_for: null,
  goals_against: null,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('matchesService', () => {
  it('getMatches devuelve las filas y consulta la tabla matches', async () => {
    const from = mockFrom({ data: [row] })
    await expect(getMatches()).resolves.toEqual([row])
    expect(supabase.from).toHaveBeenCalledWith('matches')
    expect(from().select).toHaveBeenCalledWith('*')
    expect(from().order).toHaveBeenCalledWith('date', { ascending: false })
  })

  it('getMatches lanza el error cuando la consulta falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(getMatches()).rejects.toEqual(error)
  })

  it('getMatchById filtra por id y devuelve la fila', async () => {
    const from = mockFrom({ data: row })
    await expect(getMatchById('match-1')).resolves.toEqual(row)
    expect(from().eq).toHaveBeenCalledWith('id', 'match-1')
  })

  it('createMatch inserta el dto y devuelve la fila creada', async () => {
    const dto = { rival_id: 'rival-2', date: '2026-04-01', competition_id: 'comp-2', status: 'upcoming' as const, goals_for: null, goals_against: null }
    const from = mockFrom({ data: row })
    await expect(createMatch(dto)).resolves.toEqual(row)
    expect(from().insert).toHaveBeenCalledWith(dto)
  })

  it('updateMatch actualiza por id y devuelve la fila', async () => {
    const from = mockFrom({ data: row })
    await expect(updateMatch('match-1', { status: 'finished', goals_for: 2, goals_against: 1 })).resolves.toEqual(row)
    expect(from().update).toHaveBeenCalledWith({ status: 'finished', goals_for: 2, goals_against: 1 })
    expect(from().eq).toHaveBeenCalledWith('id', 'match-1')
  })

  it('updateMatch acepta el estado suspendido', async () => {
    const from = mockFrom({ data: row })
    await expect(updateMatch('match-1', { status: 'suspended', goals_for: null, goals_against: null })).resolves.toEqual(row)
    expect(from().update).toHaveBeenCalledWith({ status: 'suspended', goals_for: null, goals_against: null })
  })

  it('deleteMatch elimina por id', async () => {
    const from = mockFrom({ error: null })
    await expect(deleteMatch('match-1')).resolves.toBeUndefined()
    expect(from().delete).toHaveBeenCalled()
    expect(from().eq).toHaveBeenCalledWith('id', 'match-1')
  })

  it('deleteMatch lanza el error cuando falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(deleteMatch('match-1')).rejects.toEqual(error)
  })
})