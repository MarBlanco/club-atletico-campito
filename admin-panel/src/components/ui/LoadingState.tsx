function LoadingState({ label = 'Cargando...' }: { label?: string }) {
  return (
    <p style={{ color: '#6b7280', fontSize: 14 }} role="status" aria-live="polite">
      {label}
    </p>
  )
}

export default LoadingState