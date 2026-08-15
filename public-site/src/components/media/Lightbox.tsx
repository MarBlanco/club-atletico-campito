import { useEffect, useRef } from 'react'
import type { Media } from '../../types/media'

interface LightboxProps {
  item: Media
  onClose: () => void
}

function Lightbox({ item, onClose }: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  function onDialogKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'Tab') return
    const dialog = dialogRef.current
    if (!dialog) return
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      ref={dialogRef}
      onKeyDown={onDialogKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Contenido multimedia"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 24,
      }}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '100%' }}>
        {item.type === 'video' ? (
          <video
            src={item.url}
            poster={item.thumbnail_url || undefined}
            controls
            autoPlay
            style={{ maxWidth: '100%', maxHeight: '90vh', display: 'block' }}
          />
        ) : (
          <img
            src={item.url}
            alt="Multimedia"
            style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', display: 'block' }}
          />
        )}
      </div>
    </div>
  )
}

export default Lightbox