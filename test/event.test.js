const request = require("supertest")
const app = require("../app.js")
const mongoose = require('mongoose')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = mongoose.connection


// beforeAll(done => {
//   const url = "mongodb+srv://strava:strava123@cluster0.jds7c.mongodb.net/Testing?retryWrites=true&w=majority"
//   mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(_ => {
//       let salt = bcrypt.genSaltSync()
//       let hash = bcrypt.hashSync("qweqwe", salt)
//       const user = new User({
//         fullname: "Pravida",
//         email: "pravida@mail.com",
//         password: hash,
//         communityId: null,
//         history: [],
//         totalRange: 0,
//         role: null
//       })
//     })
//     .catch(err => {
//       done(err)
//     })
// })

