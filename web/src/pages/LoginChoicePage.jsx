import { useNavigate } from 'react-router-dom'
import '../styles/pages/LoginChoice.css'

export default function LoginChoicePage() {
  const navigate = useNavigate()

  return (
    <div className="login-choice-container">
      <div className="login-choice-card">
        <h1>Welcome to Golf Charity Platform</h1>
        <p className="subtitle">Choose how you'd like to access the platform</p>

        <div className="choice-buttons">
          <button 
            className="choice-btn user-btn"
            onClick={() => navigate('/login/user')}
          >
            <div className="choice-icon">👤</div>
            <h2>Player Login</h2>
            <p>Track scores, compete in draws, support charities</p>
          </button>

          <button 
            className="choice-btn admin-btn"
            onClick={() => navigate('/login/admin')}
          >
            <div className="choice-icon">🛡️</div>
            <h2>Admin Login</h2>
            <p>Manage users, draws, charities, and analytics</p>
          </button>
        </div>

        <div className="login-footer">
          <p>Don't have an account? <a href="/register">Register as a player</a></p>
        </div>
      </div>
    </div>
  )
}
