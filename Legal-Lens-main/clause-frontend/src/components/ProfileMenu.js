import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'

export default function ProfileMenu({ user }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { logoutUser } = useContext(UserContext)

  const handleLogout = () => {
    // use central logout so context is cleared
    logoutUser()
    navigate('/login')
  }

  return (
    <div style={{ position: 'relative', marginLeft: 'auto' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          gap: '12px',
          background: 'linear-gradient(90deg,#2b8bff,#0b63e6)',
          color: '#fff',
          padding: '8px 18px',
          borderRadius: 9999,
          fontWeight: 700,
          boxShadow: '0 10px 30px rgba(11,99,230,0.22)',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#fff',
            color: '#0b63e6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            marginLeft: -6,
            boxShadow: '0 6px 18px rgba(11,99,230,0.18)',
            border: '3px solid rgba(255,255,255,0.85)',
          }}
        >
          {(user?.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div style={{ textAlign: 'left', lineHeight: 1 }}>
          <div style={{ fontWeight: 800 }}>{user?.name?.split(' ')[0] || 'User'}</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)' }}>{user?.email}</div>
        </div>
      </div>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 64,
            background: '#fff',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            borderRadius: '10px',
            width: '200px',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease',
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
            onClick={() => {
              setOpen(false)
              navigate('/history')
            }}
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
