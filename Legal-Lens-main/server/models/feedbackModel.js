const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Upload' },
  userQuery: String,
  botResponse: String,
  rating: Number,
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Feedback', feedbackSchema)
