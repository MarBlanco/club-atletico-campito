import { useRef, useState } from 'react'
import type { StorageFolder } from '../../services/storageService'
import { uploadVideo } from '../../services/storageService'
import MediaPreview from './MediaPreview'

interface VideoUploaderProps {
  id?: string
  folder: StorageFolder
  value: string
  onChange: (url: string) => void
}

function VideoUploader({ id = 'video-uploader-file', folder, value, onChange }: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const { publicUrl } = await uploadVideo(file, folder)
      onChange(publicUrl)
      if (inputRef.current) inputRef.current.value = ''
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al subir video')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {value && <MediaPreview url={value} type="video" alt="Video" />}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="video/mp4"
        onChange={onFileSelect}
        disabled={uploading}
        style={{ fontSize: 13 }}
      />
      {uploading && <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>Subiendo video...</p>}
      {error && <p style={{ color: '#ef4444', fontSize: 12, margin: 0 }} role="alert">{error}</p>}
    </div>
  )
}

export default VideoUploader