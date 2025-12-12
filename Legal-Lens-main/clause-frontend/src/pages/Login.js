import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const { loginUser } = useContext(UserContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      // Build resilient API base (fallback for local dev)
      const rawBase = process.env.REACT_APP_API_URL
      let apiBase = ''
      if (rawBase && rawBase.startsWith('http')) apiBase = rawBase.replace(/\/$/, '')
      else if (rawBase && rawBase.startsWith(':')) apiBase = `http://localhost${rawBase}`
      else apiBase = rawBase || 'http://localhost:5000'

      const response = await fetch(`${apiBase}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
        }),
      })

      const contentType = response.headers.get('content-type') || ''
      const data = contentType.includes('application/json') ? await response.json() : null

      if (response.ok) {
        loginUser(data.user, data.token)
        setMessage('✅ Login successful! Redirecting...')

        setTimeout(() => {
          if (data.user.role === 'admin') navigate('/admin-home')
          else navigate('/user-home')
        }, 800)
      } else {
        setMessage(`⚠️ ${data.message || 'Invalid credentials.'}`)
      }
    } catch (err) {
      console.error('Login error:', err)
      setMessage('❌ Error connecting to server.')
    }
  }

  return (
    <div className="auth-container">
      <h2>Login</h2>

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        {/* Email Input */}
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
          required
          style={{
            width: '100%',
            padding: '14px',
            marginBottom: '18px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#fafafa',
            color: '#111',
            fontSize: '1rem',
            boxSizing: 'border-box',
          }}
        />

        {/* Password Input */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            marginBottom: '18px',
          }}
        >
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '14px 40px 14px 14px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              backgroundColor: '#fafafa',
              color: '#111',
              fontSize: '1rem',
              boxSizing: 'border-box',
            }}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              color: '#0054c2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        <button type="submit" className="form-btn" style={{ width: '100%' }}>
          Login
        </button>
      </form>

      {/* Message */}
      {message && (
        <p
          className="auth-message"
          style={{
            marginTop: '10px',
            color:
              message.startsWith('✅') ? 'green' :
              message.startsWith('⚠️') ? '#e6a500' :
              'red',
          }}
        >
          {message}
        </p>
      )}

      {/* Sign-up redirect */}
      <p
        style={{
          marginTop: '20px',
          fontSize: '0.95rem',
          color: '#333',
          textAlign: 'center',
        }}
      >
        Don’t have an account?{' '}
        <Link
          to="/signup"
          style={{
            color: '#0054c2',
            fontWeight: 600,
            textDecoration: 'none',
          }}
          onMouseOver={(e) => (e.target.style.textDecoration = 'underline')}
          onMouseOut={(e) => (e.target.style.textDecoration = 'none')}
        >
          Sign up here!
        </Link>
      </p>
    </div>
  )
}
