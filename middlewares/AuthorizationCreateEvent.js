const User = require('../models/User')

module.exports = (req, res, next) => {
  User.findOne({_id: req.loggedInUser.id})
    .exec()
    .then(data => {
      if (data.role === null || data.role === "waiting") {
        throw {
          status: 401,
          message: "You are not authorized to create event"
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