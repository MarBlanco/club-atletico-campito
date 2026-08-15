import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

const baseStyle: React.CSSProperties = {
  padding: '9px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  fontSize: 14,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

function Input(props: InputProps) {
  return <input {...props} style={{ ...baseStyle, ...props.style }} />
}

export default Input