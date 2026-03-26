import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import '../styles/pages/Auth.css'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tokenValid, setTokenValid] = useState(true)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid or missing reset link. Please request a new one.')
      setTokenValid(false)
    }
  }, [token, email])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password`,
        {
          token,
          email,
          newPassword
        }
      )

      setSuccess(response.data.message)
      setNewPassword('')
      setConfirmPassword('')

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred. Please try again.')
      if (error.response?.status === 401) {
        setTokenValid(false)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!tokenValid) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <h1>⚠️ Invalid Reset Link</h1>
            <p className="error-message">{error}</p>
            <p style={{ marginTop: '20px', textAlign: 'center' }}>
              The reset link may have expired or is invalid.
            </p>
            <button
              onClick={() => navigate('/forgot-password')}
              className="btn-primary"
              style={{ marginTop: '20px' }}
            >
              Request New Link
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>🔑 Reset Password</h1>
          <p className="auth-subtitle">Create a new password</p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                disabled={isLoading}
                minLength="6"
              />
              <small>At least 6 characters</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
                minLength="6"
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !newPassword || !confirmPassword}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <p className="auth-link">
            Remember your password?{' '}
            <a onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>
              Back to Login
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
