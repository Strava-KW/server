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

beforeEach((done) => {
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
  const userWaiting = new User({
    fullname: "Pravida",
    email: "pravida@mail.com",
    password: "qweqwe",
    history: [],
    totalRange: 0,
    role: "waiting",
    communityId: null
  })

  newCommunity
    .save()
    .then(data => {
      communityIdSelected = data._id
      return userNoRole
        .save()
    })
    .then(data => {
      access_token_userNoRole = jwt.sign({id: data._id, email: data.email, role: data.role, communityId: data.communityId}, process.env.SECRET_JWT)
      return userWaiting
        .save()
    })
    .then(data => {
      access_token_userWaiting = jwt.sign({id: data._id, email: data.email, role: data.role, communityId: data.communityId}, process.env.SECRET_JWT)
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

describe ("Success join community", () => {
  describe ("User has no role", () => {
    test("Success join", done => {
      request(app)
        .patch(`/community/${communityIdSelected}`)
        .set("access_token", access_token_userNoRole)
        .end((err, res) => {
          const { body, status } = res
          if (err) return done (err)
          expect(status).toBe(200)
          expect(body).toHaveProperty("message", "Agnes request to join community has been sent")
          done()
        })
    })
  })
})

describe ("Failed to join community", () => {
  describe("User has role", () => {
    test("Failed", done => {
      request(app)
        .patch(`/community/${communityIdSelected}`)
        .set("access_token", access_token_userWaiting)
        .end((err, res) => {
          const { body, status } = res
          if (err) return done (err)
          expect(status).toBe(401)
          expect(body).toHaveProperty("message", "You are not authorized to create or join community")
          done()
        })
    })
  })
})