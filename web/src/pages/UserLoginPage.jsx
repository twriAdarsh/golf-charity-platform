import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../styles/pages/Auth.css'

export default function UserLoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email,
        password
      })

      // Check if user is admin - prevent admin from logging via player login
      if (response.data.user.role === 'admin') {
        setError('Admin accounts must log in via the Admin portal')
        setLoading(false)
        return
      }

      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      localStorage.setItem('userType', 'player')
      setSuccess('✅ Login successful! Redirecting...')
      
      setTimeout(() => {
        onLogin()
        navigate('/dashboard')
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>⛳ Player Login</h1>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Your password"
            />
            <a href="/forgot-password" style={{ fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>
              Forgot password?
            </a>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <a href="/register">Register here</a>
        </p>

        <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
          <a href="/login" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Back to Login Choice
          </a>
        </div>
      </div>
    </div>
  )
}
