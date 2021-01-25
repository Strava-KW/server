const request = require("supertest")
const app = require("../app.js")
const mongoose = require('mongoose')
const db = mongoose.connection
const User = require('../models/User')
const jwt = require('jsonwebtoken')
let access_token;
let access_token_deleted

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
  new User ({
    fullname: "Irlitashanty",
    email: "irlitashanty@mail.com",
    password: "qweqwe",
    communityId: null,
    history: [],
    totalRange: 0,
    role: null
  })
    .save()
    .then(data => {
      access_token = jwt.sign({id: data._id, email: data.email, role: data.role, communityId: data.communityId}, process.env.SECRET_JWT)
      return new User ({
        fullname: "Pravida",
        email: "pravida@mail.com",
        password: "qweqwe",
        communityId: null,
        history: [],
        totalRange: 0,
        role: null
      })
      .save()
    })
    .then(data => {
      access_token_deleted = jwt.sign({id: data._id, email: data.email, role: data.role, communityId: data.communityId}, process.env.SECRET_JWT)
      return User.findOneAndDelete({email: "pravida@mail.com"})
      .exec()
    })
    .then(_ => {
      done()
    })
    .catch(err => {
      done(err)
    })
})

afterEach(done => {
  User.findOneAndDelete({email: "irlitashanty@mail.com"})
  .exec()
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

describe("get profile", () => {
  test("Success", done => {
    request(app)
      .get(`/profile/`)
      .set("access_token", access_token)
      .end((err, res) => {
        const { body, status } = res
        if (err) return done (err)
        expect(status).toBe(200)
        expect(body).toHaveProperty("email", "irlitashanty@mail.com")
        done()
      })
  })
  test("Failed", done => {
    request(app)
      .get(`/profile/`)
      .set("access_token", access_token_deleted)
      .end((err, res) => {
        const { body, status } = res
        if (err) return done (err)
        expect(status).toBe(401)
        expect(body).toHaveProperty("message", "Please login first")
        done()
      })
  })
})
