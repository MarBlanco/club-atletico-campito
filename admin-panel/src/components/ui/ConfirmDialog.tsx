import Modal from './Modal'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
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

function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p style={{ color: '#374151', fontSize: 14, margin: '0 0 20px' }}>{message}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button type="button" onClick={onCancel} style={btnStyle('#6b7280')}>
          {cancelLabel}
        </button>
        <button type="button" onClick={onConfirm} style={btnStyle('#ef4444')}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog