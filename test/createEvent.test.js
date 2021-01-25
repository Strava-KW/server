const request = require("supertest")
const app = require("../app.js")
const mongoose = require('mongoose')
const db = mongoose.connection
const User = require('../models/User')
const Community = require("../models/Community")
const jwt = require('jsonwebtoken')
const { TestScheduler } = require("jest")
let access_token_admin;
let access_token_nomember;
// let selectedCommunity;
// let waitingUser;
// let member;

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
  // autorisasi: user yg rolenya null/waiting gabisa create event
  // bikin community
  // bikin user yg rolenya admin dengan community id
  // bikin user yg rolenya waiting/null
  new Community ({
    name: "lalala",
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
        history: [],
        totalRange: 0,
        role: "admin",
        communityId: data._id
      })
      .save()
    })
    .then(data => {
      access_token_admin = jwt.sign({id: data._id, email: data.email, role: data.role, communityId: data.communityId}, process.env.SECRET_JWT)
      return new User ({
        fullname: "Pravida",
        email: "pravida@mail.com",
        password: "qweqwe",
        history: [],
        totalRange: 0,
        role: null,
        communityId: null
      })
      .save()
    })
    .then(data => {
      access_token_nomember = jwt.sign({id: data._id, email: data.email, role: data.role, communityId: data.communityId}, process.env.SECRET_JWT)
      done()
    })
    .catch(err => {
      done(err)
    })
  
})

afterEach (done => {
  User.findOneAndDelete({email: "agnes@mail.com"})
    .exec()
    .then(_ => {
      return User.findOneAndDelete({email: "pravida@mail.com"})
      .exec()
    })
    .then(_ => {
      return Community.findOneAndDelete({name: "lalala"})
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


describe("Create event", () => {
  describe("Success", () => {
    test("Successfully create event", done => {
      request(app)
      .post("/community/events")
      .set("access_token", access_token_admin)
      .send({
        name: "Lari di pagi hari",
        location: "Jakarta, Indonesia",
        date: "2021-11-09",
        time: "12:00",
        hashed: "Jakarta, Indonesia"
      })
      .end((err, res) => {
        const { body, status } = res
        if (err) return done (err)
        expect(status).toBe(201)
        expect(body).toHaveProperty("message", "Event created")
        done()
      })
    })
  })
 describe ("Failed", () => {
   test("User is not a member", done => {
    request(app)
    .post("/community/events")
    .set("access_token", access_token_nomember)
    .send({
      name: "Lari di pagi hari",
      location: "Jakarta, Indonesia",
      date: "2021-11-09",
      time: "12:00",
      hashed: "Jakarta, Indonesia"
    })
    .end((err, res) => {
      const { body, status } = res
      if (err) return done (err)
      expect(status).toBe(401)
      expect(body).toHaveProperty("message", "You are not authorized to create event")
      done()
    })
   })
 })
})