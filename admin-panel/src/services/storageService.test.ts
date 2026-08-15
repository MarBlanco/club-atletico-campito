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

function mockVideoMetadata({ duration, error = false }: { duration?: number; error?: boolean }) {
  const video: Record<string, unknown> = {
    preload: '',
    duration: duration ?? 0,
    onloadedmetadata: null,
    onerror: null,
  }
  Object.defineProperty(video, 'src', {
    get() { return this._src },
    set(value: string) {
      this._src = value
      queueMicrotask(() => {
        if (error) (this.onerror as (() => void) | null)?.()
        else (this.onloadedmetadata as (() => void) | null)?.()
      })
    },
  })
  vi.stubGlobal('document', {
    createElement: vi.fn((tag: string) => (tag === 'video' ? video : undefined)),
  })
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:fake'),
    revokeObjectURL: vi.fn(),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
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

  it('uploadImage rechaza gif (no aprobado en MEDIA_SPEC)', async () => {
    const file = new File(['gif'], 'anim.gif', { type: 'image/gif' })
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
    mockVideoMetadata({ duration: 60 })
    const file = new File(['video'], 'clip.mp4', { type: 'video/mp4' })
    const result = await uploadVideo(file, 'videos')
    expect(result.path).toMatch(/^videos\/\d+_[a-z0-9]+\.mp4$/)
  })

  it('uploadVideo rechaza tipos no permitidos', async () => {
    const file = new File(['x'], 'clip.mov', { type: 'video/quicktime' })
    await expect(uploadVideo(file, 'videos')).rejects.toThrow('Tipo de archivo no permitido')
  })

  it('uploadVideo rechaza webm (formato no aprobado en MEDIA_SPEC)', async () => {
    const file = new File(['x'], 'clip.webm', { type: 'video/webm' })
    await expect(uploadVideo(file, 'videos')).rejects.toThrow('Tipo de archivo no permitido')
    expect(mocks.upload).not.toHaveBeenCalled()
  })

  it('uploadVideo rechaza archivos que superan el tamaño máximo de 250 MB', async () => {
    const file = new File([new Uint8Array(250 * 1024 * 1024 + 1)], 'grande.mp4', { type: 'video/mp4' })
    await expect(uploadVideo(file, 'videos')).rejects.toThrow('tamaño máximo de 250 MB')
    expect(mocks.upload).not.toHaveBeenCalled()
  })

  it('uploadVideo rechaza videos que superan la duración máxima de 5 minutos', async () => {
    mockVideoMetadata({ duration: 301 })
    const file = new File(['video'], 'largo.mp4', { type: 'video/mp4' })
    await expect(uploadVideo(file, 'videos')).rejects.toThrow('duración máxima de 5 minutos')
    expect(mocks.upload).not.toHaveBeenCalled()
  })

  it('uploadVideo propaga el error al leer la duración', async () => {
    mockVideoMetadata({ error: true })
    const file = new File(['video'], 'clip.mp4', { type: 'video/mp4' })
    await expect(uploadVideo(file, 'videos')).rejects.toThrow('No se pudo leer el video')
    expect(mocks.upload).not.toHaveBeenCalled()
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