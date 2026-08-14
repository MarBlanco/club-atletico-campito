import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { createQueryBuilder } from '../test/mockSupabase'
import { supabase } from '../lib/supabase'
import { getLatestNews, getPublishedNews, getPublishedNewsById } from './newsService'
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

describe('public newsService', () => {
  it('getLatestNews filtra publicadas, ordena y limita por defecto a 3', async () => {
    const from = mockFrom({ data: [row] })
    await expect(getLatestNews()).resolves.toEqual([row])
    expect(supabase.from).toHaveBeenCalledWith('news')
    expect(from().eq).toHaveBeenCalledWith('published', true)
    expect(from().order).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(from().limit).toHaveBeenCalledWith(3)
  })

  it('getLatestNews respeta un límite personalizado', async () => {
    const from = mockFrom({ data: [row] })
    await getLatestNews(5)
    expect(from().limit).toHaveBeenCalledWith(5)
  })

  it('getLatestNews lanza el error cuando la consulta falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(getLatestNews()).rejects.toEqual(error)
  })

  it('getPublishedNews devuelve las noticias publicadas', async () => {
    const from = mockFrom({ data: [row] })
    await expect(getPublishedNews()).resolves.toEqual([row])
    expect(from().eq).toHaveBeenCalledWith('published', true)
  })

  it('getPublishedNewsById filtra por id y published', async () => {
    const from = mockFrom({ data: row })
    await expect(getPublishedNewsById('news-1')).resolves.toEqual(row)
    expect(from().eq).toHaveBeenCalledWith('id', 'news-1')
    expect(from().eq).toHaveBeenCalledWith('published', true)
  })

  it('getPublishedNewsById devuelve null cuando no existe', async () => {
    mockFrom({ data: null })
    await expect(getPublishedNewsById('news-1')).resolves.toBeNull()
  })
})