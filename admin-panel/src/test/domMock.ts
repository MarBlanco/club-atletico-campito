import { vi } from 'vitest'

export interface CanvasMock {
  canvas: {
    width: number
    height: number
    getContext: ReturnType<typeof vi.fn>
    toBlob: ReturnType<typeof vi.fn>
    toDataURL: ReturnType<typeof vi.fn>
  }
  ctx: { drawImage: ReturnType<typeof vi.fn> }
}

export function installDomMock(options: {
  blob: Blob | null
  contextAvailable?: boolean
  dataUrl?: string
}): CanvasMock {
  const ctx = { drawImage: vi.fn() }
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => (options.contextAvailable === false ? null : ctx)),
    toBlob: vi.fn((callback: BlobCallback | null) => callback?.(options.blob)),
    toDataURL: vi.fn(() => options.dataUrl ?? 'data:image/jpeg;base64,AAAA'),
  }
  vi.stubGlobal('document', {
    createElement: vi.fn((tag: string) => (tag === 'canvas' ? canvas : undefined)),
  })
  return {
    canvas,
    ctx,
  }
}

export interface ImageMock {
  instance: {
    onload: (() => void) | null
    onerror: (() => void) | null
    src: string
    naturalWidth: number
    naturalHeight: number
  } | null
}

export function mockImageGlobal(width = 100, height = 100): ImageMock {
  const instances: NonNullable<ImageMock['instance']>[] = []
  class FakeImage {
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    src = ''
    naturalWidth = width
    naturalHeight = height
    constructor() {
      instances.push(this)
    }
  }
  vi.stubGlobal('Image', FakeImage)
  return {
    get instance() {
      return instances[instances.length - 1] ?? null
    },
  }
}

export interface UrlMock {
  createObjectURL: ReturnType<typeof vi.fn>
  revokeObjectURL: ReturnType<typeof vi.fn>
}

export function mockUrlGlobal(): UrlMock {
  const createObjectURL = vi.fn(() => 'blob:fake')
  const revokeObjectURL = vi.fn()
  vi.stubGlobal('URL', { createObjectURL, revokeObjectURL } as unknown as typeof URL)
  return { createObjectURL, revokeObjectURL }
}