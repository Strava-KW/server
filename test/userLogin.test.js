const request = require("supertest")
const app = require("../app.js")
const mongoose = require('mongoose')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = mongoose.connection
let access_token;

beforeAll((done) => {
  const url = "mongodb+srv://strava:strava123@cluster0.jds7c.mongodb.net/Testing?retryWrites=true&w=majority"
  mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(_ => {
    let salt = bcrypt.genSaltSync()
    let hash = bcrypt.hashSync("qweqwe", salt)
    const user = new User({
      fullname: "Pravida",
      email: "pravida@mail.com",
      password: hash,
      communityId: null,
      history: [],
      totalRange: 0,
      role: null
    })
    user
      .save()
      .then(result => {
        access_token = jwt.sign({_id: result._id, email: result.email, role: result.role, communityId: result.communityId}, process.env.SECRET_JWT)
        done()
      })
  })
  .catch(err => {
    done(err)
  })

})
afterAll(async (done) => {
  await db.dropCollection("users")
  await mongoose.disconnect()
  done()
})


describe("Login POST /users/login", () => {
  describe("Successful login" , () => {
    test ("response with registered user", (done) => {
      request(app)
      .post("/users/login")
      .send({email: "pravida@mail.com", password: "qweqwe"})
      .end((err, res) => {
        const { body, status } = res
        if(err) return done(err)
        expect(status).toBe(200)
        expect(body).toHaveProperty("access_token", access_token)
        done()    
      })
    })
  })
  describe("Failed login user", () => {
    test("Right email, wrong password", (done) => {
      request(app)
      .post("/users/login")
      .send({email: "pravida@mail.com", password: "qweqw"})
      .end((err, res) => {
        const { body, status } = res
        if(err) return done(err)
        expect(status).toBe(401)
        expect(body).toHaveProperty("message", "Invalid email/password")
        done() 
      })
    })
  })
  describe("Failed login user", () => {
    test("Non-existent email", (done) => {
      request(app)
      .post("/users/login")
      .send({email: "admintest2@mail.com", password: "qweqw"})
      .end((err, res) => {
        const { body, status } = res
        if(err) return done(err)
        expect(status).toBe(401)
        expect(body).toHaveProperty("message", "Invalid email/password")
        done() 
      })
    })
  })
})