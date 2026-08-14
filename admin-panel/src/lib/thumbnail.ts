import { loadImage } from './cropImage'

export async function generateThumbnail(
  image: HTMLImageElement,
  maxSize = 320,
  type = 'image/jpeg',
  quality = 0.85
): Promise<Blob> {
  const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight))
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas no disponible')

  ctx.drawImage(image, 0, 0, width, height)

  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, quality))
  if (!blob) throw new Error('No se pudo generar el thumbnail')
  return blob
}

export async function generateThumbnailFromFile(file: File, maxSize?: number): Promise<Blob> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await loadImage(objectUrl)
    return await generateThumbnail(image, maxSize)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
