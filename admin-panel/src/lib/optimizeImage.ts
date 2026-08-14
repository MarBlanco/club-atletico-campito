export interface OptimizeOptions {
  maxDimension?: number
  quality?: number
  type?: string
}

const DEFAULT_MAX_DIMENSION = 1920
const DEFAULT_QUALITY = 0.8

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('No se pudo cargar la imagen'))
    img.src = src
  })
}

function pickFormat(canvas: HTMLCanvasElement): string {
  if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
    return 'image/webp'
  }
  return 'image/jpeg'
}

export async function optimizeImage(
  image: HTMLImageElement,
  options: OptimizeOptions = {}
): Promise<Blob> {
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION
  const quality = options.quality ?? DEFAULT_QUALITY

  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas no disponible')

  ctx.drawImage(image, 0, 0, width, height)

  const format = options.type ?? pickFormat(canvas)
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, format, quality))
  if (!blob) throw new Error('No se pudo optimizar la imagen')
  return blob
}

export async function optimizeImageFromFile(file: File, options?: OptimizeOptions): Promise<Blob> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await loadImage(objectUrl)
    return await optimizeImage(image, options)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
