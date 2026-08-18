import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Avatar, Drawer, Dropdown } from 'antd'
import { LogoutOutlined, MenuOutlined, UserOutlined } from '@ant-design/icons'
import { useAuth } from '../auth/useAuth'
import logoWebp from '../assets/formera-logo.webp'
import logoJpg from '../assets/formera-logo.jpg'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/customers', label: 'Customers' },
  { to: '/orders', label: 'Orders' },
  { to: '/products', label: 'Products' },
]

export function Toolbar() {
  const { status, user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="flex h-fit items-center gap-4 border-b border-[var(--border)] px-5 py-4 md:gap-8">
      <Link to="/dashboard">
        <picture>
          <source srcSet={logoWebp} type="image/webp" />
          <img
            src={logoJpg}
            alt="Formera Research"
            width={491}
            height={216}
            className="h-[40px] w-auto md:h-[54px]"
          />
        </picture>
      </Link>
      {status === 'authenticated' && (
        <>
          <nav className="hidden gap-6 md:flex">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? 'text-[var(--text-h)]' : 'text-[var(--text)]'} hover:text-[var(--text-h)]`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto hidden md:block">
            <Dropdown
              trigger={['click']}
              placement="bottomRight"
              menu={{
                items: [{ key: 'logout', label: 'Log out', icon: <LogoutOutlined /> }],
                onClick: ({ key }) => {
                  if (key === 'logout') void logout()
                },
              }}
            >
              <button
                type="button"
                className="flex items-center rounded-full"
                aria-label={`Account menu for ${user?.username ?? 'account'}`}
              >
                <Avatar icon={<UserOutlined />} />
              </button>
            </Dropdown>
          </div>

          <button
            type="button"
            className="ml-auto flex items-center justify-center p-1 text-xl text-[var(--text-h)] md:hidden"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <MenuOutlined />
          </button>

          <Drawer
            title="Menu"
            placement="right"
            width={260}
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
          >
            <nav className="flex flex-col gap-5">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-base font-medium ${isActive ? 'text-[var(--text-h)]' : 'text-[var(--text)]'}`
                  }
                >
                  {label}
                </NavLink>
              ))}
              <button
                type="button"
                className="mt-2 flex items-center gap-2 text-base font-medium text-[var(--text)]"
                onClick={() => {
                  setMenuOpen(false)
                  void logout()
                }}
              >
                <LogoutOutlined />
                Log out
              </button>
            </nav>
          </Drawer>
        </>
      )}
    </header>
  )
}
