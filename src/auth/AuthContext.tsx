import { useCallback, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import { AuthContext, meQueryKey, type AuthStatus, type User } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const meQuery = useQuery({
    queryKey: meQueryKey,
    queryFn: () => apiFetch<User>('/api/auth/me/'),
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiFetch<{ user: User }>('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(meQueryKey, user)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => apiFetch('/api/auth/logout/', { method: 'POST' }).catch(() => {}),
    onSuccess: () => {
      queryClient.setQueryData(meQueryKey, null)
    },
  })

  const login = useCallback(
    async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password })
    },
    [loginMutation],
  )

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync()
  }, [logoutMutation])

  const user = meQuery.data ?? null
  const status: AuthStatus = meQuery.isPending
    ? 'loading'
    : user
      ? 'authenticated'
      : 'unauthenticated'

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
