interface ActionMenuProps {
  onEdit: () => void
  onDelete: () => void
  editLabel?: string
  deleteLabel?: string
}

function btnSmall(bg: string): React.CSSProperties {
  return {
    padding: '5px 12px',
    background: bg,
    color: '#fff',
    border: 'none',
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  }
}

function ActionMenu({
  onEdit,
  onDelete,
  editLabel = 'Editar',
  deleteLabel = 'Eliminar',
}: ActionMenuProps) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={onEdit} style={btnSmall('#3b82f6')}>
        {editLabel}
      </button>
      <button onClick={onDelete} style={btnSmall('#ef4444')}>
        {deleteLabel}
      </button>
    </div>
  )
}

export default ActionMenu