import { useEffect, useState, useContext } from 'react'
import { UserContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const { user } = useContext(UserContext)
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [filteredUsers, setFilteredUsers] = useState([])
  const [message, setMessage] = useState('')
  const [adminFile, setAdminFile] = useState(null)
  const [uploadingAdmin, setUploadingAdmin] = useState(false)


  // Fetch all users (Admins only)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return setMessage('⚠️ No token found. Please log in as Admin.')

        // Build resilient API base (fall back to localhost:5000 for dev)
        const rawBase = process.env.REACT_APP_API_URL
        let apiBase = ''
        if (rawBase && rawBase.startsWith('http')) apiBase = rawBase.replace(/\/$/, '')
        else if (rawBase && rawBase.startsWith(':')) apiBase = `http://localhost${rawBase}`
        else apiBase = rawBase || 'http://localhost:5000'

        const usersUrl = `${apiBase}/api/admin/users`
        const response = await fetch(usersUrl, { headers: { Authorization: `Bearer ${token}` } })

        const contentType = response.headers.get('content-type') || ''
        const data = contentType.includes('application/json') ? await response.json() : null
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

  // Admin upload handler (allows admins to upload a document for analysis)
  const handleAdminFileChange = (e) => setAdminFile(e.target.files[0])

  const handleAdminUpload = async (e) => {
    e.preventDefault()
    if (!adminFile) return setMessage('⚠️ Please select a file to upload')

    setUploadingAdmin(true)
    setMessage('🔍 Uploading and analyzing document...')
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setMessage('🔒 Not authenticated as admin. Please log in.')
        return
      }

      const formData = new FormData()
      formData.append('file', adminFile)

      const rawBase = process.env.REACT_APP_API_URL
      let apiBase = ''
      if (rawBase && rawBase.startsWith('http')) apiBase = rawBase.replace(/\/$/, '')
      else if (rawBase && rawBase.startsWith(':')) apiBase = `http://localhost${rawBase}`
      else apiBase = rawBase || 'http://localhost:5000'

      const res = await fetch(`${apiBase}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (res.status === 401) {
        setMessage('🔒 Session expired. Please login again.')
        setTimeout(() => (window.location.href = '/login'), 1000)
        return
      }

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')

      setMessage('✅ File uploaded successfully. Redirecting to results...')
      setAdminFile(null)
      // navigate to analysis page
      if (data.uploadId) navigate(`/analysis/${data.uploadId}`)
    } catch (err) {
      console.error('Admin upload error:', err)
      setMessage('❌ Upload failed. Please try again.')
    } finally {
      setUploadingAdmin(false)
    }
  }

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
      <p style={{ color: '#555' }}>
        Manage users and view their upload history. {user?.name ? `Hello, ${user.name}` : ''}
      </p>

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
                  onClick={() => navigate(`/admin-uploads/${u._id}`, { state: { user: u } })}
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
            View uploads for a specific user or view all uploads.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '14px' }}>
            <button
              onClick={() => navigate('/admin-uploads')}
              style={{
                background: '#2077ff',
                color: '#fff',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              View all uploads
            </button>
          </div>

          {/* Admin quick-upload form */}
          <div style={{ marginTop: '18px', textAlign: 'center' }}>
            <form onSubmit={handleAdminUpload}>
              <input type="file" accept="application/pdf" onChange={handleAdminFileChange} />
              <div style={{ marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={uploadingAdmin}
                  style={{
                    background: '#28a745',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginLeft: '8px',
                  }}
                >
                  {uploadingAdmin ? 'Uploading...' : 'Upload as Admin'}
                </button>
              </div>
            </form>
            {message && <p style={{ marginTop: '12px', color: '#444' }}>{message}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
