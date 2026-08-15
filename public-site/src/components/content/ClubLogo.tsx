import { useState } from 'react'

interface ClubLogoProps {
  src: string
  alt?: string
  style?: React.CSSProperties
  size?: number
}

function ClubLogo({ src, alt = 'Escudo Club Atlético Campito', style, size = 64 }: ClubLogoProps) {
  const [failed, setFailed] = useState(false)

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: '#123A9E',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: size * 0.4,
          ...style,
        }}
      >
        C
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      style={style}
    />
  )
}

export default ClubLogo