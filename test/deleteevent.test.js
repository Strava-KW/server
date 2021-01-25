const request = require("supertest")
const app = require("../app.js")
const mongoose = require('mongoose')
const db = mongoose.connection
const User = require('../models/User')
const Community = require("../models/Community")
const Event = require("../models/Event")
const jwt = require('jsonwebtoken')
let access_token_admin;
let eventId;

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
  new Event ({
    name: "Lari di pagi hari",
    location: "Jakarta, Indonesia",
    date: "2021-11-09",
    time: "12:00",
    hashed: "Jakarta, Indonesia"
  })
    .save()
    .then(data => {
      eventId = data._id
      return new Community ({
        name: "Lalala",
        members: [],
        waitingList: [],
        events: [data]
      })
      .save()
    })
    .then(data => {
      return new User({
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
      done()
    })
    .catch(err => {
      done(err)
    })
})

afterEach(done => {
  Community.findOneAndDelete({name: "Lalala"})
    .exec()
    .then(_ => {
      return User.findOneAndDelete({name: "Agnes"})
      .exec()
    })
    .then(_ => {
      return Event.findOneAndDelete({name: "Lari di pagi hari"})
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
  await db.dropCollection("events")
  done()
})


describe("Delete event", () => {
  describe("Successfully delete event", () => {
    test("success", done => {
      request(app)
      .delete(`/community/events/${eventId}`)
      .set("access_token", access_token_admin)
      .end((err, res) => {
        const { body, status } = res
        if (err) return done (err)
        expect(status).toBe(200)
        expect(body).toHaveProperty("message", "Deleted")
        done()
      })
    })
  })
})