import { useIsMobile } from '../../hooks/useMediaQuery'

interface HeroSectionProps {
  title: string
  subtitle?: string
}

function HeroSection({ title, subtitle }: HeroSectionProps) {
  const isMobile = useIsMobile()

  return (
    <section
      style={{
        backgroundColor: '#123A9E',
        color: '#ffffff',
        padding: isMobile ? '48px 16px' : '80px 24px',
        borderRadius: 8,
        textAlign: 'center',
        marginBottom: 48,
      }}
    >
      <h1
        style={{
          fontSize: isMobile ? 28 : 40,
          fontWeight: 800,
          letterSpacing: 0.5,
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            fontSize: isMobile ? 15 : 18,
            fontWeight: 400,
            margin: '16px 0 0',
            color: '#1EB9E8',
          }}
        >
          {subtitle}
        </p>
      )}
    </section>
  )
}

export default HeroSection