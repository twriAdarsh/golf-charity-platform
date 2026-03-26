import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Auth.css'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
        { email }
      )
      
      setMessage(response.data.message)
      setSubmitted(true)
      setEmail('')
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <h1>📧 Check Your Email</h1>
            <p className="auth-subtitle">Password Reset Link Sent</p>
            
            <div className="success-message">
              <p>If an account exists with that email address, we've sent a password reset link.</p>
              <p>Please check your email (including spam folder) and follow the link to reset your password.</p>
              <p><strong>The link expires in 24 hours.</strong></p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
              style={{ marginTop: '30px' }}
            >
              Back to Login
            </button>

            <p className="auth-link">
              Need help?{' '}
              <a href="mailto:support@golfcharity.app">Contact support</a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>🔐 Forgot Password?</h1>
          <p className="auth-subtitle">Reset Your Password</p>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !email}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
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
