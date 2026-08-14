import { afterEach, describe, expect, it, vi } from 'vitest'
import { installDomMock, mockImageGlobal, type CanvasMock } from '../test/domMock'
import { cropImage, loadImage, type CropArea } from './cropImage'

const image = {
  naturalWidth: 1000,
  naturalHeight: 800,
} as unknown as HTMLImageElement

let canvas: CanvasMock

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('cropImage', () => {
  it('recorta usando las coordenadas del área', async () => {
    const blob = new Blob(['img'])
    canvas = installDomMock({ blob })
    const crop: CropArea = { x: 10, y: 20, width: 300, height: 200 }

    const result = await cropImage(image, crop)

    expect(result).toBe(blob)
    expect(canvas.canvas.width).toBe(300)
    expect(canvas.canvas.height).toBe(200)
    expect(canvas.ctx.drawImage).toHaveBeenCalledWith(image, 10, 20, 300, 200, 0, 0, 300, 200)
    expect(canvas.canvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', 0.92)
  })

  it('redondea las dimensiones y fuerza un mínimo de 1px', async () => {
    canvas = installDomMock({ blob: new Blob(['img']) })
    await cropImage(image, { x: 0, y: 0, width: 0.4, height: 5.6 })

    expect(canvas.canvas.width).toBe(1)
    expect(canvas.canvas.height).toBe(6)
  })

  it('respeta el type y quality indicados', async () => {
    canvas = installDomMock({ blob: new Blob(['img']) })
    await cropImage(image, { x: 0, y: 0, width: 100, height: 100 }, 'image/png', 0.5)

    expect(canvas.canvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/png', 0.5)
  })

  it('lanza error cuando el canvas no está disponible', async () => {
    canvas = installDomMock({ blob: new Blob(['img']), contextAvailable: false })
    await expect(cropImage(image, { x: 0, y: 0, width: 100, height: 100 })).rejects.toThrow('Canvas no disponible')
  })

  it('lanza error cuando no se puede generar la imagen recortada', async () => {
    canvas = installDomMock({ blob: null })
    await expect(cropImage(image, { x: 0, y: 0, width: 100, height: 100 })).rejects.toThrow(
      'No se pudo generar la imagen recortada'
    )
  })
})

describe('loadImage', () => {
  it('resuelve cuando la imagen carga', async () => {
    const mock = mockImageGlobal()
    const promise = loadImage('https://cdn.example/foto.jpg')
    mock.instance?.onload?.()
    await expect(promise).resolves.toBeDefined()
    expect(mock.instance?.src).toBe('https://cdn.example/foto.jpg')
  })

  it('rechaza cuando la imagen falla', async () => {
    const mock = mockImageGlobal()
    const promise = loadImage('https://cdn.example/foto.jpg')
    mock.instance?.onerror?.()
    await expect(promise).rejects.toThrow('No se pudo cargar la imagen')
  })
})