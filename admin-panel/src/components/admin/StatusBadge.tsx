export type StatusTone = 'green' | 'gray' | 'blue' | 'amber'

interface StatusBadgeProps {
  label: string
  tone?: StatusTone
}

const TONES: Record<StatusTone, { background: string; color: string }> = {
  green: { background: '#dcfce7', color: '#16a34a' },
  gray: { background: '#f3f4f6', color: '#6b7280' },
  blue: { background: '#dbeafe', color: '#1d4ed8' },
  amber: { background: '#fef3c7', color: '#92400e' },
}

function StatusBadge({ label, tone = 'gray' }: StatusBadgeProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        background: TONES[tone].background,
        color: TONES[tone].color,
      }}
    >
      {label}
    </span>
  )
}

export default StatusBadge