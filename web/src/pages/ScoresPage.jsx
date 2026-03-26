import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../styles/pages/Dashboard.css'

export default function ScoresPage() {
  const [scores, setScores] = useState([])
  const [newScore, setNewScore] = useState('')
  const [scoreDate, setScoreDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userType = localStorage.getItem('userType')
    const userStr = localStorage.getItem('user')

    // If no token or not player, redirect
    if (!token || userType === 'admin') {
      navigate('/login/user')
      return
    }

    // If user is admin, redirect to admin dashboard
    if (userStr) {
      const userData = JSON.parse(userStr)
      if (userData.role === 'admin') {
        navigate('/admin')
        return
      }
    }

    fetchScores()
  }, [])

  const fetchScores = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login/user')
        return
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/scores`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setScores(response.data || [])
    } catch (error) {
      console.error('Error fetching scores:', error)
      setError('Failed to load scores')
    } finally {
      setLoading(false)
    }
  }

  const handleAddScore = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    const score = parseInt(newScore)
    if (!score || score < 1 || score > 45) {
      setError('Score must be between 1 and 45 (Stableford format)')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/scores`,
        {
          score,
          score_date: scoreDate
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )

      // Add to list (keep only last 5)
      const updatedScores = [response.data, ...scores].slice(0, 5)
      setScores(updatedScores)
      setNewScore('')
      setScoreDate(new Date().toISOString().split('T')[0])
    } catch (error) {
      console.error('Error adding score:', error)
      setError(error.response?.data?.error || 'Failed to add score')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    navigate('/login/user')
  }

  if (loading) return <div className="dashboard">Loading scores...</div>

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <h1>📊 My Golf Scores</h1>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <div className="container">
        {/* Add Score Form */}
        <section className="dashboard-card">
          <h2>Add Your Latest Score</h2>
          <p>Enter your Stableford score (1-45 points)</p>
          
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleAddScore} className="score-form">
            <div className="form-group">
              <label htmlFor="score">Stableford Score</label>
              <input
                id="score"
                type="number"
                min="1"
                max="45"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                placeholder="Enter score (1-45)"
                required
              />
              <small>Points in Stableford golf format</small>
            </div>

            <div className="form-group">
              <label htmlFor="scoreDate">Score Date</label>
              <input
                id="scoreDate"
                type="date"
                value={scoreDate}
                onChange={(e) => setScoreDate(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Adding...' : 'Add Score'}
            </button>
          </form>
        </section>

        {/* Score History */}
        <section className="dashboard-card">
          <h2>Score History (Last 5)</h2>
          <p className="info-text">Your latest 5 scores are used for monthly draws</p>

          {scores.length > 0 ? (
            <div className="scores-history">
              {scores.map((score, index) => (
                <div key={score.id} className="score-item">
                  <div className="score-rank">#{index + 1}</div>
                  <div className="score-details">
                    <div className="score-points">{score.score} pts</div>
                    <div className="score-date">
                      {new Date(score.score_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No scores yet. Add your first score above!</p>
          )}
        </section>

        {/* Stableford Guide */}
        <section className="dashboard-card">
          <h2>ℹ️ Stableford Scoring Guide</h2>
          <div className="stableford-guide">
            <div className="guide-item">
              <span className="score-range">45</span>
              <span className="description">Eagle or Better (Albatross, Eagle)</span>
            </div>
            <div className="guide-item">
              <span className="score-range">35-44</span>
              <span className="description">Birdie</span>
            </div>
            <div className="guide-item">
              <span className="score-range">25-34</span>
              <span className="description">Par</span>
            </div>
            <div className="guide-item">
              <span className="score-range">15-24</span>
              <span className="description">Bogey</span>
            </div>
            <div className="guide-item">
              <span className="score-range">1-14</span>
              <span className="description">Double Bogey or Worse</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
