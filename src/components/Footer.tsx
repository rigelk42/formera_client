export function Footer() {
  return (
    <footer className="sticky bottom-0 z-20 w-full bg-[var(--accent)] px-4 py-1.5 text-center text-sm font-bold text-white">
      v{import.meta.env.VITE_APP_VERSION}
    </footer>
  )
}
