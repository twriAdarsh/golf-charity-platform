import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../styles/pages/Auth.css'

export default function AdminLoginPage({ onLogin }) {
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

      // Check if user is admin - only admins can log in here
      if (response.data.user.role !== 'admin') {
        setError('Only admin accounts can access the admin portal')
        setLoading(false)
        return
      }

      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      localStorage.setItem('userType', 'admin')
      setSuccess('✅ Admin login successful! Redirecting...')
      
      setTimeout(() => {
        onLogin()
        navigate('/admin')
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
      <div className="auth-card" style={{ borderLeft: '4px solid #3b82f6' }}>
        <h1 style={{ color: '#1e293b' }}>🛡️ Admin Portal</h1>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '30px', fontSize: '0.95rem' }}>
          Admin access only
        </p>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Admin password"
            />
            <a href="/forgot-password" style={{ fontSize: '0.85rem', marginTop: '5px', display: 'block', color: '#667eea' }}>
              Forgot password?
            </a>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
            {loading ? 'Logging in...' : 'Admin Login'}
          </button>
        </form>

        <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
          <a href="/login" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Back to Login Choice
          </a>
        </div>
      </div>
    </div>
  )
}
