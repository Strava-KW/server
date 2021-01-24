const request = require("supertest")
const app = require("../app.js")
const mongoose = require('mongoose')
const db = mongoose.connection
const User = require('../models/User')
const Community = require("../models/Community")
const jwt = require('jsonwebtoken')
let access_token_admin;
let access_token_noadmin;
let selectedCommunity;
let waitingUser;

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
    role: "waiting",
    communityId: null
  })
 userNoRole
 .save()
 .then(data => {
   waitingUser = data._id
   access_token_userNoRole = jwt.sign({id: data._id, email: data.email, role: data.role, communityId: data.communityId}, process.env.SECRET_JWT)
   return new Community ({
    name: "Lalala",
    members: [{
      _id: 1234
    }],
    waitingList: [data],
    events: []
   })
   .save()
 })
 .then(data => {
   selectedCommunity = data._id
   return new User ({
    fullname: "Pravida",
    email: "pravida@mail.com",
    password: "qweqwe",
    history: [],
    totalRange: 0,
    role: "admin",
    communityId: data._id
   })
   .save()
 })
 .then(data => {
   access_token_admin = jwt.sign({id: data._id, email: data.email, role: data.role, communityId: data.communityId}, process.env.SECRET_JWT)
    return new User({
      fullname: "Irlitashanty",
      email: "irlitashanty@mail.com",
      password: "qweqwe",
      history: [],
      totalRange: 0,
      role: "member",
      communityId: selectedCommunity
    })
    .save()
 })
 .then(data => {
   access_token_noadmin = jwt.sign({id: data._id, email: data.email, role: data.role, communityId: data.communityId}, process.env.SECRET_JWT)
   done()
 })
 .catch(err => {
   done(err)
 })
})

afterEach(done => {
  User.findOneAndDelete({email: "agnes@mail.com"})
    .exec()
    .then(_ => {
      return User.findOneAndDelete({email: "pravida@mail.com"})
      .exec()
    })
    .then(_ => {
      return Community.findOneAndDelete({name: "Lalala"})
      .exec()
    })
    .then(_ => {
      return User.findOneAndDelete({email: "irlitashanty@mail.com"})
      .exec()
    })
    .then(_ => {
      done()
    })
    .catch(err => {
      done(err)
    })
})

afterAll (async (done) => {
  await db.dropCollection("users")
  await db.dropCollection("communities")
  done()
})


describe("Approve community", () => {
  describe("Success", () => {
    test("Success join", done => {
      request(app)
        .put(`/community/approval/${waitingUser}`) // ganti userId
        .set("access_token", access_token_admin)
        .end((err, res) => {
          const { body, status } = res
          if (err) return done (err)
          expect(status).toBe(200)
          expect(body).toHaveProperty("message", "The member has been approved")
          done()
        })

    })
  })
  describe("Success", () => {
    test("Success join", done => {
      request(app)
        .put(`/community/approval/${waitingUser}`) // ganti userId
        .set("access_token", access_token_noadmin)
        .end((err, res) => {
          const { body, status } = res
          if (err) return done (err)
          expect(status).toBe(401)
          expect(body).toHaveProperty("message", "You are not authorized")
          done()
        })

    })
  })
})

// test jika sudah jadi member