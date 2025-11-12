import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'

export default function AdminHome() {
  const { user, logoutUser } = useContext(UserContext)
  const navigate = useNavigate()

  return (
    <div className="home-section">
      <div className="home-right" style={{ textAlign: 'center' }}>
        <h1>
          Welcome back, <span className="highlight">{user?.name || 'Admin'}</span> 
        </h1>
        <p style={{ maxWidth: '600px', margin: '15px auto', color: '#333' }}>
          This is the <strong>Admin Home page</strong>.  
          Here you can view user records, analyze document activity, and manage the platform.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
          <button
            onClick={() => navigate('/admin')}
            className="cta-btn"
          >
            Go to Admin Dashboard
          </button>
          <button
            onClick={logoutUser}
            className="form-btn"
            style={{
              background: 'linear-gradient(90deg, #ff4b2b, #ff416c)',
              boxShadow: '0 4px 12px rgba(255, 65, 108, 0.3)',
              width: '180px',
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
