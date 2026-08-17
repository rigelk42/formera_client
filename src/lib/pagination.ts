export interface CursorPage<T> {
  next: string | null
  previous: string | null
  results: T[]
}

export function cursorFromUrl(url: string | null): string | null {
  return url ? new URL(url).searchParams.get('cursor') : null
}
