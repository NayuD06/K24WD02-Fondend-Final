import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import './authPages.css'

export const RegisterPage = () => {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        window.setTimeout(resolve, 760)
      })

      register({ name, email, password })
      navigate('/app', { replace: true })
    } catch (submitError) {
      setError(submitError.message)
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel auth-form-panel">
        <p className="auth-eyebrow">PixelDepot</p>
        <h1>Tao tai khoan</h1>

        <form className="auth-form" onSubmit={onSubmit}>
          <label htmlFor="register-name">Ho ten</label>
          <input
            id="register-name"
            type="text"
            required
            disabled={isSubmitting}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ten cua ban"
          />

          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            required
            disabled={isSubmitting}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ban@email.com"
          />

          <label htmlFor="register-password">Mat khau</label>
          <input
            id="register-password"
            type="password"
            required
            minLength={6}
            disabled={isSubmitting}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Toi thieu 6 ky tu"
          />

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="auth-btn primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                Dang tao <span className="loading-dots" aria-hidden="true"></span>
              </>
            ) : (
              'Tao tai khoan'
            )}
          </button>
        </form>

        <p className="auth-footnote">
          Da co tai khoan? <Link to="/login">Dang nhap</Link>
        </p>
      </section>
    </main>
  )
}
