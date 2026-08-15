import { useEffect, useRef } from 'react'
import type { PropsWithChildren } from 'react'

interface ModalProps extends PropsWithChildren {
  title: string
  onClose: () => void
}

function Modal({ title, onClose, children }: ModalProps) {
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
      aria-labelledby="modal-title"
      style={{
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
        maxWidth: 480,
        boxSizing: 'border-box',
      }}>
        <h3 id="modal-title" style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', margin: '0 0 16px' }}>
          {title}
        </h3>
        {children}
      </div>
    </div>
  )
}

export default Modal