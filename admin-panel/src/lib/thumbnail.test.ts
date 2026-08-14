import { afterEach, describe, expect, it, vi } from 'vitest'
import { installDomMock, mockImageGlobal, mockUrlGlobal, type CanvasMock } from '../test/domMock'
import { generateThumbnail, generateThumbnailFromFile } from './thumbnail'

function imageOf(width: number, height: number): HTMLImageElement {
  return { naturalWidth: width, naturalHeight: height } as unknown as HTMLImageElement
}

let canvas: CanvasMock

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('generateThumbnail', () => {
  it('escala al tamaño máximo por defecto (320px) manteniendo el aspecto', async () => {
    canvas = installDomMock({ blob: new Blob(['img']) })
    const result = await generateThumbnail(imageOf(1600, 1200))

    expect(result).toBeInstanceOf(Blob)
    expect(canvas.canvas.width).toBe(320)
    expect(canvas.canvas.height).toBe(240)
    expect(canvas.ctx.drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 320, 240)
  })

  it('respeta un maxSize personalizado', async () => {
    canvas = installDomMock({ blob: new Blob(['img']) })
    await generateThumbnail(imageOf(1600, 1200), 100)

    expect(canvas.canvas.width).toBe(100)
    expect(canvas.canvas.height).toBe(75)
  })

  it('no escala imágenes más chicas que el maxSize', async () => {
    canvas = installDomMock({ blob: new Blob(['img']) })
    await generateThumbnail(imageOf(200, 100))

    expect(canvas.canvas.width).toBe(200)
    expect(canvas.canvas.height).toBe(100)
  })

  it('lanza error cuando el canvas no está disponible', async () => {
    canvas = installDomMock({ blob: new Blob(['img']), contextAvailable: false })
    await expect(generateThumbnail(imageOf(1600, 1200))).rejects.toThrow('Canvas no disponible')
  })

  it('lanza error cuando no se puede generar el thumbnail', async () => {
    canvas = installDomMock({ blob: null })
    await expect(generateThumbnail(imageOf(1600, 1200))).rejects.toThrow('No se pudo generar el thumbnail')
  })
})

describe('generateThumbnailFromFile', () => {
  it('genera el thumbnail a partir de un archivo', async () => {
    const imageMock = mockImageGlobal(1600, 1200)
    const urlMock = mockUrlGlobal()
    canvas = installDomMock({ blob: new Blob(['img']) })

    const file = new File(['contenido'], 'foto.png', { type: 'image/png' })
    const promise = generateThumbnailFromFile(file)
    imageMock.instance?.onload?.()
    const result = await promise

    expect(result).toBeInstanceOf(Blob)
    expect(canvas.canvas.width).toBe(320)
    expect(canvas.canvas.height).toBe(240)
    expect(urlMock.createObjectURL).toHaveBeenCalledWith(file)
    expect(urlMock.revokeObjectURL).toHaveBeenCalledWith('blob:fake')
  })

  it('propaga el error cuando el archivo no puede cargarse', async () => {
    const imageMock = mockImageGlobal(1600, 1200)
    mockUrlGlobal()

    const file = new File(['contenido'], 'foto.png', { type: 'image/png' })
    const promise = generateThumbnailFromFile(file)
    imageMock.instance?.onerror?.()
    await expect(promise).rejects.toThrow('No se pudo cargar la imagen')
  })
})