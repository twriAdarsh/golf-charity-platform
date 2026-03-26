import './Loading.css'

export default function Loading({ fullscreen = false, text = 'Loading...' }) {
  if (fullscreen) {
    return (
      <div className="loading-fullscreen">
        <div className="spinner">
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
        </div>
        <p className="loading-text">{text}</p>
      </div>
    )
  }

  return (
    <div className="loading-inline">
      <div className="spinner-small">
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
      </div>
      <p className="loading-text">{text}</p>
    </div>
  )
}
