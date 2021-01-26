require('dotenv').config()
const express = require("express")
const app = express()
const router = require('./routes')
const errorHandler = require('./middlewares/errorHandling')

const mongoose = require('mongoose')
const url = "mongodb://localhost:27017"
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(router)
app.use(errorHandler)

module.exports = app