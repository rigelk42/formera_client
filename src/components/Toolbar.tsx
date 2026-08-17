import { Link, NavLink } from 'react-router-dom'
import { Avatar, Dropdown } from 'antd'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
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

  return (
    <header className="flex h-fit items-center gap-8 border-b border-[var(--border)] px-5 py-4">
      <Link to="/dashboard">
        <picture>
          <source srcSet={logoWebp} type="image/webp" />
          <img
            src={logoJpg}
            alt="Formera Research"
            width={491}
            height={216}
            className="h-[54px] w-auto"
          />
        </picture>
      </Link>
      {status === 'authenticated' && (
        <>
          <nav className="flex gap-6">
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
              className="ml-auto flex items-center rounded-full"
              aria-label={`Account menu for ${user?.username ?? 'account'}`}
            >
              <Avatar icon={<UserOutlined />} />
            </button>
          </Dropdown>
        </>
      )}
    </header>
  )
}
