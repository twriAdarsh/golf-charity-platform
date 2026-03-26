import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginChoicePage from './pages/LoginChoicePage'
import UserLoginPage from './pages/UserLoginPage'
import AdminLoginPage from './pages/AdminLoginPage'
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
  const [userType, setUserType] = useState(localStorage.getItem('userType') || 'user')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const type = localStorage.getItem('userType')
    if (token) {
      setIsLoggedIn(true)
      setUserType(type || 'user')
    }
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        
        {/* Login Routes */}
        <Route path="/login" element={isLoggedIn ? <Navigate to={userType === 'admin' ? '/admin' : '/dashboard'} /> : <LoginChoicePage />} />
        <Route path="/login/user" element={isLoggedIn ? <Navigate to="/dashboard" /> : <UserLoginPage onLogin={() => { setIsLoggedIn(true); setUserType('player') }} />} />
        <Route path="/login/admin" element={isLoggedIn ? <Navigate to="/admin" /> : <AdminLoginPage onLogin={() => { setIsLoggedIn(true); setUserType('admin') }} />} />
        
        {/* Auth Routes */}
        <Route path="/register" element={isLoggedIn ? <Navigate to="/dashboard" /> : <RegisterPage onRegister={() => setIsLoggedIn(true)} />} />
        <Route path="/forgot-password" element={isLoggedIn ? <Navigate to="/dashboard" /> : <ForgotPassword />} />
        <Route path="/reset-password" element={isLoggedIn ? <Navigate to="/dashboard" /> : <ResetPassword />} />
        
        {/* Player Routes */}
        <Route 
          path="/dashboard" 
          element={isLoggedIn && userType !== 'admin' ? <DashboardPage /> : <Navigate to="/login/user" />} 
        />
        <Route 
          path="/scores" 
          element={isLoggedIn && userType !== 'admin' ? <ScoresPage /> : <Navigate to="/login/user" />} 
        />
        <Route 
          path="/draws" 
          element={isLoggedIn && userType !== 'admin' ? <DrawsPage /> : <Navigate to="/login/user" />} 
        />
        <Route 
          path="/subscribe" 
          element={isLoggedIn && userType !== 'admin' ? <SubscriptionPage /> : <Navigate to="/login/user" />} 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={isLoggedIn && userType === 'admin' ? <AdminPage /> : <Navigate to="/login/admin" />} 
        />
      </Routes>
    </Router>
  )
}

export default App
