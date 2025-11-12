import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [aadhar, setAadhar] = useState('')
  const [address, setAddress] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [passwordStrength, setPasswordStrength] = useState('')
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()



  const validatePasswordStrength = (value) => {
    const length = value.length >= 8
    const upper = /[A-Z]/.test(value)
    const lower = /[a-z]/.test(value)
    const number = /\d/.test(value)
    const symbol = /[!@#$%^&*(),.?":{}|<>]/.test(value)

    if (length && upper && lower && number && symbol) return 'Strong'
    if ((length && upper && lower) || (length && number)) return 'Medium'
    return 'Weak'
  }
  
  const handlePasswordChange = (e) => {
    const value = e.target.value
    setPassword(value)
    setPasswordStrength(validatePasswordStrength(value))
  }

  // Aadhaar format validation
  const validateAadhar = (num) => /^[2-9]{1}[0-9]{11}$/.test(num)

  // Real / fallback Aadhaar check
  const checkAadharAPI = async (num) => {
    if (process.env.NODE_ENV === 'development') {
      await new Promise((res) => setTimeout(res, 500))
      return validateAadhar(num)
    }

    try {
      const response = await fetch('https://api.karza.in/aadhaar-validation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-karza-key': process.env.REACT_APP_KARZA_API_KEY,
        },
        body: JSON.stringify({ aadhaar_number: num }),
      })

      const data = await response.json()
      return data?.isValid === true
    } catch (err) {
      console.error('Aadhaar verification failed:', err)
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    const newErrors = {}

    if (!name.trim()) newErrors.name = 'Full Name is required.'
    if (!email.trim()) newErrors.email = 'Email is required.'
    if (!aadhar.trim()) newErrors.aadhar = 'Aadhaar number is required.'
    if (!address.trim()) newErrors.address = 'Address is required.'
    if (!password.trim()) newErrors.password = 'Password is required.'
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.'
    if (!validateAadhar(aadhar)) newErrors.aadhar = 'Enter a valid 12-digit Aadhaar number.'

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    const isAadharValid = await checkAadharAPI(aadhar)
    if (!isAadharValid) {
      setMessage('⚠️ Invalid Aadhaar number.')
      return
    }

    if (passwordStrength === 'Weak') {
      setMessage('⚠️ Password is too weak. Use a mix of symbols, numbers, and capital letters.')
      return
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, aadhar, address, password }),
      })
      const data = await response.json()
      if (response.ok) {
        setMessage('✅ Signup successful! Redirecting to login...')
        setTimeout(() => navigate('/login'), 1200)
      } else {
        setMessage(`⚠️ ${data.message}`)
      }
    } catch {
      setMessage('❌ Error connecting to server.')
    }
  }

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {errors.name && <p className="auth-message">{errors.name}</p>}

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
          required
        />
        {errors.email && <p className="auth-message">{errors.email}</p>}

        <input
          type="text"
          placeholder="Aadhaar Number (12 digits)"
          value={aadhar}
          maxLength={12}
          onChange={(e) => setAadhar(e.target.value.replace(/\D/g, ''))}
          required
        />
        {errors.aadhar && <p className="auth-message">{errors.aadhar}</p>}

        <textarea
          className="address-input"
          placeholder="Full Address (House No, Street, City, State, PIN)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
          required
          style={{
            width: '100%',
            resize: 'none',
            borderRadius: '8px',
            border: '1px solid #ccc',
            padding: '12px',
            fontFamily: 'inherit',
            fontSize: '1rem',
            boxSizing: 'border-box',
            marginBottom: '15px',
          }}
        />
        {errors.address && <p className="auth-message">{errors.address}</p>}

        <input
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={handlePasswordChange}
          required
        />
        {password && (
          <p
            style={{
              color:
                passwordStrength === 'Strong'
                  ? 'green'
                  : passwordStrength === 'Medium'
                  ? '#e6a500'
                  : 'red',
              fontWeight: 600,
              marginTop: '-10px',
              marginBottom: '10px',
            }}
          >
            Password Strength: {passwordStrength}
          </p>
        )}
        {errors.password && <p className="auth-message">{errors.password}</p>}

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {errors.confirmPassword && <p className="auth-message">{errors.confirmPassword}</p>}

        <button type="submit" className="form-btn">
          Sign Up
        </button>
      </form>

      {message && <p className="auth-message">{message}</p>}

      {/* 🔹 Already registered link */}
      <p
        style={{
          marginTop: '15px',
          color: '#0054c2',
          fontWeight: 600,
          cursor: 'pointer',
          textDecoration: 'underline',
          transition: 'color 0.2s ease',
        }}
        onClick={() => navigate('/login')}
        onMouseOver={(e) => (e.target.style.color = '#2077ff')}
        onMouseOut={(e) => (e.target.style.color = '#0054c2')}
      >
        Already registered? Click here!
      </p>
    </div>
  )
}
