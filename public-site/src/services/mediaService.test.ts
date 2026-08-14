import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { createQueryBuilder } from '../test/mockSupabase'
import { supabase } from '../lib/supabase'
import { getLatestMedia, getMedia } from './mediaService'
import type { Media } from '../types/media'

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

function mockFrom(result: { data?: unknown; error?: unknown }) {
  const from = supabase.from as unknown as Mock
  from.mockReturnValue(createQueryBuilder({ data: result.data ?? null, error: result.error ?? null }))
  return from
}

const row: Media = {
  id: 'media-1',
  gallery_id: 'gallery-1',
  type: 'image',
  url: 'media.jpg',
  thumbnail_url: 'thumb.jpg',
  created_at: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('public mediaService', () => {
  it('getLatestMedia limita por defecto a 4', async () => {
    const from = mockFrom({ data: [row] })
    await expect(getLatestMedia()).resolves.toEqual([row])
    expect(supabase.from).toHaveBeenCalledWith('media')
    expect(from().limit).toHaveBeenCalledWith(4)
  })

  it('getLatestMedia respeta un límite personalizado', async () => {
    const from = mockFrom({ data: [row] })
    await getLatestMedia(8)
    expect(from().limit).toHaveBeenCalledWith(8)
  })

  it('getLatestMedia lanza el error cuando la consulta falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(getLatestMedia()).rejects.toEqual(error)
  })

  it('getMedia devuelve las filas', async () => {
    mockFrom({ data: [row] })
    await expect(getMedia()).resolves.toEqual([row])
    expect(supabase.from).toHaveBeenCalledWith('media')
  })

  it('getMedia devuelve array vacío cuando no hay datos', async () => {
    mockFrom({ data: null })
    await expect(getMedia()).resolves.toEqual([])
  })
})