import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { apiFetch } from '../lib/api'
import { AuthContext, type AuthStatus, type User } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    apiFetch<User>('/api/auth/me/')
      .then((currentUser) => {
        setUser(currentUser)
        setStatus('authenticated')
      })
      .catch(() => {
        setUser(null)
        setStatus('unauthenticated')
      })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { user: loggedInUser } = await apiFetch<{ user: User }>('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setUser(loggedInUser)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    await apiFetch('/api/auth/logout/', { method: 'POST' }).catch(() => {})
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
