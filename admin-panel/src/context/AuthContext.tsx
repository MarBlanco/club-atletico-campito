import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { PropsWithChildren } from 'react'
import { supabase } from '../lib/supabase'
import { getUserById } from '../services/usersService'
import type { UserRole } from '../types/user'

interface AuthContextValue {
  user: User | null
  session: Session | null
  role: UserRole | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  role: null,
  loading: true,
})

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadRole(userId: string) {
      try {
        const profile = await getUserById(userId)
        if (active && profile) {
          setRole(profile.role)
          return
        }
        // Self-heal: si el trigger handle_new_user no corrió, crear la fila.
        const { data: authData } = await supabase.auth.getUser()
        const u = authData?.user
        if (active && u) {
          await supabase.rpc('ensure_user_profile', {
            p_id: u.id,
            p_email: u.email ?? '',
            p_name: u.user_metadata?.name ?? '',
          })
          const fresh = await getUserById(userId)
          if (active && fresh) setRole(fresh.role)
          else if (active) setRole(null)
        } else if (active) {
          setRole(null)
        }
      } catch {
        if (active) setRole(null)
      }
    }

    async function loadSession() {
      const { data } = await supabase.auth.getSession()
      if (!active) return
      const currentUser = data.session?.user ?? null
      setSession(data.session)
      setUser(currentUser)
      if (currentUser) await loadRole(currentUser.id)
      if (active) setLoading(false)
    }

    loadSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) loadRole(session.user.id)
      else setRole(null)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, role, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}