const request = require("supertest")
const app = require("../app.js")
const mongoose = require('mongoose')
const db = mongoose.connection
const User = require('../models/User')
const jwt = require('jsonwebtoken')
let access_token;

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
beforeEach ((done) => {
  const user = new User({
    fullname: "Agnes",
    email: "agnes@mail.com",
    password: "qweqwe",
    history: [],
    totalRange: 0,
    role: null,
    communityId: null
  })
  user
  .save()
  .then(data => {
      access_token = jwt.sign({id: data._id, email: data.email, role: data.role, communityId: data.communityId}, process.env.SECRET_JWT)
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
      done()
    })
    .catch(err => {
      done(err)
    })
})


afterAll (async (done) => {
  await db.dropCollection("users")
  // await mongoose.disconnect()
  done()
})


describe ("Login /users/login", () => {
  describe ("Successful login", () => {
    test ("Response with access token", (done) => {
      request(app)
        .post('/users/login')
        .send({
          email: "agnes@mail.com",
          password: "qweqwe"
        })
        .end((err, res) => {
          const { body, status } = res
          if (err) return done (err)
          expect(status).toBe(200)
          expect(body).toHaveProperty("access_token", access_token)
          done()
        })
    })
  })
  describe ("Failed login", () => {
    test ("Invalid password", done => {
      request(app)
        .post('/users/login')
        .send({
          email: "agnes@mail.com",
          password: "qweqw"
        })
        .end((err, res) => {
          const { body, status } = res
          if (err) return done (err)
          expect(status).toBe(401)
          expect(body).toHaveProperty("message", "Invalid email/password")
          done()
        })
    })
    test ("Invalid email", done => {
      request(app)
        .post('/users/login')
        .send({
          email: "agne@mail.com",
          password: "qweqwe"
        })
        .end((err, res) => {
          const { body, status } = res
          if (err) return done (err)
          expect(status).toBe(401)
          expect(body).toHaveProperty("message", "Invalid email/password")
          done()
        })
    })
  })

})