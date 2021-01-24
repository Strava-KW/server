const User = require('../models/User')
const { checkPassword } = require('../helpers/bcrypt')
const { createToken } = require('../helpers/jwt')

class UserController {
    static register(req, res, next) {
        const user = new User({
            fullname: req.body.fullname,
            email: req.body.email,
            password: req.body.password,
            history: [],
            totalRange: 0,
            role: null,
            communityId: null
        })
        user
        .save()
        .then(data => {
            res.status(201).json({
                fullname: data.fullname,
                email: data.email,
                _id: data._id
            })
        })
        .catch(err => {
            next(err)
        })
    }

    static login(req, res, next) {
        User.findOne({email: req.body.email})
            .exec()
            .then(result => {
                if (result) {
                    console.log("get people")
                    if (checkPassword(req.body.password, result.password)){
                        let obj = {
                            id: result._id,
                            email: result.email,
                            role: result.role,
                            communityId: result.communityId
                        }
                        res.status(200).json({access_token: createToken(obj)})
                        console.log("checked pass")
                    }
                    else {
                        console.log("invalid pass")
                        throw {
                            status: 401,
                            message: "Invalid email/password"
                        }
                        
                    }
                }
                else {
                    throw {
                        status: 401,
                        message: "Invalid email/password"
                    }
                }
            })
            .catch(err => {
                next(err)
            })
    }

    static getProfile (req, res, next) {
        User.findOne({_id: req.loggedInUser.id})
            .exec()
            .then(data => {
                res.status(200).json({
                    _id: data._id,
                    fullname: data.fullname,
                    email: data.email,
                    communityId: data.communityId,
                    history: data.history,
                    role: data.role
                })
            })
            .catch(err => {
                next(err)
            })
    }

    static pushToHistory (req, res, next) {
        User.findOne ({_id: req.loggedInUser.id})
            .exec()
            .then(data => {
                let history = data.history.concat({date: req.body.date, distance: req.body.distance})
                let totalRange = data.totalRange + Number(req.body.distance)
                return User.findOneAndUpdate({_id: req.loggedInUser.id}, {history: history, totalRange: totalRange}, {useFindAndModify: false})
                    .exec()
            })
            .then(_ => {
                res.status(200).json({
                    message: "History and total range successfully updated"
                })
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
module.exports = UserController