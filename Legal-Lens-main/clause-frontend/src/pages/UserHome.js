import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'

export default function UserHome() {
  const navigate = useNavigate()
  const { user, logoutUser } = useContext(UserContext)

  const handleUpload = () => navigate('/upload')

  return (
    <div className="home-section" style={{ position: 'relative' }}>
      {/* 🔹 Logout button */}
      <button
        onClick={logoutUser}
        style={{
          position: 'absolute',
          top: '20px',
          right: '40px',
          background: 'linear-gradient(90deg, #d11a2a, #a50b15)',
          color: '#fff',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '40px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(209, 26, 42, 0.3)',
          transition: 'all 0.2s ease-in-out',
        }}
        onMouseOver={(e) => (e.target.style.background = 'linear-gradient(90deg, #a50b15, #700909)')}
        onMouseOut={(e) => (e.target.style.background = 'linear-gradient(90deg, #d11a2a, #a50b15)')}
      >
        Logout
      </button>

      {/* 🔹 Left Side (Image) */}
      <div className="home-left">
        <img
          src="https://cdn-icons-png.flaticon.com/512/8206/8206170.png"
          alt="Legal Document Illustration"
          className="hero-image"
        />
      </div>

      {/*LogOut */}
      <div className="home-right">
        <h1>
          Welcome back, <span className="highlight">{user?.name?.split(' ')[0] || 'User'}</span> 👋
        </h1>
        <p>
          Upload and manage your legal documents securely.  
          Get instant clause classification and risk detection insights powered by AI.
        </p>

        <button onClick={handleUpload} className="cta-btn">
          Upload Document
        </button>
      </div>
    </div>
  )
}
