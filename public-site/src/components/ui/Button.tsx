import type { PropsWithChildren } from 'react'

interface ButtonProps extends PropsWithChildren {
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

function Button({ children, onClick, type = 'button', disabled }: ButtonProps) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export default Button
