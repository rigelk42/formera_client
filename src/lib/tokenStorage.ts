// Access/refresh tokens live in localStorage rather than httpOnly cookies
// -- see core.auth_views in the backend for why (Firebase Hosting strips
// Cookie on proxied GETs; Safari/WebKit ITP blocks cross-site SameSite=None
// cookies outright). Centralized here so every read/write goes through one
// place instead of scattering localStorage keys across the app.
const ACCESS_KEY = 'formera_access_token'
const REFRESH_KEY = 'formera_refresh_token'

export const tokenStorage = {
  getAccess: (): string | null => localStorage.getItem(ACCESS_KEY),
  getRefresh: (): string | null => localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh: string): void => {
    localStorage.setItem(ACCESS_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear: (): void => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}
