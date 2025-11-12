import { useEffect, useState, useContext } from 'react'
import { UserContext } from '../context/UserContext'

export default function AdminDashboard() {
  const { user } = useContext(UserContext)
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [filteredUsers, setFilteredUsers] = useState([])
  const [message, setMessage] = useState('')


  // Fetch all users (Admins only)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return setMessage('⚠️ No token found. Please log in as Admin.')

        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await response.json()
        if (response.ok) {
          setUsers(data)
          setFilteredUsers(data)
          setMessage('')
        } else {
          setMessage(data.message || '⚠️ Unable to fetch users.')
        }
      } catch (err) {
        console.error('Error fetching users:', err)
        setMessage('❌ Error connecting to server.')
      }
    }

    fetchUsers()
  }, [])

  // Filter users by name, email, or Aadhaar
  useEffect(() => {
    if (!search.trim()) {
      setFilteredUsers(users)
    } else {
      const query = search.toLowerCase()
      setFilteredUsers(
        users.filter(
          (u) =>
            u.name?.toLowerCase().includes(query) ||
            u.email?.toLowerCase().includes(query) ||
            u.aadhar?.includes(query)
        )
      )
    }
  }, [search, users])

  return (
    <div className="admin-container">
      <h2 style={{ color: '#003366', fontWeight: 700 }}>Admin Dashboard</h2>
      <p style={{ color: '#555' }}>Manage users and view their upload history.</p>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '40px',
          marginTop: '30px',
        }}
      >
        {/* Registered Users */}
        <div
          style={{
            background: '#fff',
            padding: '25px 30px',
            borderRadius: '16px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            width: '350px',
          }}
        >
          <h3 style={{ color: '#003366', textAlign: 'center' }}>Registered Users</h3>
          <input
            type="text"
            placeholder="Search by name, email, or Aadhaar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              marginTop: '10px',
              marginBottom: '15px',
              outline: 'none',
              fontSize: '0.95rem',
            }}
          />
          {message && <p style={{ color: '#888', textAlign: 'center' }}>{message}</p>}

          {filteredUsers.length === 0 ? (
            <p style={{ color: '#555', textAlign: 'center' }}>No users found.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {filteredUsers.map((u) => (
                <li
                  key={u._id}
                  style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = '#f8faff')}
                  onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <strong>{u.name}</strong>
                  <br />
                  <span style={{ fontSize: '0.85rem', color: '#555' }}>{u.email}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upload History */}
        <div
          style={{
            background: '#fff',
            padding: '25px 30px',
            borderRadius: '16px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            width: '450px',
          }}
        >
          <h3 style={{ color: '#003366', textAlign: 'center' }}>Upload History</h3>
          <p style={{ textAlign: 'center', color: '#666' }}>
            Select a user to view uploads.
          </p>
        </div>
      </div>
    </div>
  )
}
