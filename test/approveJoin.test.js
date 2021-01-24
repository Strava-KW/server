const request = require("supertest")
const app = require("../app.js")
const mongoose = require('mongoose')
const db = mongoose.connection
const User = require('../models/User')
const Community = require("../models/Community")
const jwt = require('jsonwebtoken')
let access_token_userNoRole;
let access_token_userWaiting;
let communityIdSelected

beforeAll((done) => {
  const url = "mongodb://localhost:27017/Testing"
  mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(_ => {
      done()
    })
    .catch(err => {
      done(err)
    })
})

beforeEach(done => {
  const newCommunity = new Community({
    name: "Lalala",
    members: [],
    waitingList: [],
    events: [],
  })

  const userNoRole = new User({
    fullname: "Agnes",
    email: "agnes@mail.com",
    password: "qweqwe",
    history: [],
    totalRange: 0,
    role: null,
    communityId: null
  })
  const userAdmin = new User({
    fullname: "Pravida",
    email: "pravida@mail.com",
    password: "qweqwe",
    history: [],
    totalRange: 0,
    role: "admin",
    communityId: null
  })
})