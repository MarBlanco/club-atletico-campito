import Card from './Card'

interface StatCardProps {
  label: string
  value: number
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <Card>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </p>
      <p style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 700, color: '#1a1a2e', lineHeight: 1 }}>
        {value}
      </p>
    </Card>
  )
}

export default StatCard