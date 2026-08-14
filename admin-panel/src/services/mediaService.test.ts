import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { createQueryBuilder } from '../test/mockSupabase'
import { supabase } from '../lib/supabase'
import { createMedia, deleteMedia, getMedia, getMediaById, updateMedia } from './mediaService'
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

describe('mediaService', () => {
  it('getMedia devuelve las filas y consulta la tabla media', async () => {
    mockFrom({ data: [row] })
    await expect(getMedia()).resolves.toEqual([row])
    expect(supabase.from).toHaveBeenCalledWith('media')
  })

  it('getMedia lanza el error cuando la consulta falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(getMedia()).rejects.toEqual(error)
  })

  it('getMediaById filtra por id y devuelve la fila', async () => {
    const from = mockFrom({ data: row })
    await expect(getMediaById('media-1')).resolves.toEqual(row)
    expect(from().eq).toHaveBeenCalledWith('id', 'media-1')
  })

  it('createMedia inserta el dto y devuelve la fila creada', async () => {
    const dto = { gallery_id: 'gallery-1', type: 'image' as const, url: 'media.jpg', thumbnail_url: null }
    const from = mockFrom({ data: row })
    await expect(createMedia(dto)).resolves.toEqual(row)
    expect(from().insert).toHaveBeenCalledWith(dto)
  })

  it('updateMedia actualiza por id y devuelve la fila', async () => {
    const from = mockFrom({ data: row })
    await expect(updateMedia('media-1', { url: 'otra.jpg' })).resolves.toEqual(row)
    expect(from().update).toHaveBeenCalledWith({ url: 'otra.jpg' })
    expect(from().eq).toHaveBeenCalledWith('id', 'media-1')
  })

  it('deleteMedia elimina por id', async () => {
    const from = mockFrom({ error: null })
    await expect(deleteMedia('media-1')).resolves.toBeUndefined()
    expect(from().delete).toHaveBeenCalled()
    expect(from().eq).toHaveBeenCalledWith('id', 'media-1')
  })

  it('deleteMedia lanza el error cuando falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(deleteMedia('media-1')).rejects.toEqual(error)
  })
})