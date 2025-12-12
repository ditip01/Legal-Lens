import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'
import Upload from '../models/uploadModel.js'

const router = express.Router()

// ✅ Middleware: verify admin access
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ message: 'No token provided' })

  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' })
    }

    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// ✅ Get all users (excluding passwords)
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 })
    if (!users || users.length === 0)
      return res.status(404).json({ message: 'No users found' })

    // Normalize names and emails to lowercase for frontend searching consistency
    const formattedUsers = users.map((u) => ({
      ...u._doc,
      name: u.name?.trim(),
      email: u.email?.toLowerCase().trim(),
    }))

    res.status(200).json(formattedUsers)
  } catch (err) {
    console.error('❌ Error fetching users:', err)
    res.status(500).json({ message: 'Server error fetching users' })
  }
})

// ✅ Get uploads by a specific user
router.get('/uploads/:userId', verifyAdmin, async (req, res) => {
  try {
    const uploads = await Upload.find({ userId: req.params.userId })
      .sort({ uploadedAt: -1 })
      .lean()

    if (!uploads || uploads.length === 0)
      return res.status(200).json([]) // ✅ Return empty array (not an error)

    res.status(200).json(uploads)
  } catch (err) {
    console.error('❌ Error fetching uploads:', err)
    res.status(500).json({ message: 'Server error fetching uploads' })
  }
})

// ✅ Get all uploads (Admins only) — include user info
router.get('/uploads', verifyAdmin, async (req, res) => {
  try {
    const uploads = await Upload.find({})
      .sort({ uploadedAt: -1 })
      .populate('userId', 'name email')
      .lean()

    if (!uploads) return res.status(200).json([])

    res.status(200).json(uploads)
  } catch (err) {
    console.error('❌ Error fetching all uploads:', err)
    res.status(500).json({ message: 'Server error fetching uploads' })
  }
})

// ✅ Delete a user + their uploads
router.delete('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    await User.findByIdAndDelete(req.params.id)
    await Upload.deleteMany({ userId: req.params.id })

    res.status(200).json({ message: `🗑️ User "${user.name}" and all uploads deleted.` })
  } catch (err) {
    console.error('❌ Error deleting user:', err)
    res.status(500).json({ message: 'Server error deleting user' })
  }
})

// ✅ Promote / Demote user role
router.put('/users/:id/role', verifyAdmin, async (req, res) => {
  try {
    const { role } = req.body
    if (!['admin', 'user'].includes(role))
      return res.status(400).json({ message: 'Invalid role specified.' })

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, projection: '-password' }
    )

    if (!updatedUser)
      return res.status(404).json({ message: 'User not found.' })

    res.status(200).json({
      message: `✅ ${updatedUser.name} is now an ${updatedUser.role}.`,
      user: updatedUser,
    })
  } catch (err) {
    console.error('❌ Error updating role:', err)
    res.status(500).json({ message: 'Server error updating user role.' })
  }
})

export default router
