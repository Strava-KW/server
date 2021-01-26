require("dotenv").config();
const express = require("express");
const app = express();
const router = require("./routes");
const errorHandler = require("./middlewares/errorHandling");
const cors = require("cors");
const mongoose = require("mongoose");
<<<<<<< HEAD
const url =
  "mongodb+srv://strava:strava123@cluster0.jds7c.mongodb.net/Development?retryWrites=true&w=majority";
=======
const url = "mongodb://localhost:27017/Runator";
>>>>>>> e39d535511270af304a9928e0a70941e37ea51be
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(router);
app.use(errorHandler);

module.exports = app;
