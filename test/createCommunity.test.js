const request = require("supertest")
const app = require("../app.js")
const mongoose = require('mongoose')
const db = mongoose.connection
const User = require('../models/User')
const Community = require("../models/Community")
const jwt = require('jsonwebtoken')
let access_token_userNoRole;
let access_token_userWaiting;
let access_token_admin;
let access_token_deleted;

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
  const userAdmin = new User({
    fullname: "Irlitashanty",
    email: "irlitashanty@mail.com",
    password: "qweqwe",
    history: [],
    totalRange: 0,
    role: "admin",
    communityId: 1234
  })
  const userDeleted = new User({
    fullname: "Robby",
    email: "robby@mail.com",
    password: "qweqwe",
    history: [],
    totalRange: 0,
    role: null,
    communityId: null
  })

  userNoRole
    .save()
    .then(data => {
      access_token_userNoRole = jwt.sign({id: data._id, email: data.email, role: data.role, communityId: data.communityId}, process.env.SECRET_JWT)
      return userWaiting
      .save()
    })
    .then(data => {
      access_token_userWaiting = jwt.sign({id: data._id, email: data.email, role: data.role, communityId: data.communityId}, process.env.SECRET_JWT)
      return userAdmin
      .save()
    })
    .then(data => {
      access_token_admin = jwt.sign({id: data._id, email: data.email, role: data.role, communityId: data.communityId}, process.env.SECRET_JWT)
      return userDeleted
      .save()
    })
    .then(data => {
      access_token_deleted = jwt.sign({id: data._id, email: data.email, role: data.role, communityId: data.communityId}, process.env.SECRET_JWT)
      return User.findOneAndDelete({email: "robby@mail.com"})
      .exec()
    })
    .then(_=> {
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
      return User.findOneAndDelete({email: "irlitashanty@mail.com"})
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

// 1. user belum punya role
// 2. user udah punya role waiting
// 3. user udah jadi admin
// 4. tidak ada akses token

describe ("Create community", () => {
  describe ("Successful create community", () => {
    test ("User has no role", done => {
      request(app)
        .post("/community/")
        .set("access_token", access_token_userNoRole)
        .send({
          name: "Lalala",
          members: [],
          waitingList: [],
          events: []
        })
        .end((err, res) => {
          const { body, status } = res
          if (err) return done (err)
          expect(status).toBe(201)
          expect(body).toHaveProperty("communityName", "Lalala")
          done()
        })
    })
  })

  describe ("Failed create community", () => {
    test("User has waiting role", done => {
      request(app)
        .post('/community/')
        .set("access_token", access_token_userWaiting)
        .send({
          name: "Lalala",
          members: [],
          waitingList: [],
          events: []
        })
        .end((err, res) => {
          const { body, status } = res
          if (err) return done (err)
          expect(status).toBe(401)
          expect(body).toHaveProperty("message", "You are not authorized to create or join community")
          done()
        })
    })
    test("User has admin role", done => {
      request(app)
        .post('/community/')
        .set("access_token", access_token_admin)
        .send({
          name: "Lalala",
          members: [],
          waitingList: [],
          events: []
        })
        .end((err, res) => {
          const { body, status } = res
          if (err) return done (err)
          expect(status).toBe(401)
          expect(body).toHaveProperty("message", "You are not authorized to create or join community")
          done()
        })
    })
    test("User does not sign in", done => {
      request(app)
        .post('/community/')
        .send({
          name: "Lalala",
          members: [],
          waitingList: [],
          events: []
        })
        .end((err, res) => {
          const { body, status } = res
          if (err) return done (err)
          expect(status).toBe(401)
          expect(body).toHaveProperty("message", "Please login first")
          done()
        })
    })
    test("User is not in database", done => {
      request(app)
        .post('/community/')
        .set("access_token", access_token_deleted)
        .send({
          name: "Lalala",
          members: [],
          waitingList: [],
          events: []
        })
        .end((err, res) => {
          const { body, status } = res
          if (err) return done (err)
          expect(status).toBe(401)
          expect(body).toHaveProperty("message", "Please login first")
          done()
        })
    })
  })
})