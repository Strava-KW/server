const mongoose = require('mongoose')
const { Schema } = mongoose
const bcrypt = require('bcryptjs')

const userSchema = new Schema({
  fullname: {
    type: String,
    required: [true, "Fullname should not be empty"],
  },
  email: {
    type: String,
    required: [true, "Email should not be empty"],
    unique: true
  },
  password: {
    type: String,
    required: [true, "Password should not be empty"]
  },
  communityId: String,
  history: Array,
  totalRange: Number,
  role: String
})

userSchema.pre("save", function (next) {
  const salt = bcrypt.genSaltSync()
  this.password = bcrypt.hashSync(this.password, salt)
  next()
})
    
module.exports = mongoose.model('User', userSchema)