import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProfileMenu({ user }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
    window.location.reload()
  }

  return (
    <div style={{ position: 'relative', marginLeft: 'auto' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          gap: '10px',
          background: 'linear-gradient(90deg, #2077ff, #0054c2)',
          color: '#fff',
          padding: '8px 14px',
          borderRadius: '50px',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(32, 119, 255, 0.25)',
        }}
      >
        <img
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'U'}`}
          alt="Profile"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#fff',
            padding: '2px',
          }}
        />
        <span>{user?.name || 'User'}</span>
      </div>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            right: 0,
            background: '#fff',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            borderRadius: '10px',
            width: '180px',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            style={{
              padding: '12px 15px',
              borderBottom: '1px solid #eee',
              fontWeight: 600,
              color: '#003366',
            }}
          >
            👋 Hi, {user?.name?.split(' ')[0] || 'User'}
          </div>

          <button
            onClick={() => navigate('/history')}
            style={{
              width: '100%',
              padding: '10px 15px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              fontSize: '1rem',
              cursor: 'pointer',
              color: '#0054c2',
            }}
          >
            📄 History
          </button>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px 15px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              fontSize: '1rem',
              cursor: 'pointer',
              color: '#c00',
            }}
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  )
}
