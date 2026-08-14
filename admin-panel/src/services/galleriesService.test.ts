import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { createQueryBuilder } from '../test/mockSupabase'
import { supabase } from '../lib/supabase'
import { createGallery, deleteGallery, getGalleries, getGalleryById, updateGallery } from './galleriesService'
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

describe('galleriesService', () => {
  it('getGalleries devuelve las filas y consulta la tabla galleries', async () => {
    const from = mockFrom({ data: [row] })
    await expect(getGalleries()).resolves.toEqual([row])
    expect(supabase.from).toHaveBeenCalledWith('galleries')
    expect(from().select).toHaveBeenCalledWith('*')
    expect(from().order).toHaveBeenCalledWith('match_date', { ascending: false })
  })

  it('getGalleries lanza el error cuando la consulta falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(getGalleries()).rejects.toEqual(error)
  })

  it('getGalleryById filtra por id y devuelve la fila', async () => {
    const from = mockFrom({ data: row })
    await expect(getGalleryById('gallery-1')).resolves.toEqual(row)
    expect(from().eq).toHaveBeenCalledWith('id', 'gallery-1')
  })

  it('createGallery inserta el dto y devuelve la fila creada', async () => {
    const dto = { title: 'Nueva', category: 'femenino' as const, match_date: '2026-05-01', cover_image: 'c.jpg' }
    const from = mockFrom({ data: row })
    await expect(createGallery(dto)).resolves.toEqual(row)
    expect(from().insert).toHaveBeenCalledWith(dto)
  })

  it('updateGallery actualiza por id y devuelve la fila', async () => {
    const from = mockFrom({ data: row })
    await expect(updateGallery('gallery-1', { title: 'Editada' })).resolves.toEqual(row)
    expect(from().update).toHaveBeenCalledWith({ title: 'Editada' })
    expect(from().eq).toHaveBeenCalledWith('id', 'gallery-1')
  })

  it('deleteGallery elimina por id', async () => {
    const from = mockFrom({ error: null })
    await expect(deleteGallery('gallery-1')).resolves.toBeUndefined()
    expect(from().delete).toHaveBeenCalled()
    expect(from().eq).toHaveBeenCalledWith('id', 'gallery-1')
  })

  it('deleteGallery lanza el error cuando falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(deleteGallery('gallery-1')).rejects.toEqual(error)
  })
})