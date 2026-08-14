import type { CSSProperties, PropsWithChildren } from 'react'

interface CardProps extends PropsWithChildren {
  style?: CSSProperties
}

function Card({ children, style }: CardProps) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, ...style }}>
      {children}
    </div>
  )
}

export default Card