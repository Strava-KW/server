const express = require("express")
const app = express()
const mongoose = require('mongoose')
const User = require('./models/User')
const verifyPassword = require('./helpers/verifyPassword')
mongoose.connect('mongodb+srv://strava:strava123@cluster0.jds7c.mongodb.net/Testing?retryWrites=true&w=majority',{
  useNewUrlParser: true,
  useUnifiedTopology: true
})

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.post("/users/register", (req, res) => {
  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    fullname: req.body.fullname,
    email: req.body.email,
    password: req.body.password,
    communityName: null,
    history: [],
    totalRange: null,
    role: null
  })
  user
    .save()
    .then(result => {
      res.json(result)
    })
    .catch(err => {
      console.log(err)
    })
})

app.post("/users/login", (req, res) => {
  User.findOne({email: req.body.email})
    .exec()
    .then((doc) => {
      if (doc) {
        if (verifyPassword(req.body.password, doc.password)){
          res.json("login")
        }
        else {
          res.status(401).json({message: "Invalid email/password"})
        }
      }
      else {
        res.status(401).json({message: "Invalid email/password"})
      }
    })
    .catch(err => {
      res.json({
        status: 500,
        message: "Internal Server Error"
      })
    })
})

module.exports = app