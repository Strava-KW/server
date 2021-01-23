const request = require("supertest")
const app = require("../app.js")
const mongoose = require('mongoose')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = mongoose.connection
let access_token_nonrole
let access_token_role;

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
    const user2 = new User({
      fullname: "Agnes",
      email: "agnes@mail.com",
      password: hash,
      communityId: 1234,
      history: [],
      totalRange: null,
      role: "admin"
    })
    user
      .save()
      .then(result => {
        access_token_nonrole = jwt.sign({_id: result._id, email: result.email, role: result.role, communityId: result.communityId}, "rahasiaeuy")
        user2
        .save()
        .then(result => {
          access_token_role = jwt.sign({_id: result._id, email: result.email, role: result.role, communityId: result.communityId}, "rahasiaeuy")
          done()
        })
      })
  })
  .catch(err => {
    done(err)
  })

})
afterAll(async (done) => {
  await db.dropCollection("users")
  await db.dropCollection("communities")
  await mongoose.disconnect()
  done()
})


describe("Create Community POST /users/community", () => {
  describe("Successful create community " , () => {
    test ("response with created community", (done) => {
      request(app)
      .post("/users/community")
      .set("access_token", access_token_nonrole)
      .send({
        name: "Lalala",
        members: [],
        waitingList: [],
        events: []
      })
      .end((err, res) => {
        const { body, status } = res
        if(err) return done(err)
        expect(status).toBe(200)
        expect(body).toMatchObject({
          name: "Lalala",
          members: [],
          waitingList: [],
          events: []
        })
        done()    
      })
    })
  })
  describe("Failed create community", () => {
    test("User has role", (done) => {
      request(app)
      .post("/users/community")
      .set("access_token", access_token_role)
      .send({
        name: "Lalala",
        members: [],
        waitingList: [],
        events: []
      })
      .end((err, res) => {
        const { body, status } = res
        if(err) return done(err)
        expect(status).toBe(401)
        expect(body).toHaveProperty("message", "You cannot create role")
        done() 
      })
    })
  })
  describe("Failed create community", () => {
    test("User has not been logged in", (done) => {
      request(app)
      .post("/users/community")
      .send({
        name: "Lalala",
        members: [],
        waitingList: [],
        events: []
      })
      .end((err, res) => {
        const { body, status } = res
        if(err) return done(err)
        expect(status).toBe(401)
        expect(body).toHaveProperty("message", "Please login first")
        done() 
      })
    })
  })
  describe("Failed create community", () => {
    test("Empty community name", (done) => {
      request(app)
      .post("/users/community")
      .set("access_token", access_token_nonrole)
      .send({
        name: "",
        members: [],
        waitingList: [],
        events: []
      })
      .end((err, res) => {
        const { body, status } = res
        if(err) return done(err)
        expect(status).toBe(400)
        expect(body).toHaveProperty("message", "Community name should not be empty")
        done() 
      })
    })
  })
})