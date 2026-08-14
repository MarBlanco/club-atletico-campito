import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { createQueryBuilder } from '../test/mockSupabase'
import { supabase } from '../lib/supabase'
import { createStaff, deleteStaff, getStaff, getStaffById, updateStaff } from './staffService'
import type { Staff } from '../types/staff'

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

function mockFrom(result: { data?: unknown; error?: unknown }) {
  const from = supabase.from as unknown as Mock
  from.mockReturnValue(createQueryBuilder({ data: result.data ?? null, error: result.error ?? null }))
  return from
}

const row: Staff = {
  id: 'staff-1',
  name: 'Carlos',
  role: 'DT',
  category: 'primera',
  image_url: 'staff.jpg',
  active: true,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('staffService', () => {
  it('getStaff devuelve las filas y consulta la tabla staff', async () => {
    const from = mockFrom({ data: [row] })
    await expect(getStaff()).resolves.toEqual([row])
    expect(supabase.from).toHaveBeenCalledWith('staff')
    expect(from().select).toHaveBeenCalledWith('*')
    expect(from().order).toHaveBeenCalledWith('name', { ascending: true })
  })

  it('getStaff lanza el error cuando la consulta falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(getStaff()).rejects.toEqual(error)
  })

  it('getStaffById filtra por id y devuelve la fila', async () => {
    const from = mockFrom({ data: row })
    await expect(getStaffById('staff-1')).resolves.toEqual(row)
    expect(from().eq).toHaveBeenCalledWith('id', 'staff-1')
  })

  it('createStaff inserta el dto y devuelve la fila creada', async () => {
    const dto = { name: 'Ana', role: 'PF', category: 'infanto' as const, image_url: null, active: true }
    const from = mockFrom({ data: row })
    await expect(createStaff(dto)).resolves.toEqual(row)
    expect(from().insert).toHaveBeenCalledWith(dto)
  })

  it('updateStaff actualiza por id y devuelve la fila', async () => {
    const from = mockFrom({ data: row })
    await expect(updateStaff('staff-1', { role: 'Ayudante' })).resolves.toEqual(row)
    expect(from().update).toHaveBeenCalledWith({ role: 'Ayudante' })
    expect(from().eq).toHaveBeenCalledWith('id', 'staff-1')
  })

  it('deleteStaff elimina por id', async () => {
    const from = mockFrom({ error: null })
    await expect(deleteStaff('staff-1')).resolves.toBeUndefined()
    expect(from().delete).toHaveBeenCalled()
    expect(from().eq).toHaveBeenCalledWith('id', 'staff-1')
  })

  it('deleteStaff lanza el error cuando falla', async () => {
    const error = { message: 'boom' }
    mockFrom({ error })
    await expect(deleteStaff('staff-1')).rejects.toEqual(error)
  })
})