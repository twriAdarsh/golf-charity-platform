import { useState } from 'react'
import axios from 'axios'
import '../styles/pages/HomePage.css'

export default function HomePage() {
  return (
    <div className="home-page">
      <header className="navbar">
        <div className="container">
          <h1 className="logo">⛳ GolfRaise</h1>
          <nav>
            <a href="/login">Login</a>
            <a href="/register" className="btn-primary">Get Started</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <h2>Golf, Charity, and Community</h2>
          <p>Track your scores, win prizes, and support charities you love</p>
          <a href="/register" className="btn-large">Join Our Community</a>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h3>How It Works</h3>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Subscribe</h4>
              <p>Choose your plan and select your charity</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>Enter Scores</h4>
              <p>Log your latest golf scores in Stableford format</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>Win Prizes</h4>
              <p>Participate in monthly draws for cash prizes</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h4>Support Charity</h4>
              <p>Your contribution directly helps charities</p>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <p>&copy; 2024 GolfRaise. All rights reserved.</p>
      </footer>
    </div>
  )
}
