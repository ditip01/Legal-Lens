import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'

export default function UserHome() {
  const navigate = useNavigate()
  const { user, logoutUser } = useContext(UserContext)

  const handleUpload = () => navigate('/upload')

  return (
    <div className="home-section" style={{ position: 'relative' }}>
      {/* Profile/menu removed from page - navbar contains the profile chip now */}

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
