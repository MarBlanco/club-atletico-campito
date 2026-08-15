import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error capturado por ErrorBoundary', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 48, textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: '0 0 8px' }}>
            Ocurrió un error
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 16px' }}>
            Algo salió mal al mostrar esta página. Recargá la página para continuar.
          </p>
          <button
            onClick={() => window.location.reload()}
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
            Recargar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary