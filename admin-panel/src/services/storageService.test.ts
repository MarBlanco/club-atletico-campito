import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BUCKET, STORAGE_FOLDERS, deleteFile, getPublicUrl, uploadImage, uploadVideo } from './storageService'

const mocks = vi.hoisted(() => ({
  upload: vi.fn(),
  remove: vi.fn(),
  storageGetPublicUrl: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: mocks.upload,
        remove: mocks.remove,
        getPublicUrl: mocks.storageGetPublicUrl,
      })),
    },
  },
}))

function mockStorageUpload(result: { error?: unknown }) {
  mocks.upload.mockResolvedValue({ error: result.error ?? null })
  mocks.storageGetPublicUrl.mockImplementation((path: string) => ({ data: { publicUrl: `https://cdn.example/${path}` } }))
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('storageService', () => {
  it('expone el bucket y las carpetas de almacenamiento', () => {
    expect(BUCKET).toBe('campito-media')
    expect(STORAGE_FOLDERS).toEqual(['club', 'news', 'players', 'staff', 'galleries', 'videos'])
  })

  it('uploadImage rechaza tipos no permitidos', async () => {
    const file = new File(['hola'], 'nota.txt', { type: 'text/plain' })
    await expect(uploadImage(file, 'news')).rejects.toThrow('Tipo de archivo no permitido')
    expect(mocks.upload).not.toHaveBeenCalled()
  })

  it('uploadImage rechaza archivos que superan el tamaño máximo', async () => {
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'grande.png', { type: 'image/png' })
    await expect(uploadImage(file, 'news')).rejects.toThrow('tamaño máximo de 5 MB')
    expect(mocks.upload).not.toHaveBeenCalled()
  })

  it('uploadImage sube el archivo y devuelve path y publicUrl', async () => {
    mockStorageUpload({})
    const file = new File(['contenido'], 'foto.png', { type: 'image/png' })
    const result = await uploadImage(file, 'news')

    expect(result.path).toMatch(/^news\/\d+_[a-z0-9]+\.png$/)
    expect(result.publicUrl).toBe(`https://cdn.example/${result.path}`)
    expect(mocks.upload).toHaveBeenCalledWith(result.path, file, { cacheControl: '3600', contentType: 'image/png', upsert: true })
  })

  it('uploadImage propaga el error del storage', async () => {
    mockStorageUpload({ error: { message: 'storage boom' } })
    const file = new File(['contenido'], 'foto.png', { type: 'image/png' })
    await expect(uploadImage(file, 'news')).rejects.toEqual({ message: 'storage boom' })
  })

  it('uploadVideo acepta video mp4', async () => {
    mockStorageUpload({})
    const file = new File(['video'], 'clip.mp4', { type: 'video/mp4' })
    const result = await uploadVideo(file, 'videos')
    expect(result.path).toMatch(/^videos\/\d+_[a-z0-9]+\.mp4$/)
  })

  it('uploadVideo rechaza tipos no permitidos', async () => {
    const file = new File(['x'], 'clip.mov', { type: 'video/quicktime' })
    await expect(uploadVideo(file, 'videos')).rejects.toThrow('Tipo de archivo no permitido')
  })

  it('deleteFile elimina el archivo del bucket', async () => {
    mocks.remove.mockResolvedValue({ error: null })
    await expect(deleteFile('news/123_abc.png')).resolves.toBeUndefined()
    expect(mocks.remove).toHaveBeenCalledWith(['news/123_abc.png'])
  })

  it('deleteFile propaga el error del storage', async () => {
    mocks.remove.mockResolvedValue({ error: { message: 'no existe' } })
    await expect(deleteFile('news/123_abc.png')).rejects.toEqual({ message: 'no existe' })
  })

  it('getPublicUrl devuelve la URL pública del path', () => {
    mocks.storageGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn.example/news/x.png' } })
    expect(getPublicUrl('news/x.png')).toBe('https://cdn.example/news/x.png')
    expect(mocks.storageGetPublicUrl).toHaveBeenCalledWith('news/x.png')
  })
})