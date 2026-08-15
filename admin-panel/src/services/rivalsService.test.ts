import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { createQueryBuilder } from '../test/mockSupabase'
import { supabase } from '../lib/supabase'
import { createRival, deleteRival, getRivals, updateRival } from './rivalsService'
import type { Rival } from '../types/rivals'

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

function mockFrom(result: { data?: unknown; error?: unknown }) {
  const from = supabase.from as unknown as Mock
  from.mockReturnValue(createQueryBuilder({ data: result.data ?? null, error: result.error ?? null }))
  return from
}

const row: Rival = {
  id: 'rival-1',
  name: 'River',
  created_at: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('rivalsService', () => {
  it('getRivals devuelve las filas ordenadas por nombre', async () => {
    const from = mockFrom({ data: [row] })
    await expect(getRivals()).resolves.toEqual([row])
    expect(supabase.from).toHaveBeenCalledWith('rivals')
    expect(from().select).toHaveBeenCalledWith('*')
    expect(from().order).toHaveBeenCalledWith('name', { ascending: true })
  })

  it('getRivals lanza el error cuando la consulta falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(getRivals()).rejects.toEqual(error)
  })

  it('createRival inserta el dto y devuelve la fila creada', async () => {
    const from = mockFrom({ data: row })
    await expect(createRival({ name: 'River' })).resolves.toEqual(row)
    expect(from().insert).toHaveBeenCalledWith({ name: 'River' })
  })

  it('updateRival actualiza el nombre por id', async () => {
    const from = mockFrom({ data: row })
    await expect(updateRival('rival-1', 'Boca')).resolves.toEqual(row)
    expect(from().update).toHaveBeenCalledWith({ name: 'Boca' })
    expect(from().eq).toHaveBeenCalledWith('id', 'rival-1')
  })

  it('deleteRival elimina por id', async () => {
    const from = mockFrom({ error: null })
    await expect(deleteRival('rival-1')).resolves.toBeUndefined()
    expect(from().delete).toHaveBeenCalled()
    expect(from().eq).toHaveBeenCalledWith('id', 'rival-1')
  })

  it('deleteRival lanza el error cuando falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(deleteRival('rival-1')).rejects.toEqual(error)
  })
})