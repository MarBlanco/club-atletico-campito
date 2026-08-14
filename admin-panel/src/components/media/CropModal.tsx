import { useEffect, useRef, useState } from 'react'
import { cropImage, loadImage, type CropArea } from '../../lib/cropImage'

interface CropModalProps {
  src: string
  aspectRatio?: number
  onCancel: () => void
  onSave: (blob: Blob) => void
}

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

interface ImageDisplay {
  x: number
  y: number
  width: number
  height: number
  naturalWidth: number
  naturalHeight: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function CropModal({ src, aspectRatio = 1, onCancel, onSave }: CropModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [display, setDisplay] = useState<ImageDisplay | null>(null)
  const [crop, setCrop] = useState<Rect | null>(null)
  const [drag, setDrag] = useState<'move' | 'resize' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number; crop: Rect } | null>(null)

  useEffect(() => {
    let active = true

    loadImage(src)
      .then(img => {
        if (!active) return
        const container = containerRef.current
        if (!container) return
        const cw = container.clientWidth
        const ch = container.clientHeight
        const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight)
        const width = img.naturalWidth * scale
        const height = img.naturalHeight * scale
        const nextDisplay: ImageDisplay = {
          x: (cw - width) / 2,
          y: (ch - height) / 2,
          width,
          height,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        }
        let cropW: number
        let cropH: number
        if (aspectRatio >= width / height) {
          cropW = width
          cropH = width / aspectRatio
        } else {
          cropH = height
          cropW = height * aspectRatio
        }
        setImage(img)
        setDisplay(nextDisplay)
        setCrop({ x: (width - cropW) / 2, y: (height - cropH) / 2, width: cropW, height: cropH })
      })
      .catch(() => {
        if (active) setError('No se pudo cargar la imagen')
      })

    return () => {
      active = false
    }
  }, [src, aspectRatio])

  function onPointerDown(e: React.PointerEvent, mode: 'move' | 'resize') {
    e.preventDefault()
    e.stopPropagation()
    if (!crop) return
    dragRef.current = { startX: e.clientX, startY: e.clientY, crop }
    setDrag(mode)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag || !dragRef.current || !display || !crop) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    const start = dragRef.current.crop
    const min = 40

    if (drag === 'move') {
      setCrop({
        x: clamp(start.x + dx, 0, display.width - start.width),
        y: clamp(start.y + dy, 0, display.height - start.height),
        width: start.width,
        height: start.height,
      })
    } else {
      let w = clamp(start.width + dx, min, display.width - start.x)
      let h = w / aspectRatio
      if (h > display.height - start.y) {
        h = display.height - start.y
        w = h * aspectRatio
      }
      setCrop({ x: start.x, y: start.y, width: w, height: h })
    }
  }

  function onPointerUp() {
    setDrag(null)
    dragRef.current = null
  }

  async function handleSave() {
    if (!image || !display || !crop) return
    setSaving(true)
    try {
      const scale = display.naturalWidth / display.width
      const native: CropArea = {
        x: crop.x * scale,
        y: crop.y * scale,
        width: crop.width * scale,
        height: crop.height * scale,
      }
      const blob = await cropImage(image, native)
      onSave(blob)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al recortar la imagen')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: 24,
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 10,
        padding: 24,
        width: '100%',
        maxWidth: 640,
        boxSizing: 'border-box',
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', margin: '0 0 16px' }}>
          Recortar imagen
        </h3>

        {error ? (
          <p style={{ color: '#ef4444', fontSize: 13, margin: '0 0 16px' }}>{error}</p>
        ) : display && crop ? (
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              width: '100%',
              height: 380,
              background: '#111111',
              borderRadius: 8,
              overflow: 'hidden',
              touchAction: 'none',
              userSelect: 'none',
              marginBottom: 20,
            }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <img
              src={src}
              alt="Imagen a recortar"
              style={{
                position: 'absolute',
                left: display.x,
                top: display.y,
                width: display.width,
                height: display.height,
                display: 'block',
              }}
            />
            <div
              onPointerDown={e => onPointerDown(e, 'move')}
              style={{
                position: 'absolute',
                left: display.x + crop.x,
                top: display.y + crop.y,
                width: crop.width,
                height: crop.height,
                border: '2px solid #1EB9E8',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                cursor: 'move',
                boxSizing: 'border-box',
              }}
            >
              <div
                onPointerDown={e => onPointerDown(e, 'resize')}
                style={{
                  position: 'absolute',
                  right: -7,
                  bottom: -7,
                  width: 14,
                  height: 14,
                  background: '#1EB9E8',
                  border: '2px solid #ffffff',
                  borderRadius: 4,
                  cursor: 'nwse-resize',
                }}
              />
            </div>
          </div>
        ) : (
          <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 20px' }}>Cargando imagen...</p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" onClick={onCancel} style={btnStyle('#6b7280')}>
            Cancelar
          </button>
          <button type="button" onClick={handleSave} disabled={saving || !crop} style={btnStyle('#059669')}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
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

export default CropModal