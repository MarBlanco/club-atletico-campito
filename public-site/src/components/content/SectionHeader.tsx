interface SectionHeaderProps {
  title: string
  subtitle?: string
}

function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: '#111111',
          margin: 0,
          borderLeft: '4px solid #123A9E',
          paddingLeft: 12,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontSize: 14,
            color: '#6b7280',
            margin: '8px 0 0',
            paddingLeft: 12,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default SectionHeader