import { useCallback, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import { tokenStorage } from '../lib/tokenStorage'
import { AuthContext, meQueryKey, type AuthStatus, type User } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  // Read once per render rather than stored as state: a login/logout
  // mutation's onSuccess always calls setQueryData for meQueryKey too,
  // which already triggers the re-render that picks up the new value.
  const hasToken = !!tokenStorage.getAccess()

  const meQuery = useQuery({
    queryKey: meQueryKey,
    queryFn: () => apiFetch<User>('/api/auth/me/'),
    retry: false,
    // No point asking the server who we are when we don't even have a
    // token to send -- this is what previously fired /api/auth/me/ (and
    // got a 401) on every load even for a never-logged-in visitor.
    enabled: hasToken,
  })

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiFetch<{ user: User; access: string; refresh: string }>('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    onSuccess: ({ user, access, refresh }) => {
      tokenStorage.set(access, refresh)
      queryClient.setQueryData(meQueryKey, user)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => {
      const refresh = tokenStorage.getRefresh()
      return apiFetch('/api/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh }),
      }).catch(() => {})
    },
    onSuccess: () => {
      tokenStorage.clear()
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
  const status: AuthStatus = !hasToken
    ? 'unauthenticated'
    : meQuery.isPending
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
