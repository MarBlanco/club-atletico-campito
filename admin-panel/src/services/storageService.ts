import { supabase } from '../lib/supabase'

// ============================================================
// Configuración
// ============================================================

export const BUCKET = 'campito-media'

export const STORAGE_FOLDERS = ['club', 'news', 'players', 'staff', 'galleries', 'videos'] as const
export type StorageFolder = typeof STORAGE_FOLDERS[number]

const MAX_IMAGE_SIZE = 5 * 1024 * 1024   // 5 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100 MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg']

// ============================================================
// Tipos de retorno
// ============================================================

export interface UploadResult {
  path: string
  publicUrl: string
}

// ============================================================
// Helpers internos
// ============================================================

function buildPath(folder: StorageFolder, file: File): string {
  const ext = file.name.split('.').pop() ?? ''
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  return `${folder}/${timestamp}_${random}.${ext}`
}

function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

async function upload(
  file: File,
  folder: StorageFolder,
  allowedTypes: string[],
  maxSize: number
): Promise<UploadResult> {
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Tipo de archivo no permitido: ${file.type}`)
  }
  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / 1024 / 1024)
    throw new Error(`El archivo supera el tamaño máximo de ${maxMB} MB`)
  }

  const path = buildPath(folder, file)

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: true,
  })

  if (error) throw error

  return { path, publicUrl: getPublicUrl(path) }
}

// ============================================================
// API pública
// ============================================================

export async function uploadImage(file: File, folder: StorageFolder): Promise<UploadResult> {
  return upload(file, folder, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE)
}

export async function uploadVideo(file: File, folder: StorageFolder): Promise<UploadResult> {
  return upload(file, folder, ALLOWED_VIDEO_TYPES, MAX_VIDEO_SIZE)
}

export async function deleteFile(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
}

export { getPublicUrl }
