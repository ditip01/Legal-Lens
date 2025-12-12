import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function AdminUploads() {
  const location = useLocation()
  const user = location.state?.user || null
  const userIdFromRoute = location.pathname.split('/').pop()
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchUploads = async () => {
      setLoading(true)
      setMessage('')
      try {
        const token = localStorage.getItem('token')
        if (!token) return setMessage('🔒 Not authenticated. Please log in as Admin.')

        // build api base as in other pages
        const rawBase = process.env.REACT_APP_API_URL
        let apiBase = ''
        if (rawBase && rawBase.startsWith('http')) apiBase = rawBase.replace(/\/$/, '')
        else if (rawBase && rawBase.startsWith(':')) apiBase = `http://localhost${rawBase}`
        else apiBase = rawBase || 'http://localhost:5000'

        const url = user ? `${apiBase}/api/admin/uploads/${user._id}` : `${apiBase}/api/admin/uploads`
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })

        const contentType = res.headers.get('content-type') || ''
        const data = contentType.includes('application/json') ? await res.json() : null

        if (!res.ok) {
          console.error('Admin uploads error:', data)
          setMessage(data?.message || '❌ Unable to fetch uploads')
          return
        }

        setUploads(data || [])
      } catch (err) {
        console.error('Error fetching admin uploads:', err)
        setMessage('❌ Server error fetching uploads')
      } finally {
        setLoading(false)
      }
    }

    fetchUploads()
  }, [user, userIdFromRoute])

  return (
    <div style={{ padding: '32px' }}>
      <h2 style={{ color: '#003366' }}>Admin — Upload History</h2>
      {user ? (
        <p style={{ color: '#666' }}>Showing uploads for <strong>{user.name}</strong> ({user.email})</p>
      ) : (
        <p style={{ color: '#666' }}>Showing uploads for all users</p>
      )}

      {loading ? (
        <p style={{ marginTop: 20 }}>Loading...</p>
      ) : message ? (
        <p style={{ marginTop: 20, color: '#b33' }}>{message}</p>
      ) : uploads.length === 0 ? (
        <p style={{ marginTop: 20, color: '#666' }}>No uploads found.</p>
      ) : (
        <div style={{ marginTop: 20 }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {uploads.map((u) => (
              <li
                key={u._id}
                style={{
                  padding: '12px 16px',
                  border: '1px solid #eee',
                  borderRadius: 8,
                  marginBottom: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong>{u.fileName}</strong>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    {new Date(u.uploadedAt).toLocaleString()} —{' '}
                    <span style={{ fontWeight: 600 }}>{u.userId?.name || u.userId || 'Unknown user'}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ marginBottom: 6 }}>
                    {u.analysisResult ? (
                      <>
                        <span style={{ fontWeight: 700 }}>{u.analysisResult.overallRisk}</span>
                        <span style={{ marginLeft: 8, color: '#666' }}>
                          ({u.analysisResult.riskPercentage}% risk)
                        </span>
                      </>
                    ) : (
                      <span style={{ color: '#888' }}>Pending analysis</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
