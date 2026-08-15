export async function generateVideoThumbnail(
  file: File,
  time = 1,
  maxSize = 640
): Promise<Blob> {
  const url = URL.createObjectURL(file)
  try {
    const video = document.createElement('video')
    video.src = url
    video.muted = true
    video.playsInline = true

    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve()
      video.onerror = () => reject(new Error('No se pudo cargar el video'))
    })

    if (Number.isFinite(video.duration) && video.duration > 0) {
      time = Math.min(time, video.duration - 0.1)
    }
    video.currentTime = Math.max(0, time)

    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve()
      video.onerror = () => reject(new Error('No se pudo leer el frame del video'))
    })

    const scale = Math.min(1, maxSize / Math.max(video.videoWidth, video.videoHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale))

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas no disponible')

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85))
    if (!blob) throw new Error('No se pudo generar el thumbnail')
    return blob
  } finally {
    URL.revokeObjectURL(url)
  }
}