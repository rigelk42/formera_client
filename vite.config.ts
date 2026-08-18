import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8')) as {
  version: string
}
// Setting process.env directly (rather than `define`) so the version
// flows through Vite's own import.meta.env injection, which -- unlike a
// plain `define` global -- reliably reaches client code in dev mode too,
// not just production builds.
process.env.VITE_APP_VERSION = version

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
