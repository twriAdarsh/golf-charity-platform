import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../styles/pages/Dashboard.css'

export default function SubscriptionPage() {
  const [charities, setCharities] = useState([])
  const [selectedCharity, setSelectedCharity] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState('monthly')
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

    fetchCharities()
  }, [])

  const fetchCharities = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/charities`)
      setCharities(response.data)
      if (response.data.length > 0) {
        setSelectedCharity(response.data[0].id)
      }
    } catch (error) {
      console.error('Error fetching charities:', error)
      setError('Failed to load charities')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async (plan) => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    if (!selectedCharity) {
      setError('Please select a charity')
      return
    }

    setError('')
    setSubmitting(true)

    try {
      const charityName = charities.find(c => c.id === selectedCharity)?.name || 'Selected Charity'
      
      // Create checkout session (demo mode - no payment processing yet)
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/subscriptions/create-checkout`,
        {
          plan_type: plan,
          charity_id: selectedCharity,
          charity_percentage: plan === 'yearly' ? 15 : 10
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )

      // Demo success message
      alert(`✅ Subscription Created!\n\nPlan: ${plan.toUpperCase()}\nCharity: ${charityName}\n\nPayment gateway integration coming soon!`)
      navigate('/dashboard')
    } catch (error) {
      console.error('Checkout error:', error)
      setError(error.response?.data?.error || 'Failed to create subscription')
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

  if (loading) return <div className="dashboard">Loading charities...</div>

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <h1>💳 Choose Your Subscription Plan</h1>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <div className="container">
        {error && <div className="error-message">{error}</div>}

        <section className="dashboard-card">
          <h2>Step 1: Select a Charity</h2>
          <p>Your monthly contribution will support the charity you choose</p>
          <div className="charities-grid">
            {charities.map(charity => (
              <div 
                key={charity.id} 
                className={`charity-card ${selectedCharity === charity.id ? 'selected' : ''}`}
                onClick={() => setSelectedCharity(charity.id)}
              >
                <img src={charity.logo_url} alt={charity.name} />
                <h4>{charity.name}</h4>
                <p>{charity.description}</p>
                {charity.is_featured && <span className="featured-badge">⭐ Featured</span>}
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-card">
          <h2>Step 2: Choose Plan</h2>
          <div className="plans-grid">
            <div className={`plan ${selectedPlan === 'monthly' ? 'selected-plan' : ''}`}>
              <h3>Monthly</h3>
              <p className="price">$9.99/month</p>
              <ul className="features">
                <li>✓ Unlimited score entries</li>
                <li>✓ Monthly draw participation</li>
                <li>✓ 10% charity donation</li>
                <li>✓ Email notifications</li>
              </ul>
              <button 
                className="btn-primary"
                onClick={() => { setSelectedPlan('monthly'); handleCheckout('monthly'); }}
                disabled={submitting}
              >
                {submitting ? 'Processing...' : 'Subscribe Monthly'}
              </button>
            </div>

            <div className={`plan featured ${selectedPlan === 'yearly' ? 'selected-plan' : ''}`}>
              <span className="save-badge">Save 20%</span>
              <h3>Yearly</h3>
              <p className="price">$99.99/year</p>
              <ul className="features">
                <li>✓ Unlimited score entries</li>
                <li>✓ Monthly draw participation</li>
                <li>✓ 15% charity donation</li>
                <li>✓ Email notifications</li>
                <li>✓ Priority support</li>
              </ul>
              <button 
                className="btn-primary"
                onClick={() => { setSelectedPlan('yearly'); handleCheckout('yearly'); }}
                disabled={submitting}
              >
                {submitting ? 'Processing...' : 'Subscribe Yearly'}
              </button>
            </div>
          </div>
        </section>

        <section className="dashboard-card">
          <h2>What You Get</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon">🏌️</div>
              <h4>Golf Tracking</h4>
              <p>Log unlimited Stableford scores</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🎰</div>
              <h4>Monthly Draws</h4>
              <p>Win cash prizes monthly</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">❤️</div>
              <h4>Charity Support</h4>
              <p>Help charities you love</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">📧</div>
              <h4>Updates & Results</h4>
              <p>Get email notifications</p>
            </div>
          </div>
        </section>

        <section className="dashboard-card security-notice">
          <h3>🔒 Secure Payment</h3>
          <p>Payment processing will be integrated soon. Your payment information will be encrypted and never stored on our servers. Demo subscriptions are currently enabled.</p>
        </section>
      </div>
    </div>
  )
}
