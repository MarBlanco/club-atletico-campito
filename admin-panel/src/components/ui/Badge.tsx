import type { PropsWithChildren } from 'react'

export type BadgeVariant = 'green' | 'gray' | 'blue' | 'amber'

const VARIANT_STYLES: Record<BadgeVariant, { background: string; color: string }> = {
  green: { background: '#dcfce7', color: '#16a34a' },
  gray: { background: '#f3f4f6', color: '#6b7280' },
  blue: { background: '#dbeafe', color: '#1d4ed8' },
  amber: { background: '#fef3c7', color: '#92400e' },
}

interface BadgeProps extends PropsWithChildren {
  variant: BadgeVariant
}

function Badge({ variant, children }: BadgeProps) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 600,
      ...VARIANT_STYLES[variant],
    }}>
      {children}
    </span>
  )
}

export default Badge