import { lazy, Suspense } from 'react'
import { ConfigProvider, Spin, theme } from 'antd'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { Footer } from './components/Footer'
import { Toolbar } from './components/Toolbar'
import { usePrefersDark } from './lib/usePrefersDark'

const CustomersPage = lazy(() =>
  import('./pages/CustomersPage').then((m) => ({ default: m.CustomersPage })),
)
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const OrdersPage = lazy(() =>
  import('./pages/OrdersPage').then((m) => ({ default: m.OrdersPage })),
)
const ProductsPage = lazy(() =>
  import('./pages/ProductsPage').then((m) => ({ default: m.ProductsPage })),
)

function PageFallback() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Spin size="large" />
    </div>
  )
}

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
          <Suspense fallback={<PageFallback />}>
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
          </Suspense>
        </main>
        <Footer />
      </AuthProvider>
    </ConfigProvider>
  )
}

export default App
