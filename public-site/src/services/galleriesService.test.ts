import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { createQueryBuilder } from '../test/mockSupabase'
import { supabase } from '../lib/supabase'
import { getGalleries, getLatestGalleries } from './galleriesService'
import type { Gallery } from '../types/galleries'

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

function mockFrom(result: { data?: unknown; error?: unknown }) {
  const from = supabase.from as unknown as Mock
  from.mockReturnValue(createQueryBuilder({ data: result.data ?? null, error: result.error ?? null }))
  return from
}

const row: Gallery = {
  id: 'gallery-1',
  title: 'Vs River',
  category: 'primera',
  match_date: '2026-03-01',
  cover_image: 'cover.jpg',
  created_at: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('public galleriesService', () => {
  it('getLatestGalleries limita por defecto a 4', async () => {
    const from = mockFrom({ data: [row] })
    await expect(getLatestGalleries()).resolves.toEqual([row])
    expect(supabase.from).toHaveBeenCalledWith('galleries')
    expect(from().limit).toHaveBeenCalledWith(4)
  })

  it('getLatestGalleries respeta un límite personalizado', async () => {
    const from = mockFrom({ data: [row] })
    await getLatestGalleries(6)
    expect(from().limit).toHaveBeenCalledWith(6)
  })

  it('getLatestGalleries lanza el error cuando la consulta falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(getLatestGalleries()).rejects.toEqual(error)
  })

  it('getGalleries devuelve las filas', async () => {
    mockFrom({ data: [row] })
    await expect(getGalleries()).resolves.toEqual([row])
    expect(supabase.from).toHaveBeenCalledWith('galleries')
  })

  it('getGalleries devuelve array vacío cuando no hay datos', async () => {
    mockFrom({ data: null })
    await expect(getGalleries()).resolves.toEqual([])
  })
})