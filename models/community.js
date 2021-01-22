const mongoose = require('mongoose')

mongoose.connect("mongodb://localhost:27017/stravaDB", {useNewUrlParser: true}, {useUnifiedTopology: true})

const communitySchema = mongoose.Schema({
    name: String,
    members: Array,
    waitinglist: Array,
    Events: Array
})
module.exports = mongoose.model('Community', communitySchema)