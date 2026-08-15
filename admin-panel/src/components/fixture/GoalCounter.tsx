import { decrementGoal, incrementGoal } from '../../lib/fixtureRules'

interface GoalCounterProps {
  value: number | null
  ariaLabel: string
  onChange: (value: number) => void
}

function goalBtn(): React.CSSProperties {
  return {
    width: 32,
    height: 32,
    borderRadius: 6,
    border: '1px solid #d1d5db',
    background: '#f9fafb',
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    lineHeight: 1,
  }
}

function GoalCounter({ value, ariaLabel, onChange }: GoalCounterProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button type="button" onClick={() => onChange(decrementGoal(value))} style={goalBtn()} aria-label={`${ariaLabel}: restar`}>
        −
      </button>
      <span style={{ minWidth: 28, textAlign: 'center', fontSize: 16, fontWeight: 700 }} aria-live="polite">
        {value ?? 0}
      </span>
      <button type="button" onClick={() => onChange(incrementGoal(value))} style={goalBtn()} aria-label={`${ariaLabel}: sumar`}>
        +
      </button>
    </div>
  )
}

export default GoalCounter