import { ConfigProvider, theme } from 'antd'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { Footer } from './components/Footer'
import { Toolbar } from './components/Toolbar'
import { usePrefersDark } from './lib/usePrefersDark'
import { CustomersPage } from './pages/CustomersPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { OrdersPage } from './pages/OrdersPage'
import { ProductsPage } from './pages/ProductsPage'

function App() {
  const prefersDark = usePrefersDark()
  const accent = prefersDark ? '#47bfff' : '#0774b8'

  return (
    <ConfigProvider
      theme={{
        algorithm: prefersDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: accent,
          borderRadius: 6,
          fontFamily: "'Inter', system-ui, 'Segoe UI', Roboto, sans-serif",
        },
        components: {
          Table: {
            headerBg: accent,
            headerColor: '#fff',
          },
        },
      }}
    >
      <AuthProvider>
        <Toolbar />
        <main className="mx-auto flex w-[1126px] max-w-full flex-1 flex-col box-border border-x border-[var(--border)]">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/products" element={<ProductsPage />} />
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </ConfigProvider>
  )
}

export default App
