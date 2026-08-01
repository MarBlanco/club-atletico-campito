function HomePage() {
  const styles = {
    hero: {
      backgroundColor: '#123A9E',
      color: '#ffffff',
      padding: '80px 24px',
      borderRadius: 8,
      textAlign: 'center' as const,
      marginBottom: 48,
    } as React.CSSProperties,

    heroTitle: {
      fontSize: 40,
      fontWeight: 800,
      letterSpacing: 0.5,
      margin: 0,
      lineHeight: 1.1,
    } as React.CSSProperties,

    heroSubtitle: {
      fontSize: 18,
      fontWeight: 400,
      margin: '16px 0 0',
      color: '#1EB9E8',
    } as React.CSSProperties,

    section: {
      marginBottom: 48,
    } as React.CSSProperties,

    sectionTitle: {
      fontSize: 24,
      fontWeight: 700,
      color: '#111111',
      margin: '0 0 20px',
      borderLeft: '4px solid #123A9E',
      paddingLeft: 12,
    } as React.CSSProperties,

    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: 20,
    } as React.CSSProperties,

    placeholderCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      padding: 24,
      minHeight: 160,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 8,
    } as React.CSSProperties,

    placeholderLabel: {
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: 1,
      color: '#1EB9E8',
    } as React.CSSProperties,

    placeholderText: {
      fontSize: 14,
      color: '#6b7280',
      margin: 0,
    } as React.CSSProperties,
  }

  const sections = [
    {
      title: 'Club',
      items: ['Identidad', 'Historia'],
    },
    {
      title: 'Equipos',
      items: ['Primera', 'Infanto Juvenil'],
    },
    {
      title: 'Noticias',
      items: ['Última novedad'],
    },
    {
      title: 'Fixture',
      items: ['Próximo partido'],
    },
    {
      title: 'Momentos Campito',
      items: ['Destacado reciente'],
    },
  ]

  return (
    <div>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>CLUB ATLÉTICO CAMPITO</h1>
        <p style={styles.heroSubtitle}>
          Colón, Entre Ríos · Argentina
        </p>
      </section>

      {sections.map(({ title, items }) => (
        <section key={title} style={styles.section}>
          <h2 style={styles.sectionTitle}>{title}</h2>
          <div style={styles.grid}>
            {items.map(item => (
              <div key={item} style={styles.placeholderCard}>
                <span style={styles.placeholderLabel}>{title}</span>
                <p style={styles.placeholderText}>{item}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default HomePage
