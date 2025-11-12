import mongoose from 'mongoose'
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.AADHAR_ENCRYPTION_KEY || 'mySuperSecretKey1234567890123456' // Must be 32 bytes
const IV_LENGTH = 16 // AES block size

// Helper functions for encryption/decryption
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

function decrypt(text) {
  const parts = text.split(':')
  const iv = Buffer.from(parts.shift(), 'hex')
  const encryptedText = parts.join(':')
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    aadhar: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    role: { type: String, default: 'user' },
  },
  { timestamps: true }
)

// Lowercase email and encrypt Aadhaar before saving
userSchema.pre('save', function (next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase()
  }

  if (this.isModified('aadhar')) {
    this.aadhar = encrypt(this.aadhar)
  }

  next()
})

// Add a virtual getter to safely decrypt Aadhaar when needed
userSchema.methods.getDecryptedAadhar = function () {
  try {
    return decrypt(this.aadhar)
  } catch {
    return null
  }
}

const User = mongoose.model('User', userSchema)
export default User
