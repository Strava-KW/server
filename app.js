require('dotenv').config()
const express = require("express")
const app = express()
const router = require('./routes')
const PORT = 4000

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(router)

app.listen(PORT, () => {
    console.log(`strava listening on port ${PORT}`)
})
