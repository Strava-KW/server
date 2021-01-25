const User = require("../models/User");
const Community = require("../models/Community")
const { checkPassword } = require("../helpers/bcrypt");
const { createToken } = require("../helpers/jwt");

class UserController {
  static register(req, res, next) {
    console.log(req.body);
    const user = new User({
      fullname: req.body.fullname,
      email: req.body.email,
      password: req.body.password,
      history: [],
      totalRange: 0,
      role: null,
      communityId: null,
    });
    user
      .save()
      .then((data) => {
        res.status(201).json({
          fullname: data.fullname,
          email: data.email,
          _id: data._id,
        });
      })
      .catch((err) => {
        next(err);
      });
  }

  static login(req, res, next) {
    User.findOne({ email: req.body.email })
      .exec()
      .then((result) => {
        if (result) {
          console.log("get people");
          if (checkPassword(req.body.password, result.password)) {
            let obj = {
              id: result._id,
              email: result.email,
              role: result.role,
              communityId: result.communityId,
            };
            res.status(200).json({ access_token: createToken(obj) });
            console.log("checked pass");
          } else {
            console.log("invalid pass");
            throw {
              status: 401,
              message: "Invalid email/password",
            };
          }
        } else {
          throw {
            status: 401,
            message: "Invalid email/password",
          };
        }
      })
      .catch((err) => {
        next(err);
      });
  }

  static trackHistory (req, res, next) {
    let userCommunity
    User.findOne({_id: req.loggedInUser.id})
      .exec()
      .then(data => {
        let history = data.history.concat({
          distance: req.body.distance,
          date: req.body.date
        })
        let track = data.totalRange + Number(req.body.distance)
        userCommunity = data.communityId

        return User.findOneAndUpdate({_id: req.loggedInUser.id}, {history: history, totalRange: track}, {useFindAndModify: false})
          .exec()
      })
      .then(data => {
        if (userCommunity) {
          return Community.findOne({_id: userCommunity})
            .exec()
        }
        else {
          return {
            status: 200,
            message : "Track history added successfully"
          }
        }
      })
      .then(data => {
        if (data.members) {
          let members = data.members.map(member => {
            if (member._id === req.loggedInUser.id){
              return {
                _id: member._id,
                email: member.email,
                fullname: member.fullname,
                totalRange: member.totalRange + Number(req.body.distance),
                role: member.role
              }
            }
            else {
              return member
            }
          })
          return Community.findOneAndUpdate({_id: data._id}, {members: members}, {useFindAndModify: false})
            .exec()
        }
        else {
          return {
            status: 200,
            message: "Track history added successfully"
          }
        }

      })
      .then(_ => {
        res.status(200).json({
          message: "Track history added successfully"
        })
      })
      .catch(err => {
        next(err)
      })
  }

  static getProfile (req, res, next) {
    User.findOne({_id: req.loggedInUser.id})
      .exec()
      .then(data => {
        res.status(200).json(data)
      })
      .catch(err => {
        next(err)
      })
  }
  // static getAllUser(req, res, next) {
  //     User.find()
  //     .exec()
  //     .then(data => {
  //         res.json(data)
  //     })
  //     .catch(err => {
  //         res.json(err)
  //     })
  // }

  // static deleteUser (req, res, next) {
  //     User.findOneAndDelete({_id: req.params.userId})
  //         .exec()
  //         .then(_ => {
  //             res.status(200).json("deleted")
  //         })
  //         .catch(err => {
  //             next(err)
  //         })
  // }
}
module.exports = UserController;
