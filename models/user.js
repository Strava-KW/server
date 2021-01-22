const mongoose = require('mongoose')

mongoose.connect("mongodb://localhost:27017/stravaDB", {useNewUrlParser: true}, {useUnifiedTopology: true})

const userSchema = mongoose.Schema({
    fullname: String,
    email: String,
    password: String,
    history: Array,
    totalrange: Number,
    role: String,
    communityName: String
})

module.exports = mongoose.model('User', userSchema)