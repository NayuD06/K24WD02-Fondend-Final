import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import './authPages.css'

export const LoginPage = () => {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = location.state?.from || '/app'

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  const onSubmit = async (event) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 700)
      })

      login({ email, password })
      navigate(redirectTo, { replace: true })
    } catch (submitError) {
      setError(submitError.message)
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel auth-form-panel">
        <p className="auth-eyebrow">PixelDepot</p>
        <h1>Dang nhap</h1>

        <form className="auth-form" onSubmit={onSubmit}>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            required
            disabled={isSubmitting}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ban@email.com"
          />

          <label htmlFor="login-password">Mat khau</label>
          <input
            id="login-password"
            type="password"
            required
            disabled={isSubmitting}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Nhap mat khau"
          />

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="auth-btn primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                Dang nhap <span className="loading-dots" aria-hidden="true"></span>
              </>
            ) : (
              'Dang nhap'
            )}
          </button>
        </form>

        <p className="auth-footnote">
          Chua co tai khoan? <Link to="/register">Dang ky ngay</Link>
        </p>
      </section>
    </main>
  )
}
