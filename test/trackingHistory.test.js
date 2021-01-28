const request = require("supertest")
const app = require("../app.js")
const mongoose = require('mongoose')
const db = mongoose.connection
const User = require('../models/User')
const Community = require("../models/Community")
const jwt = require('jsonwebtoken')
let access_token_userNoRole;
let access_token;
let community

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
    members: [{
      _id: "123",
      fullname: "Lala"
    }],
    waitingList: [],
    events: []
  })
  .save()
  .then(data => {
    community = data
    return new User ({
      fullname: "Irlitashanty",
      email: "irlitashanty@mail.com",
      password: "qweqwe",
      communityId: data._id,
      history: [],
      totalRange: 0,
      role: "member"
    })
    .save()
  })
  .then(data => {
    access_token = jwt.sign({id: data._id, email: data.email, role: data.role, communityId: data.communityId}, process.env.SECRET_JWT)
    return Community.findOneAndUpdate({_id: community._id}, {members: [data]}, {useFindAndModify: false})
    .exec()
  })
  .then(_ => {
    return new User ({
      fullname: "Agnes",
      email: "agnes@mail.com",
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
  User.findOneAndDelete({email: "agnes@mail.com"})
    .exec()
    .then(_ => {
      User.findOneAndDelete({email: "irlitashanty@mail.com"})
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

describe("Success, track running path", () => {
  test("User has no community", (done) => {
    request(app)
    .post(`/history`)
    .set("access_token", access_token_userNoRole)
    .send({
      distance: 10,
      date: "2020-11-05"
    })
    .end((err, res) => {
      const { body, status } = res
      if (err) return done (err)
      expect(status).toBe(200)
      expect(body).toHaveProperty("message", "Track history added successfully")
      done()
    })
  })
  test("User has community", (done) => {
    request(app)
    .post(`/history`)
    .set("access_token", access_token)
    .send({
      distance: 10,
      date: "2020-11-05"
    })
    .end((err, res) => {
      const { body, status } = res
      if (err) return done (err)
      expect(status).toBe(200)
      expect(body).toHaveProperty("message", "Track history added successfully")
      done()
    })
  })
})