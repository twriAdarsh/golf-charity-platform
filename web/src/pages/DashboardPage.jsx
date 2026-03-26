import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Loading from '../components/Loading'
import '../styles/pages/Dashboard.css'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [scores, setScores] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('home')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userType = localStorage.getItem('userType')
    const userStr = localStorage.getItem('user')

    // If no token, redirect to player login
    if (!token) {
      navigate('/login/user')
      return
    }

    // If user is admin, redirect to admin dashboard
    if (userType === 'admin' || (userStr && JSON.parse(userStr).role === 'admin')) {
      navigate('/admin')
      return
    }

    fetchDashboardData()
  }, [navigate])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      
      if (!token) {
        navigate('/login')
        return
      }

      setUser(JSON.parse(userStr))

      // Fetch scores
      const scoresResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/scores`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setScores(scoresResponse.data)

      // Fetch subscriptions
      const subResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/subscriptions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setSubscriptions(subResponse.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    navigate('/login')
  }

  if (loading) return <Loading fullscreen={true} text="Loading your dashboard..." />

  return (
    <div className="dashboard-sidebar-layout">
      <header className="dashboard-header">
        <div className="container">
          <h1>🏌️ Golf Charity Dashboard</h1>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <div className="dashboard-container">
        {/* SIDEBAR */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-brand">
            <h3>Player Menu</h3>
          </div>
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              🏠 Home
            </button>
            <button 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              👤 Profile
            </button>
            <button 
              className={`nav-item ${activeTab === 'subscription' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscription')}
            >
              💳 Subscription
            </button>
            <button 
              className={`nav-item ${activeTab === 'charities' ? 'active' : ''}`}
              onClick={() => setActiveTab('charities')}
            >
              🏛️ View Charities
            </button>
            <button 
              className={`nav-item ${activeTab === 'draws' ? 'active' : ''}`}
              onClick={() => setActiveTab('draws')}
            >
              🎯 Monthly Draws
            </button>
            <button 
              className={`nav-item ${activeTab === 'scores' ? 'active' : ''}`}
              onClick={() => setActiveTab('scores')}
            >
              📊 Recent Scores
            </button>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="dashboard-main">
          {user && (
            <>
              {/* HOME / HERO SECTION */}
              {activeTab === 'home' && (
                <div className="hero-section">
                  <div className="hero-content">
                    <h2>Welcome, {user.fullName}! ⛳</h2>
                    <p className="hero-slogan">
                      "Every swing counts. Every donation matters. <br />
                      Join the movement where golf meets charity!"
                    </p>
                    <div className="hero-stats">
                      <div className="stat-card">
                        <span className="stat-number">{scores.length}</span>
                        <span className="stat-label">Scores Recorded</span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-number">{subscriptions.length}</span>
                        <span className="stat-label">Active Subscriptions</span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-number">∞</span>
                        <span className="stat-label">Charity Impact</span>
                      </div>
                    </div>
                    <div className="hero-actions">
                      <button className="btn-primary-large" onClick={() => setActiveTab('charities')}>
                        Explore Charities 🏛️
                      </button>
                      <button className="btn-secondary-large" onClick={() => setActiveTab('scores')}>
                        Add Your Score 📊
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PROFILE SECTION */}
              {activeTab === 'profile' && (
                <div className="content-section">
                  <h2>👤 Your Profile</h2>
                  <div className="profile-card">
                    <div className="profile-field">
                      <label>Full Name</label>
                      <p>{user.fullName}</p>
                    </div>
                    <div className="profile-field">
                      <label>Email Address</label>
                      <p>{user.email}</p>
                    </div>
                    <div className="profile-field">
                      <label>Member Since</label>
                      <p>{new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="profile-field">
                      <label>Account Status</label>
                      <p>🟢 Active</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBSCRIPTION SECTION */}
              {activeTab === 'subscription' && (
                <div className="content-section">
                  <h2>💳 Subscription Status</h2>
                  {subscriptions.length > 0 ? (
                    <div className="subscription-card">
                      <p><strong>Status:</strong> {subscriptions[0].status}</p>
                      <p><strong>Plan:</strong> {subscriptions[0].plan_type || 'Premium'}</p>
                      <button className="btn-primary" onClick={() => navigate('/subscribe')}>
                        Manage Subscription
                      </button>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>No active subscription yet</p>
                      <button className="btn-primary" onClick={() => setActiveTab('subscription')}>
                        Subscribe Now
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* CHARITIES SECTION */}
              {activeTab === 'charities' && (
                <div className="content-section">
                  <h2>🏛️ Supported Charities</h2>
                  <p>Browse and select your favorite charities to support through your subscription.</p>
                  <button className="btn-primary" onClick={() => navigate('/subscribe')}>
                    View All Charities →
                  </button>
                </div>
              )}

              {/* DRAWS SECTION */}
              {activeTab === 'draws' && (
                <div className="content-section">
                  <h2>🎯 Monthly Draws</h2>
                  <p>Check your draw status and see if you've won!</p>
                  <button className="btn-primary" onClick={() => navigate('/draws')}>
                    View Draws →
                  </button>
                </div>
              )}

              {/* SCORES SECTION */}
              {activeTab === 'scores' && (
                <div className="content-section">
                  <h2>📊 Recent Scores</h2>
                  {scores.length > 0 ? (
                    <>
                      <div className="scores-list-container">
                        {scores.slice(0, 5).map(score => (
                          <div key={score.id} className="score-item">
                            <span className="score-value">{score.score}</span>
                            <span className="score-date">{new Date(score.score_date).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                      <button className="btn-primary" onClick={() => navigate('/scores')}>
                        View All Scores →
                      </button>
                    </>
                  ) : (
                    <div className="empty-state">
                      <p>No scores recorded yet</p>
                      <button className="btn-primary" onClick={() => navigate('/scores')}>
                        Enter Your First Score →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
