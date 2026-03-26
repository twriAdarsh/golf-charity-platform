import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../styles/pages/Dashboard.css'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [scores, setScores] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

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
    navigate('/')
  }

  if (loading) return <div className="dashboard">Loading...</div>

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <h1>Dashboard</h1>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <div className="container">
        {user && (
          <div className="dashboard-grid">
            <section className="dashboard-card">
              <h2>Profile</h2>
              <p><strong>Name:</strong> {user.fullName}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </section>

            <section className="dashboard-card">
              <h2>Subscription</h2>
              {subscriptions.length > 0 ? (
                <p><strong>Status:</strong> {subscriptions[0].status}</p>
              ) : (
                <button className="btn-primary" onClick={() => navigate('/subscribe')}>
                  Subscribe Now
                </button>
              )}
            </section>

            <section className="dashboard-card">
              <h2>🔧 Administration</h2>
              <p>Manage platform, users, draws, and winners</p>
              <button className="btn-primary" onClick={() => navigate('/admin')}>
                Admin Dashboard →
              </button>
            </section>

            <section className="dashboard-card">
              <h2>View Charities</h2>
              <p>Browse all supported charities and select one</p>
              <button className="btn-primary" onClick={() => navigate('/subscribe')}>
                View All Charities →
              </button>
            </section>

            <section className="dashboard-card">
              <h2>Monthly Draws</h2>
              <p>Check your draw status and see if you won!</p>
              <button className="btn-primary" onClick={() => navigate('/draws')}>
                View Draws →
              </button>
            </section>

            <section className="dashboard-card">
              <h2>Recent Scores</h2>
              {scores.length > 0 ? (
                <>
                  <ul className="scores-list">
                    {scores.slice(0, 3).map(score => (
                      <li key={score.id}>
                        Score: {score.score} - {new Date(score.score_date).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                  <button className="btn-primary" onClick={() => navigate('/scores')}>
                    View All Scores →
                  </button>
                </>
              ) : (
                <button className="btn-primary" onClick={() => navigate('/scores')}>
                  Enter Your First Score →
                </button>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
