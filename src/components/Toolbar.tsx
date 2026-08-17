import logo from '../assets/formera_logo_1600x704.jpeg'

export function Toolbar() {
  return (
    <header className="flex h-fit items-center border-b border-[var(--border)] px-5 py-4">
      <img src={logo} alt="Formera Research" className="h-[54px] w-auto" />
    </header>
  )
}
