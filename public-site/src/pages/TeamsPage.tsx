import { useEffect, useState } from 'react'
import type { Staff, StaffCategory } from '../types/staff'
import { getStaff } from '../services/staffService'
import StaffCard from '../components/content/StaffCard'

interface CategoryDef {
  key: StaffCategory
  label: string
  description: string
}

const CATEGORIES: CategoryDef[] = [
  {
    key: 'primera',
    label: 'Primera',
    description: 'Plantel y cuerpo técnico de la categoría principal.',
  },
  {
    key: 'infanto',
    label: 'Infanto Juvenil',
    description: 'Formación y desarrollo de las divisiones juveniles.',
  },
  {
    key: 'directivos',
    label: 'Directivos',
    description: 'Conducción institucional del club.',
  },
]

const styles = {
  header: {
    marginBottom: 32,
  } as React.CSSProperties,

  title: {
    fontSize: 32,
    fontWeight: 800,
    color: '#123A9E',
    margin: 0,
    lineHeight: 1.1,
  } as React.CSSProperties,

  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    margin: '8px 0 0',
  } as React.CSSProperties,

  category: {
    marginBottom: 32,
  } as React.CSSProperties,

  categoryTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#111111',
    margin: '0 0 4px',
  } as React.CSSProperties,

  categoryDescription: {
    fontSize: 14,
    color: '#6b7280',
    margin: '0 0 16px',
  } as React.CSSProperties,

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 20,
  } as React.CSSProperties,

  empty: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 24,
    textAlign: 'center' as const,
    color: '#6b7280',
    fontSize: 14,
  } as React.CSSProperties,
}

function TeamsPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getStaff()
      .then(data => {
        if (!active) return
        setStaff(data)
        setError(null)
      })
      .catch(e => {
        if (active) setError(e instanceof Error ? e.message : 'Error al cargar el cuerpo técnico')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Equipos</h1>
        <p style={styles.subtitle}>Categorías del Club Atlético Campito</p>
      </div>

      {error ? (
        <div style={styles.empty}>{error}</div>
      ) : loading ? (
        <div style={styles.empty}>Cargando...</div>
      ) : staff.length === 0 ? (
        <div style={styles.empty}>No hay integrantes cargados todavía.</div>
      ) : (
        CATEGORIES.map(category => {
          const members = staff.filter(s => s.category === category.key)
          if (members.length === 0) return null
          return (
            <section key={category.key} style={styles.category}>
              <h2 style={styles.categoryTitle}>{category.label}</h2>
              <p style={styles.categoryDescription}>{category.description}</p>
              <div style={styles.grid}>
                {members.map(member => (
                  <StaffCard
                    key={member.id}
                    name={member.name}
                    role={member.role}
                    imageUrl={member.image_url}
                  />
                ))}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}

export default TeamsPage