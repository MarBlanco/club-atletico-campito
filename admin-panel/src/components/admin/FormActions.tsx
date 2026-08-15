interface FormActionsProps {
  saving?: boolean
  saveLabel?: string
  savingLabel?: string
  onCancel?: () => void
  disabled?: boolean
  style?: React.CSSProperties
}

function FormActions({
  saving = false,
  saveLabel = 'Guardar',
  savingLabel = 'Guardando...',
  onCancel,
  disabled = false,
  style,
}: FormActionsProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        marginTop: 4,
        ...style,
      }}
    >
      <button
        type="submit"
        disabled={saving || disabled}
        style={{
          padding: '9px 18px',
          background: '#1a1a2e',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {saving ? savingLabel : saveLabel}
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '9px 18px',
            background: '#6b7280',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
      )}
    </div>
  )
}

export default FormActions