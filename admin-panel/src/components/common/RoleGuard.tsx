import { Navigate } from 'react-router-dom'
import type { PropsWithChildren } from 'react'
import { useAuth } from '../../context/AuthContext'

function RoleGuard({ children }: PropsWithChildren) {
  const { role, loading } = useAuth()

  if (loading) return null

  if (role !== 'admin') return <Navigate to="/dashboard" replace />

  return <>{children}</>
}

export default RoleGuard