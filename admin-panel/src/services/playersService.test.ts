import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { createQueryBuilder } from '../test/mockSupabase'
import { supabase } from '../lib/supabase'
import { createPlayer, deletePlayer, getPlayerById, getPlayers, updatePlayer } from './playersService'
import type { Player } from '../types/players'

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

function mockFrom(result: { data?: unknown; error?: unknown }) {
  const from = supabase.from as unknown as Mock
  from.mockReturnValue(createQueryBuilder({ data: result.data ?? null, error: result.error ?? null }))
  return from
}

const row: Player = {
  id: 'player-1',
  name: 'Juan',
  surname: 'Perez',
  number: 9,
  position: 'Delantero',
  image_url: 'player.jpg',
  active: true,
  created_at: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('playersService', () => {
  it('getPlayers devuelve las filas y consulta la tabla players', async () => {
    const from = mockFrom({ data: [row] })
    await expect(getPlayers()).resolves.toEqual([row])
    expect(supabase.from).toHaveBeenCalledWith('players')
    expect(from().select).toHaveBeenCalledWith('*')
    expect(from().order).toHaveBeenCalledWith('surname', { ascending: true })
  })

  it('getPlayers lanza el error cuando la consulta falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(getPlayers()).rejects.toEqual(error)
  })

  it('getPlayerById filtra por id y devuelve la fila', async () => {
    const from = mockFrom({ data: row })
    await expect(getPlayerById('player-1')).resolves.toEqual(row)
    expect(from().eq).toHaveBeenCalledWith('id', 'player-1')
  })

  it('createPlayer inserta el dto y devuelve la fila creada', async () => {
    const dto = { name: 'Luis', surname: 'Gomez', number: 10, position: 'Mediocampista' as const, image_url: 'p.jpg', active: true }
    const from = mockFrom({ data: row })
    await expect(createPlayer(dto)).resolves.toEqual(row)
    expect(from().insert).toHaveBeenCalledWith(dto)
  })

  it('updatePlayer actualiza por id y devuelve la fila', async () => {
    const from = mockFrom({ data: row })
    await expect(updatePlayer('player-1', { active: false })).resolves.toEqual(row)
    expect(from().update).toHaveBeenCalledWith({ active: false })
    expect(from().eq).toHaveBeenCalledWith('id', 'player-1')
  })

  it('deletePlayer elimina por id', async () => {
    const from = mockFrom({ error: null })
    await expect(deletePlayer('player-1')).resolves.toBeUndefined()
    expect(from().delete).toHaveBeenCalled()
    expect(from().eq).toHaveBeenCalledWith('id', 'player-1')
  })

  it('deletePlayer lanza el error cuando falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(deletePlayer('player-1')).rejects.toEqual(error)
  })
})