import { useCallback, useSyncExternalStore, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import { tokenStorage } from '../lib/tokenStorage'
import { AuthContext, meQueryKey, type AuthStatus, type User } from './context'

function getHasToken(): boolean {
  return !!tokenStorage.getAccess()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  // Subscribed rather than read once per render: a login/logout mutation's
  // onSuccess triggers a re-render anyway, but a background token clear
  // from lib/api.ts (a failed silent refresh) happens outside React and
  // needs its own signal to flip this, or the UI keeps showing
  // "authenticated" off stale data until something unrelated re-renders.
  const hasToken = useSyncExternalStore(tokenStorage.subscribe, getHasToken)

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

  // Gate on hasToken, not just meQuery.enabled: after a background token
  // clear, the query is now disabled but its cached data from before the
  // clear is still sitting there until something refetches over it.
  const user = hasToken ? (meQuery.data ?? null) : null
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
