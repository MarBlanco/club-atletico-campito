import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { createQueryBuilder } from '../test/mockSupabase'
import { supabase } from '../lib/supabase'
import { createNews, deleteNews, getNews, getNewsById, updateNews } from './newsService'
import type { News } from '../types/news'

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

function mockFrom(result: { data?: unknown; error?: unknown }) {
  const from = supabase.from as unknown as Mock
  from.mockReturnValue(createQueryBuilder({ data: result.data ?? null, error: result.error ?? null }))
  return from
}

const row: News = {
  id: 'news-1',
  title: 'Titulo',
  excerpt: 'Extracto',
  content: 'Contenido',
  image_url: 'foto.jpg',
  published: true,
  author_id: null,
  created_at: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('newsService', () => {
  it('getNews devuelve las filas y consulta la tabla news', async () => {
    mockFrom({ data: [row] })
    await expect(getNews()).resolves.toEqual([row])
    expect(supabase.from).toHaveBeenCalledWith('news')
  })

  it('getNews lanza el error cuando la consulta falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(getNews()).rejects.toEqual(error)
  })

  it('getNewsById filtra por id y devuelve la fila', async () => {
    const from = mockFrom({ data: row })
    await expect(getNewsById('news-1')).resolves.toEqual(row)
    expect(from().eq).toHaveBeenCalledWith('id', 'news-1')
  })

  it('getNewsById lanza el error cuando la consulta falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(getNewsById('news-1')).rejects.toEqual(error)
  })

  it('createNews inserta el dto y devuelve la fila creada', async () => {
    const dto = { title: 'Nueva', excerpt: 'E', content: 'C', image_url: 'foto.jpg', published: true }
    const from = mockFrom({ data: row })
    await expect(createNews(dto)).resolves.toEqual(row)
    expect(from().insert).toHaveBeenCalledWith(dto)
  })

  it('updateNews actualiza por id y devuelve la fila', async () => {
    const from = mockFrom({ data: row })
    await expect(updateNews('news-1', { title: 'Editada' })).resolves.toEqual(row)
    expect(from().update).toHaveBeenCalledWith({ title: 'Editada' })
    expect(from().eq).toHaveBeenCalledWith('id', 'news-1')
  })

  it('deleteNews elimina por id', async () => {
    const from = mockFrom({ error: null })
    await expect(deleteNews('news-1')).resolves.toBeUndefined()
    expect(from().delete).toHaveBeenCalled()
    expect(from().eq).toHaveBeenCalledWith('id', 'news-1')
  })

  it('deleteNews lanza el error cuando falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(deleteNews('news-1')).rejects.toEqual(error)
  })
})
