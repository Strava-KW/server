const mongoose = require('mongoose')
const { Schema } = mongoose


const communitySchema = new Schema({
  name: {
    type: String,
    required: [true, "Community name should not be empty"]
  },
  members: Array,
  waitingList: Array,
  events: Array
})

    
module.exports = mongoose.model('Community', communitySchema)