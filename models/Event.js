const mongoose = require('mongoose')
const { Schema } = mongoose


const eventSchema = new Schema({
  location: {
    type: String,
    required: [true, "Event name should not be empty"]
  },
  date: {
    type: Date,
    required: [true, "Date should not be empty"]
  },
  time: {
    type: String,
    required: [true, "Time should not be empty"]
  },
  hashed: {
    type: String
  }
})

eventSchema.pre("save", function (next) {
  let temp = ""
  for (let i = 0; i < this.hashed.length; i++) {
    if (this.hashed[i] === " ") {
      temp += "+"
    }
    else {
      temp += this.hashed[i]
    }
  }

  this.hashed = temp
  next()
})
    
module.exports = mongoose.model('Event', eventSchema)