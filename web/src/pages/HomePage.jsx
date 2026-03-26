import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../styles/pages/HomePage.css'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <header className="navbar">
        <div className="container">
          <h1 className="logo">⛳ GolfRaise</h1>
          <nav>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="/login">Login</a>
            <a href="/register" className="btn-primary">Subscribe Now</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h2>⛳ Track. Win. Give Back.</h2>
          <p className="hero-subtitle">Join thousands of golfers supporting causes they believe in</p>
          <div className="hero-cta">
            <button onClick={() => navigate('/register')} className="btn-large btn-primary">
              🎯 Start Your Subscription
            </button>
            <button onClick={() => navigate('/login')} className="btn-large btn-secondary">
              Already a member? Login
            </button>
          </div>
        </div>
      </section>

      {/* Three Main Benefits Section */}
      <section className="benefits" id="features">
        <div className="container">
          <h2>Why Join GolfRaise?</h2>
          
          <div className="benefits-grid">
            {/* Benefit 1: Track & Compete */}
            <div className="benefit-card">
              <div className="benefit-icon">📊</div>
              <h3>Track & Compete</h3>
              <p className="benefit-description">
                Log your golf scores and compete in monthly draws with players worldwide. Every score brings you closer to winning real prizes while building your competitive legacy.
              </p>
              <ul className="benefit-list">
                <li>✅ Easy score entry & tracking</li>
                <li>✅ Monthly prize draws</li>
                <li>✅ Real-time leaderboards</li>
                <li>✅ Instant notifications</li>
              </ul>
            </div>

            {/* Benefit 2: Win Real Prizes */}
            <div className="benefit-card">
              <div className="benefit-icon">🏆</div>
              <h3>Win Real Prizes</h3>
              <p className="benefit-description">
                Your subscription enters you into monthly draws where winners take home real cash prizes. Three-tier matching system rewards consistent performers at every level.
              </p>
              <ul className="benefit-list">
                <li>✅ Monthly cash prizes</li>
                <li>✅ Multiple prize tiers</li>
                <li>✅ Fair & transparent draws</li>
                <li>✅ Instant payment verification</li>
              </ul>
            </div>

            {/* Benefit 3: Support Charities */}
            <div className="benefit-card">
              <div className="benefit-icon">❤️</div>
              <h3>Support Your Cause</h3>
              <p className="benefit-description">
                Every subscription directly funds charities of your choice. Choose from vetted organizations and customize your contribution percentage to match your values.
              </p>
              <ul className="benefit-list">
                <li>✅ Choose your charity</li>
                <li>✅ Custom contribution %</li>
                <li>✅ Track your impact</li>
                <li>✅ Real-time donation tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2>Simple 4-Step Process</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Subscribe</h4>
              <p>Choose monthly or yearly plan and select your charity partner</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>Log Scores</h4>
              <p>Enter your latest 5 golf scores in Stableford format</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>Win Monthly</h4>
              <p>Automatic entry into monthly draws with top golfers</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h4>Give Impact</h4>
              <p>Your contributions directly support your chosen charity</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing" id="pricing">
        <div className="container">
          <h2>Simple, Transparent Pricing</h2>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Monthly</h3>
              <p className="price">$9.99<span>/month</span></p>
              <p className="pricing-badge">Most Popular</p>
              <ul>
                <li>✅ Monthly draws</li>
                <li>✅ Unlimited score tracking</li>
                <li>✅ Choose your charity</li>
                <li>✅ Prize eligibility</li>
              </ul>
              <button onClick={() => navigate('/register')} className="btn-primary">Start Now</button>
            </div>

            <div className="pricing-card featured">
              <div className="featured-badge">Best Value</div>
              <h3>Yearly</h3>
              <p className="price">$99.99<span>/year</span></p>
              <p className="pricing-badge">Save 17%</p>
              <ul>
                <li>✅ All monthly features</li>
                <li>✅ 12 months included</li>
                <li>✅ Loyalty bonus</li>
                <li>✅ Priority support</li>
              </ul>
              <button onClick={() => navigate('/register')} className="btn-primary">Start Now</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-final">
        <div className="container">
          <h2>Ready to Make an Impact?</h2>
          <p>Join our community of passionate golfers supporting meaningful causes</p>
          <button onClick={() => navigate('/register')} className="btn-large btn-primary">
            🎯 Subscribe Today - $9.99/month
          </button>
        </div>
      </section>

      <footer>
        <p>&copy; 2024 GolfRaise. Golf, Community, Impact. All rights reserved.</p>
      </footer>
    </div>
  )
}
