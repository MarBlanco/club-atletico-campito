import type { TextareaHTMLAttributes } from 'react'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

const baseStyle: React.CSSProperties = {
  padding: '9px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  fontSize: 14,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  resize: 'vertical',
}

function Textarea(props: TextareaProps) {
  return <textarea {...props} style={{ ...baseStyle, ...props.style }} />
}

export default Textarea