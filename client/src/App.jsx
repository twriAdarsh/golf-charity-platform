import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
      setCurrentPage('dashboard')
    }
  }, [])

  const handleGetStarted = () => {
    setCurrentPage('login')
  }

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    setCurrentPage('dashboard')
  }

  const handleRegisterSuccess = () => {
    setIsLoggedIn(true)
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentPage('home')
  }

  const handleSwitchToRegister = () => {
    setCurrentPage('register')
  }

  return (
    <div>
      {currentPage === 'home' && <Home onGetStarted={handleGetStarted} />}
      {currentPage === 'login' && (
        <div>
          <Login onLoginSuccess={handleLoginSuccess} />
          <div style={{ textAlign: 'center', marginTop: '20px', color: 'white' }}>
            Don't have an account? <button onClick={handleSwitchToRegister} style={{ background: 'none', color: 'white', textDecoration: 'underline', cursor: 'pointer', border: 'none' }}>Register here</button>
          </div>
        </div>
      )}
      {currentPage === 'register' && (
        <div>
          <Register onRegisterSuccess={handleRegisterSuccess} />
          <div style={{ textAlign: 'center', marginTop: '20px', color: 'white' }}>
            Already have an account? <button onClick={() => setCurrentPage('login')} style={{ background: 'none', color: 'white', textDecoration: 'underline', cursor: 'pointer', border: 'none' }}>Login here</button>
          </div>
        </div>
      )}
      {currentPage === 'dashboard' && <Dashboard onLogout={handleLogout} />}
    </div>
  )
}

export default App
