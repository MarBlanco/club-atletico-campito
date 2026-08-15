import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { createQueryBuilder } from '../test/mockSupabase'
import { supabase } from '../lib/supabase'
import { createCompetition, deleteCompetition, getCompetitions, updateCompetition } from './competitionsService'
import type { Competition } from '../types/competitions'

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

function mockFrom(result: { data?: unknown; error?: unknown }) {
  const from = supabase.from as unknown as Mock
  from.mockReturnValue(createQueryBuilder({ data: result.data ?? null, error: result.error ?? null }))
  return from
}

const row: Competition = {
  id: 'comp-1',
  name: 'Liga',
  created_at: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('competitionsService', () => {
  it('getCompetitions devuelve las filas ordenadas por nombre', async () => {
    const from = mockFrom({ data: [row] })
    await expect(getCompetitions()).resolves.toEqual([row])
    expect(supabase.from).toHaveBeenCalledWith('competitions')
    expect(from().select).toHaveBeenCalledWith('*')
    expect(from().order).toHaveBeenCalledWith('name', { ascending: true })
  })

  it('getCompetitions lanza el error cuando la consulta falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(getCompetitions()).rejects.toEqual(error)
  })

  it('createCompetition inserta el dto y devuelve la fila creada', async () => {
    const from = mockFrom({ data: row })
    await expect(createCompetition({ name: 'Liga' })).resolves.toEqual(row)
    expect(from().insert).toHaveBeenCalledWith({ name: 'Liga' })
  })

  it('updateCompetition actualiza el nombre por id', async () => {
    const from = mockFrom({ data: row })
    await expect(updateCompetition('comp-1', 'Torneo')).resolves.toEqual(row)
    expect(from().update).toHaveBeenCalledWith({ name: 'Torneo' })
    expect(from().eq).toHaveBeenCalledWith('id', 'comp-1')
  })

  it('deleteCompetition elimina por id', async () => {
    const from = mockFrom({ error: null })
    await expect(deleteCompetition('comp-1')).resolves.toBeUndefined()
    expect(from().delete).toHaveBeenCalled()
    expect(from().eq).toHaveBeenCalledWith('id', 'comp-1')
  })

  it('deleteCompetition lanza el error cuando falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(deleteCompetition('comp-1')).rejects.toEqual(error)
  })
})