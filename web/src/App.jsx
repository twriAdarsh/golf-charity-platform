import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import SubscriptionPage from './pages/SubscriptionPage'
import ScoresPage from './pages/ScoresPage'
import DrawsPage from './pages/DrawsPage'
import './styles/App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))
  const [userRole, setUserRole] = useState('user')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
    }
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <LoginPage onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/register" element={isLoggedIn ? <Navigate to="/dashboard" /> : <RegisterPage onRegister={() => setIsLoggedIn(true)} />} />
        <Route path="/forgot-password" element={isLoggedIn ? <Navigate to="/dashboard" /> : <ForgotPassword />} />
        <Route path="/reset-password" element={isLoggedIn ? <Navigate to="/dashboard" /> : <ResetPassword />} />
        <Route 
          path="/dashboard" 
          element={isLoggedIn ? <DashboardPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/scores" 
          element={isLoggedIn ? <ScoresPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/draws" 
          element={isLoggedIn ? <DrawsPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/subscribe" 
          element={isLoggedIn ? <SubscriptionPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/admin" 
          element={isLoggedIn ? <AdminPage /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  )
}

export default App
