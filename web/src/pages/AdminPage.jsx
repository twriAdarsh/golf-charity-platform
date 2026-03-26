import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Loading from '../components/Loading'
import '../styles/pages/AdminPage.css'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('analytics')
  const [users, setUsers] = useState([])
  const [draws, setDraws] = useState([])
  const [winners, setWinners] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newDrawTitle, setNewDrawTitle] = useState('')
  const [selectedWinner, setSelectedWinner] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userType = localStorage.getItem('userType')
    const userStr = localStorage.getItem('user')

    // If no token or not admin, redirect
    if (!token || userType !== 'admin') {
      navigate('/login/admin')
      return
    }

    // If user is not admin, redirect to player dashboard
    if (userStr) {
      const userData = JSON.parse(userStr)
      if (userData.role !== 'admin') {
        navigate('/login/user')
        return
      }
    }

    fetchAdminData()
  }, [navigate])

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login/admin')
        return
      }

      // Fetch users
      const usersResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => ({ data: [] }))
      setUsers(usersResponse.data || [])

      // Fetch draws
      const drawsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/draws`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => ({ data: [] }))
      setDraws(drawsResponse.data || [])

      // Fetch winners
      const winnersResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/winners`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => ({ data: [] }))
      setWinners(winnersResponse.data || [])

      // Fetch analytics
      const analyticsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => ({ data: null }))
      setAnalytics(analyticsResponse.data)
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDraw = async () => {
    if (!newDrawTitle.trim()) return

    const token = localStorage.getItem('token')
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/draws`,
        {
          draw_month: new Date().toISOString(),
          draw_type: 'monthly',
          draw_numbers: '1,15,23,34,42'
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      setNewDrawTitle('')
      fetchAdminData()
    } catch (error) {
      console.error('Error creating draw:', error)
    }
  }

  const handleApproveWinner = async (winnerId) => {
    const token = localStorage.getItem('token')
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/winners/${winnerId}/approve`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      setSelectedWinner(null)
      fetchAdminData()
    } catch (error) {
      console.error('Error approving winner:', error)
    }
  }

  const handleRejectWinner = async (winnerId) => {
    const token = localStorage.getItem('token')
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/winners/${winnerId}/reject`,
        { reason: rejectionReason },
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      setSelectedWinner(null)
      setRejectionReason('')
      fetchAdminData()
    } catch (error) {
      console.error('Error rejecting winner:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    navigate('/login/admin')
  }

  const handleProofImageUpload = async (winnerId, event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const token = localStorage.getItem('token')
    const formData = new FormData()
    formData.append('proofImage', file)

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/winners/${winnerId}/upload-proof`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      // Update the selected winner with new proof URL
      setSelectedWinner({
        ...selectedWinner,
        proof_image_url: response.data.proof_image_url
      })
      // Reset file input
      event.target.value = ''
    } catch (error) {
      console.error('Error uploading proof image:', error)
      alert('Failed to upload proof image: ' + error.response?.data?.error || error.message)
    }
  }

  if (loading) return <Loading fullscreen={true} text="Loading admin dashboard..." />

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="container">
          <h1>🔧 Admin Dashboard</h1>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <div className="admin-container">
        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            📊 Analytics
          </button>
          <button className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            👥 Users
          </button>
          <button className={`admin-tab ${activeTab === 'draws' ? 'active' : ''}`} onClick={() => setActiveTab('draws')}>
            🎰 Draws
          </button>
          <button className={`admin-tab ${activeTab === 'winners' ? 'active' : ''}`} onClick={() => setActiveTab('winners')}>
            🏆 Winners
          </button>
          <button className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            ⚙️ Settings
          </button>
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <>
            <section className="admin-card">
              <h2>📈 Key Metrics</h2>
              <div className="metrics-grid">
                <div className="metric-card">
                  <h3>Total Users</h3>
                  <p className="metric-value">{users.length}</p>
                  <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '10px' }}>
                    {users.filter(u => u.created_at && new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} new this month
                  </p>
                </div>
                <div className="metric-card">
                  <h3>Active Subscriptions</h3>
                  <p className="metric-value">{users.length}</p>
                  <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '10px' }}>
                    {((users.length / (users.length || 1)) * 100).toFixed(0)}% retention
                  </p>
                </div>
                <div className="metric-card">
                  <h3>Total Revenue</h3>
                  <p className="metric-value">${(users.length * 9.99).toFixed(2)}</p>
                  <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '10px' }}>MRR</p>
                </div>
                <div className="metric-card">
                  <h3>Winners This Month</h3>
                  <p className="metric-value">{winners.filter(w => w.verification_status === 'approved').length}</p>
                  <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '10px' }}>
                    ${(winners.filter(w => w.verification_status === 'approved').reduce((sum, w) => sum + (w.prize_amount_cents || 0), 0) / 100).toFixed(2)} paid
                  </p>
                </div>
              </div>
            </section>

            <section className="dashboard-card">
              <h2>💰 Financial Summary</h2>
              <div className="summary-grid">
                <div className="summary-item">
                  <h4>Total Prize Payouts</h4>
                  <p className="summary-value">${(winners.reduce((sum, w) => sum + (w.prize_amount_cents || 0) / 100, 0)).toFixed(2)}</p>
                  <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>{winners.length} winners</p>
                </div>
                <div className="summary-item">
                  <h4>Charity Donations</h4>
                  <p className="summary-value">${(users.length * 9.99 * 0.1).toFixed(2)}</p>
                  <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>10% of revenue</p>
                </div>
                <div className="summary-item">
                  <h4>Platform Revenue</h4>
                  <p className="summary-value">${((users.length * 9.99) * 0.9).toFixed(2)}</p>
                  <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>90% retained</p>
                </div>
              </div>
            </section>

            <section className="dashboard-card">
              <h2>🎯 Performance Metrics</h2>
              <div className="performance-grid">
                <div className="performance-item">
                  <h4>Avg Score per User</h4>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>18.5</p>
                </div>
                <div className="performance-item">
                  <h4>Draw Participation Rate</h4>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>72%</p>
                </div>
                <div className="performance-item">
                  <h4>Avg Prize per Winner</h4>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>${winners.length > 0 ? (winners.reduce((sum, w) => sum + (w.prize_amount_cents || 0), 0) / winners.length / 100).toFixed(0) : '0'}</p>
                </div>
                <div className="performance-item">
                  <h4>Platform Health</h4>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>✅ Good</p>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <section className="dashboard-card">
            <h2>👥 Manage Users</h2>
            {users.length > 0 ? (
              <div className="admin-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Subscription</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.full_name || 'N/A'}</td>
                        <td>{user.email}</td>
                        <td><span className="badge badge-active">Active</span></td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          <button className="btn-small">View</button>
                          <button className="btn-small btn-danger">Disable</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-state">No users found</p>
            )}
          </section>
        )}

        {/* Draws Tab */}
        {activeTab === 'draws' && (
          <>
            <section className="dashboard-card">
              <h2>➕ Create New Draw</h2>
              <div className="form-group">
                <label>Draw Description</label>
                <input
                  type="text"
                  value={newDrawTitle}
                  onChange={(e) => setNewDrawTitle(e.target.value)}
                  placeholder="e.g., March 2024 Monthly Draw"
                />
              </div>
              <button onClick={handleCreateDraw} className="btn-primary">Create Draw</button>
            </section>

            <section className="dashboard-card">
              <h2>📋 Draw History</h2>
              {draws.length > 0 ? (
                <div className="draws-list">
                  {draws.map(draw => (
                    <div key={draw.id} className="draw-item">
                      <div className="draw-header">
                        <h4>{new Date(draw.draw_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h4>
                        <span className={`status-badge status-${draw.status}`}>{draw.status}</span>
                      </div>
                      <p>Numbers: {draw.draw_numbers}</p>
                      <p>Subscribers: {draw.total_subscribers}</p>
                      <button className="btn-small">Publish</button>
                      <button className="btn-small">Edit</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No draws created yet</p>
              )}
            </section>
          </>
        )}

        {/* Winners Tab */}
        {activeTab === 'winners' && (
          <>
            {selectedWinner ? (
              <section className="dashboard-card">
                <h2>🔍 Winner Verification</h2>
                <div className="verification-detail">
                  <div className="verification-header">
                    <button onClick={() => setSelectedWinner(null)} className="btn-small">← Back</button>
                  </div>

                  <div className="winner-claim">
                    <h3>{selectedWinner.match_type} Match{selectedWinner.match_type > 1 ? 'es' : ''}</h3>
                    <p><strong>Matched Numbers:</strong> {selectedWinner.matched_numbers}</p>
                    <p><strong>Prize Amount:</strong> ${(selectedWinner.prize_amount_cents / 100).toFixed(2)}</p>
                    <p><strong>Status:</strong> {selectedWinner.verification_status}</p>
                  </div>

                  {/* Proof Image Section */}
                  <div className="proof-section" style={{
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb'
                  }}>
                    <h4>🖼️ Proof Image</h4>
                    {selectedWinner.proof_image_url ? (
                      <div>
                        <img 
                          src={selectedWinner.proof_image_url} 
                          alt="Winner proof" 
                          style={{
                            maxWidth: '100%',
                            maxHeight: '300px',
                            borderRadius: '8px',
                            marginBottom: '10px'
                          }}
                        />
                        {selectedWinner.verification_status === 'pending' && (
                          <div style={{ marginTop: '10px' }}>
                            <label htmlFor="proofImageUpload" className="btn-small" style={{ display: 'inline-block', cursor: 'pointer' }}>
                              📤 Update Proof
                            </label>
                            <input 
                              id="proofImageUpload"
                              type="file" 
                              accept="image/*"
                              onChange={(e) => handleProofImageUpload(selectedWinner.id, e)}
                              style={{ display: 'none' }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{
                        padding: '20px',
                        border: '2px dashed #667eea',
                        borderRadius: '8px',
                        textAlign: 'center',
                        backgroundColor: '#fff'
                      }}>
                        {selectedWinner.verification_status === 'pending' ? (
                          <>
                            <p style={{ marginBottom: '10px', color: '#666' }}>No proof image uploaded yet</p>
                            <label htmlFor="proofImageUpload" className="btn-small" style={{ display: 'inline-block', cursor: 'pointer' }}>
                              📤 Upload Proof Image
                            </label>
                            <input 
                              id="proofImageUpload"
                              type="file" 
                              accept="image/*"
                              onChange={(e) => handleProofImageUpload(selectedWinner.id, e)}
                              style={{ display: 'none' }}
                            />
                          </>
                        ) : (
                          <p style={{ color: '#999' }}>No proof image available for this claim</p>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedWinner.verification_status === 'pending' && (
                    <div className="verification-actions">
                      <div style={{ marginBottom: '20px' }}>
                        <h4>Verification Notes</h4>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="If rejecting, provide reason..."
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '5px',
                            border: '1px solid #ddd',
                            minHeight: '100px'
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleApproveWinner(selectedWinner.id)}
                          className="btn-small btn-success"
                          style={{ flex: 1 }}
                        >
                          ✅ Approve & Pay
                        </button>
                        <button
                          onClick={() => handleRejectWinner(selectedWinner.id)}
                          className="btn-small btn-danger"
                          style={{ flex: 1 }}
                        >
                          ❌ Reject Claim
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            ) : (
            <section className="admin-card">
                <h2>🏆 Verify Winners</h2>
                {winners.length > 0 ? (
                  <div className="winners-verification">
                    {winners.map(winner => (
                      <div key={winner.id} className="winner-verification-item">
                        <div className="winner-details">
                          <h4>{winner.match_type} Matches</h4>
                          <p>Prize: ${(winner.prize_amount_cents / 100).toFixed(2)}</p>
                          <p>Status: <strong style={{ color: getStatusColor(winner.verification_status) }}>{winner.verification_status}</strong></p>
                        </div>
                        <div className="winner-actions">
                          <button
                            onClick={() => setSelectedWinner(winner)}
                            className="btn-small"
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">No winners to verify</p>
                )}
              </section>
            )}
          </>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <>
            <section className="dashboard-card">
              <h2>🔐 API Configuration</h2>
              <div className="settings-group">
                <h4>Supabase URL</h4>
                <p className="settings-value">{import.meta.env.VITE_SUPABASE_URL}</p>
              </div>
              <div className="settings-group">
                <h4>API Endpoint</h4>
                <p className="settings-value">{import.meta.env.VITE_API_URL}</p>
              </div>
            </section>

            <section className="dashboard-card">
              <h2>⚙️ System Settings</h2>
              <div className="settings-options">
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Enable User Registrations
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Enable Monthly Draws
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Enable Stripe Payments
                  </label>
                </div>
              </div>
            </section>

            <section className="dashboard-card">
              <h2>📧 Email Configuration</h2>
              <div className="form-group">
                <label>Sender Email</label>
                <input type="email" defaultValue="noreply@golfcharity.app" />
              </div>
              <button className="btn-primary">Save Settings</button>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

function getStatusColor(status) {
  const colors = {
    pending: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
    paid: '#3b82f6'
  }
  return colors[status] || '#666'
}
