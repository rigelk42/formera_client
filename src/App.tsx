import { ConfigProvider, theme } from 'antd'
import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { Toolbar } from './components/Toolbar'
import { usePrefersDark } from './lib/usePrefersDark'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'

function App() {
  const prefersDark = usePrefersDark()

  return (
    <ConfigProvider
      theme={{
        algorithm: prefersDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: prefersDark ? '#47bfff' : '#0774b8',
          borderRadius: 6,
          fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
        },
      }}
    >
      <AuthProvider>
        <Toolbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ConfigProvider>
  )
}

export default App
