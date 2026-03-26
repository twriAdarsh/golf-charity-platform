import '../styles/Home.css'

export default function Home({ onGetStarted }) {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>MERN Stack App</h1>
        <p className="subtitle">Full-stack web application with React, Express, MongoDB & Node.js</p>
        
        <div className="features">
          <div className="feature">
            <span className="icon">⚛️</span>
            <p>React Frontend</p>
          </div>
          <div className="feature">
            <span className="icon">🚀</span>
            <p>Express Backend</p>
          </div>
          <div className="feature">
            <span className="icon">🗄️</span>
            <p>MongoDB Database</p>
          </div>
          <div className="feature">
            <span className="icon">🔐</span>
            <p>JWT Auth</p>
          </div>
        </div>

        <button onClick={onGetStarted} className="btn-primary">
          Get Started
        </button>
      </div>
    </div>
  )
}
