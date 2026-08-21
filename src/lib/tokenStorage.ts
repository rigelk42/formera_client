// Access/refresh tokens live in localStorage rather than httpOnly cookies
// -- see core.auth_views in the backend for why (Firebase Hosting strips
// Cookie on proxied GETs; Safari/WebKit ITP blocks cross-site SameSite=None
// cookies outright). Centralized here so every read/write goes through one
// place instead of scattering localStorage keys across the app.
const ACCESS_KEY = 'formera_access_token'
const REFRESH_KEY = 'formera_refresh_token'

// Listeners let AuthContext react to token changes that happen outside
// React entirely -- e.g. lib/api.ts clearing tokens after a failed silent
// refresh. Without this, hasToken was only ever read once per render and
// a background-triggered clear left the UI showing "authenticated" off
// stale data until something unrelated forced a re-render.
type Listener = () => void
const listeners = new Set<Listener>()
function notify(): void {
  for (const listener of listeners) listener()
}

export const tokenStorage = {
  getAccess: (): string | null => localStorage.getItem(ACCESS_KEY),
  getRefresh: (): string | null => localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh: string): void => {
    localStorage.setItem(ACCESS_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
    notify()
  },
  clear: (): void => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    notify()
  },
  subscribe: (listener: Listener): (() => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
