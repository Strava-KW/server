const User = require('../models/User')

module.exports = (req, res, next) => {
  console.log("hei")
  User.findOne({_id: req.loggedInUser.id})
    .exec()
    .then(data => {
      if (data.role === null || data.role === "waiting") {
        throw {
          status: 401,
          message: "You are not authorized to create or join community"
        }
      }
      else {
        next()
      }
    })
    .catch(err => {
      next(err)
    })
}