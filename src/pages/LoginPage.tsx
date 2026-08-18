import { useState } from 'react'
import { Navigate, useLocation, useNavigate, type Location } from 'react-router-dom'
import { Alert, Button, Form, Input } from 'antd'
import { useAuth } from '../auth/useAuth'
import { ApiError } from '../lib/api'

function fromPath(location: Location): string {
  return (location.state as { from?: Location })?.from?.pathname ?? '/dashboard'
}

interface LoginFormValues {
  email: string
  password: string
}

export function LoginPage() {
  const { status, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (status === 'authenticated') {
    return <Navigate to={fromPath(location)} replace />
  }

  const handleFinish = async ({ email, password }: LoginFormValues) => {
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(fromPath(location), { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="flex grow flex-col place-content-center place-items-center px-5 py-8">
      <div className="w-full max-w-sm">
        <h1 className="mb-6! text-center text-2xl! font-medium text-[var(--accent)]">
          Sign in
        </h1>
        <Form layout="vertical" requiredMark={false} onFinish={handleFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Enter a valid email address' },
            ]}
          >
            <Input type="email" autoComplete="email" size="large" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password autoComplete="current-password" size="large" />
          </Form.Item>
          {error && (
            <Form.Item>
              <Alert type="error" message={error} showIcon />
            </Form.Item>
          )}
          <Form.Item className="mb-0!">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={submitting}
              block
            >
              Sign in
            </Button>
          </Form.Item>
        </Form>
      </div>
    </section>
  )
}
