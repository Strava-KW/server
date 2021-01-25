const request = require("supertest")
const app = require("../app.js")
const mongoose = require('mongoose')
const db = mongoose.connection
const User = require('../models/User')
const Community = require("../models/Community")
const jwt = require('jsonwebtoken')
let access_token_admin;
let access_token_userWaiting;
let access_token_userNoRole


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
  new Community ({
    name: "Lalala",
    members: [],
    waitingList: [],
    events: []
  })
  .save()
  .then(data => {
    return new User ({
      fullname: "Agnes",
      email: "agnes@mail.com",
      password: "qweqwe",
      communityId: data._id,
      history: [],
      totalRange: 0,
      role: "admin"

    })
    .save()
  })
  .then(data => {
    access_token_admin = jwt.sign({id: data._id, email: data.email, role: data.role, communityId: data.communityId}, process.env.SECRET_JWT)
    return new User ({
      fullname: "Pravida",
      email: "pravida@mail.com",
      password: "qweqwe",
      communityId: null,
      history: [],
      totalRange: 0,
      role: "waiting"
    })
    .save()
  })
  .then(data => {
    access_token_userWaiting = jwt.sign({id: data._id, email: data.email, role: data.role, communityId: data.communityId}, process.env.SECRET_JWT)
    return new User ({
      fullname: "Irlitashanty",
      email: "irlitashanty@mail.com",
      password: "qweqwe",
      communityId: null,
      history: [],
      totalRange: 0,
      role: null
    })
    .save()
  })
  .then(data => {
    access_token_userNoRole = jwt.sign({id: data._id, email: data.email, role: data.role, communityId: data.communityId}, process.env.SECRET_JWT)
    done()
  })
  .catch(err => {
    done(err)
  })
})

afterEach(done => {
  Community.findOneAndDelete({name: "Lalala"})
    .exec()
    .then(data => {
      return User.findOneAndDelete({email: "agnes@mail.com"})
      .exec()
    })
    .then(data => {
      return User.findOneAndDelete({email: "pravida@mail.com"})
      .exec()
    })
    .then(data => {
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


describe("Success get community", () => {
  describe("Successfully get community", () => {
    test("If user has waiting role", done => {
      request(app)
        .get(`/community/`)
        .set("access_token", access_token_userWaiting)
        .end((err, res) => {
          const { body, status } = res
          if (err) return done (err)
          expect(status).toBe(200)
          expect(body).toHaveProperty("message", "Your request for join community has been sent")
          done()
        })
    })
    test("If user has admin role", done => {
      request(app)
        .get(`/community/`)
        .set("access_token", access_token_admin)
        .end((err, res) => {
          const { body, status } = res
          if (err) return done (err)
          expect(status).toBe(200)
          expect(body).toHaveProperty("name", "Lalala")
          done()
        })
    })
  })
})