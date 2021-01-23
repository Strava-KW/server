const request = require("supertest")
const app = require("../app.js")
const mongoose = require('mongoose')
const db = mongoose.connection


beforeAll(done => {
  const url = "mongodb://localhost:27017/Testing"
  mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(_ => {
      done()
    })
    .catch(err => {
      done(err)
    })
})

afterAll(async (done) => {
  await db.dropCollection("users")
  // await mongoose.disconnect()
  done()
})

describe("Register User /users/register", () => {
  describe("Successful register", () => {
    test("response with id, email, and fullname", (done) => {
      request(app)
      .post('/users/register')
      .send({
        fullname: "Agnes",
        email: "agnes@mail.com",
        password: "qweqwe",
        communityId: null,
        history: [],
        totalRange: 0,
        role: null
      })
      .end((err, res) => {
        const { body, status } = res
        if(err) return done(err)
        expect(status).toBe(201)
        expect(body).toHaveProperty("fullname", "Agnes")
        expect(body).toHaveProperty("email", "agnes@mail.com")
        done()    
      })
    })
  })
  describe("Failed register", () => {
    test("Validation error", (done) => {
      request(app)
      .post('/users/register')
      .send({
        fullname: "",
        email: "agnes@mail.com",
        password: "qweqwe",
        communityId: null,
        history: [],
        totalRange: 0,
        role: null
      })
      .end((err, res) => {
        const { body, status } = res
        if(err) return done(err)
        expect(status).toBe(400)
        expect(body).toHaveProperty("message", ["Fullname should not be empty"])
        done() 
      })
    })
  })
})
