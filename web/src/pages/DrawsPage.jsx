import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../styles/pages/Dashboard.css'

export default function DrawsPage() {
  const [draws, setDraws] = useState([])
  const [userScores, setUserScores] = useState([])
  const [winners, setWinners] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('current')
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

    fetchDrawsAndScores()
  }, [])

  const fetchDrawsAndScores = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login/user')
        return
      }

      // Fetch draws
      const drawsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/draws`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setDraws(drawsResponse.data || [])

      // Fetch user scores
      const scoresResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/scores`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setUserScores(scoresResponse.data || [])

      // Fetch winners
      const winnersResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/winners`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setWinners(winnersResponse.data || [])
    } catch (error) {
      console.error('Error fetching draws:', error)
    } finally {
      setLoading(false)
    }
  }

  const parseDrawNumbers = (numberString) => {
    try {
      return numberString?.split(',').map(n => parseInt(n.trim())) || []
    } catch {
      return []
    }
  }

  const getMatchedNumbers = (drawNumbers) => {
    const userScoreList = userScores.slice(0, 5).map(s => s.score)
    return drawNumbers.filter(n => userScoreList.includes(n))
  }

  const getCurrentDraw = () => {
    return draws.find(d => d.status === 'published') || draws[0]
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    navigate('/login/user')
  }

  const currentDraw = getCurrentDraw()

  if (loading) return <div className="dashboard">Loading draws...</div>

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <h1>🎰 Monthly Draws</h1>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <div className="container">
        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'current' ? 'active' : ''}`}
            onClick={() => setActiveTab('current')}
          >
            Current Draw
          </button>
          <button 
            className={`tab ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            Results & Winners
          </button>
        </div>

        {/* Current Draw */}
        {activeTab === 'current' && (
          <>
            {currentDraw ? (
              <>
                {/* Draw Numbers */}
                <section className="dashboard-card">
                  <h2>📅 {new Date(currentDraw.draw_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Draw</h2>
                  <p className="status-badge" style={{ color: currentDraw.status === 'published' ? '#10b981' : '#f59e0b' }}>
                    Status: {currentDraw.status.toUpperCase()}
                  </p>

                  <div className="draw-numbers-container">
                    <h3>Draw Numbers</h3>
                    <div className="draw-numbers">
                      {parseDrawNumbers(currentDraw.draw_numbers).map(num => (
                        <div key={num} className="draw-number">{num}</div>
                      ))}
                    </div>
                  </div>

                  <div className="draw-info-grid">
                    <div className="info-box">
                      <h4>Draw Type</h4>
                      <p>{currentDraw.draw_type}</p>
                    </div>
                    <div className="info-box">
                      <h4>Algorithm</h4>
                      <p>{currentDraw.algorithm_type}</p>
                    </div>
                    <div className="info-box">
                      <h4>Subscribers</h4>
                      <p>{currentDraw.total_subscribers}</p>
                    </div>
                  </div>
                </section>

                {/* Your Scores */}
                <section className="dashboard-card">
                  <h2>Your Scores (Last 5)</h2>
                  {userScores.length > 0 ? (
                    <>
                      <div className="user-scores">
                        {userScores.slice(0, 5).map((score, index) => {
                          const drawNumbers = parseDrawNumbers(currentDraw.draw_numbers)
                          const isMatched = drawNumbers.includes(score.score)
                          return (
                            <div key={score.id} className={`score-box ${isMatched ? 'matched' : ''}`}>
                              <span className="score-position">#{index + 1}</span>
                              <div className="score-value">{score.score}</div>
                              {isMatched && <span className="match-badge">✓ Match!</span>}
                            </div>
                          )
                        })}
                      </div>
                      
                      {currentDraw.draw_numbers && (
                        <div className="match-summary">
                          <strong>Matches: {getMatchedNumbers(parseDrawNumbers(currentDraw.draw_numbers)).length} / 5</strong>
                        </div>
                      )}
                    </>
                  ) : (
                    <p>No scores yet. <button onClick={() => navigate('/scores')} className="link-button">Enter your scores</button></p>
                  )}
                </section>

                {/* Prize Distribution */}
                <section className="dashboard-card">
                  <h2>💰 Prize Distribution</h2>
                  <div className="prize-distribution">
                    <div className="prize-tier">
                      <div className="tier-title">5 Matches</div>
                      <div className="tier-percentage">40%</div>
                      <div className="tier-icon">🏆</div>
                    </div>
                    <div className="prize-tier">
                      <div className="tier-title">4 Matches</div>
                      <div className="tier-percentage">35%</div>
                      <div className="tier-icon">🥈</div>
                    </div>
                    <div className="prize-tier">
                      <div className="tier-title">3 Matches</div>
                      <div className="tier-percentage">25%</div>
                      <div className="tier-icon">🥉</div>
                    </div>
                  </div>
                </section>
              </>
            ) : (
              <section className="dashboard-card">
                <p className="empty-state">No draws scheduled yet. Check back soon!</p>
              </section>
            )}
          </>
        )}

        {/* Results & Winners */}
        {activeTab === 'results' && (
          <section className="dashboard-card">
            <h2>Recent Winners</h2>
            {winners.length > 0 ? (
              <div className="winners-list">
                {winners.map(winner => (
                  <div key={winner.id} className="winner-item">
                    <div className="winner-info">
                      <h4>{winner.match_type} Matches</h4>
                      <p>Prize: ${(winner.prize_amount_cents / 100).toFixed(2)}</p>
                    </div>
                    <div className="winner-status">
                      <span className={`status-badge status-${winner.verification_status}`}>
                        {winner.verification_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No winners yet. Play to win!</p>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
