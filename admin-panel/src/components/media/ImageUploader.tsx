import { useRef, useState } from 'react'
import type { StorageFolder } from '../../services/storageService'
import { uploadImage } from '../../services/storageService'
import { optimizeImageFromFile } from '../../lib/optimizeImage'
import { generateThumbnailFromFile } from '../../lib/thumbnail'
import CropModal from './CropModal'
import MediaPreview from './MediaPreview'

interface ImageUploaderProps {
  id?: string
  folder: StorageFolder
  value: string
  onChange: (url: string) => void
  onThumbnailChange?: (url: string) => void
  aspectRatio?: number
  label?: string
}

function ImageUploader({
  id = 'image-uploader-file',
  folder,
  value,
  onChange,
  onThumbnailChange,
  aspectRatio,
  label = 'Imagen',
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<File | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setPending(file)
    setError(null)
    if (file && aspectRatio) {
      setCropSrc(URL.createObjectURL(file))
    }
  }

  async function uploadFile(file: File) {
    setUploading(true)
    try {
      const optimized = await optimizeImageFromFile(file, { maxDimension: 1920 })
      const optimizedFile = new File([optimized], file.name, { type: optimized.type })
      const { publicUrl } = await uploadImage(optimizedFile, folder)
      onChange(publicUrl)
      if (onThumbnailChange) {
        const thumb = await generateThumbnailFromFile(file)
        const thumbFile = new File([thumb], 'thumb.jpg', { type: thumb.type })
        const result = await uploadImage(thumbFile, folder)
        onThumbnailChange(result.publicUrl)
      }
      setPending(null)
      if (inputRef.current) inputRef.current.value = ''
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  async function handleCropSave(blob: Blob) {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    const file = new File([blob], 'image.jpg', { type: blob.type })
    setPending(file)
    await uploadFile(file)
  }

  function handleSubir() {
    if (!pending || uploading) return
    if (aspectRatio && !cropSrc) {
      setCropSrc(URL.createObjectURL(pending))
      return
    }
    void uploadFile(pending)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {value && <MediaPreview url={value} alt={label} />}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onFileSelect}
          style={{ fontSize: 13, flex: 1 }}
        />
        <button
          type="button"
          onClick={handleSubir}
          disabled={uploading || !pending}
          style={btnStyle(pending && !uploading ? '#1a1a2e' : '#9ca3af')}
        >
          {uploading ? 'Subiendo...' : 'Subir'}
        </button>
      </div>
      {error && <p style={{ color: '#ef4444', fontSize: 12, margin: 0 }} role="alert">{error}</p>}
      {cropSrc && (
        <CropModal
          src={cropSrc}
          aspectRatio={aspectRatio}
          onCancel={() => {
            URL.revokeObjectURL(cropSrc)
            setCropSrc(null)
          }}
          onSave={handleCropSave}
        />
      )}
    </div>
  )
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    padding: '9px 18px',
    background: bg,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  }
}

export default ImageUploader