import { afterEach, describe, expect, it, vi } from 'vitest'
import { installDomMock, type CanvasMock } from '../test/domMock'
import { optimizeImage } from './optimizeImage'

function imageOf(width: number, height: number): HTMLImageElement {
  return { naturalWidth: width, naturalHeight: height } as unknown as HTMLImageElement
}

let canvas: CanvasMock

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('optimizeImage', () => {
  it('reduce imágenes grandes al máximo por defecto (1920px)', async () => {
    canvas = installDomMock({ blob: new Blob(['img']) })
    const result = await optimizeImage(imageOf(3000, 1500), { type: 'image/jpeg' })

    expect(result).toBeInstanceOf(Blob)
    expect(canvas.canvas.width).toBe(1920)
    expect(canvas.canvas.height).toBe(960)
    expect(canvas.ctx.drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1920, 960)
  })

  it('mantiene imágenes pequeñas sin escalar', async () => {
    canvas = installDomMock({ blob: new Blob(['img']) })
    await optimizeImage(imageOf(800, 600), { type: 'image/jpeg' })

    expect(canvas.canvas.width).toBe(800)
    expect(canvas.canvas.height).toBe(600)
  })

  it('respeta el maxDimension indicado', async () => {
    canvas = installDomMock({ blob: new Blob(['img']) })
    await optimizeImage(imageOf(800, 600), { maxDimension: 200, type: 'image/jpeg' })

    expect(canvas.canvas.width).toBe(200)
    expect(canvas.canvas.height).toBe(150)
  })

  it('detecta webp cuando el canvas lo soporta', async () => {
    canvas = installDomMock({ blob: new Blob(['img']), dataUrl: 'data:image/webp;base64,AAAA' })

    await optimizeImage(imageOf(800, 600))

    expect(canvas.canvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/webp', 0.8)
  })

  it('usa jpeg cuando el canvas no soporta webp', async () => {
    canvas = installDomMock({ blob: new Blob(['img']), dataUrl: 'data:image/jpeg;base64,AAAA' })

    await optimizeImage(imageOf(800, 600))

    expect(canvas.canvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', 0.8)
  })

  it('lanza error cuando el canvas no está disponible', async () => {
    canvas = installDomMock({ blob: new Blob(['img']), contextAvailable: false })
    await expect(optimizeImage(imageOf(800, 600))).rejects.toThrow('Canvas no disponible')
  })

  it('lanza error cuando no se puede optimizar la imagen', async () => {
    canvas = installDomMock({ blob: null })
    await expect(optimizeImage(imageOf(800, 600))).rejects.toThrow('No se pudo optimizar la imagen')
  })
})