const Community = require('../models/Community')
const User = require('../models/User')

class CommunityController {

    static addCommunity (req, res, next) {
        User.findOneAndUpdate({_id: req.loggedInUser.id}, {role: "admin"}, {new: true, useFindAndModify: false})
            .exec()
            .then(data => {
                let community = new Community ({
                    name: req.body.name,
                    members: [{
                        _id: data._id,
                        email: data.email,
                        fullname: data.fullname,
                        totalRange: data.totalRange,
                        role: data.role
                    }],
                    waitingList: [],
                    events: []
                })
                community
                .save()
                .then(data => {
                    res.status(200).json(data)
                    req.loggedInUser.communityId = data._id
                    return User.findOneAndUpdate({_id: req.loggedInUser.id}, {communityId: data._id}, {new: true, useFindAndModify: false})
                    .exec()
                })
            })
            .then(_ => {
                console.log("Updated")
            })
            .catch(error => {
                next(error)
            })
    }
   

    static showCommunity(req, res, next) {
        Community.find({}, function(err, result) {
            if(err){
                next(err)
            } else {
                res.status(200).json(result)
            }
        })
    }

    static joinCommunity (req, res, next) {
        let chosenCommunity
        Community.findOne({_id: req.params.communityId})
            .exec()
            .then(data => {
                chosenCommunity = data
                return User.findOneAndUpdate({_id: req.loggedInUser.id}, {role: "waiting"}, {new: true, useFindAndModify: false})
                .exec()

            })
            .then (data => {
                chosenCommunity.waitingList = chosenCommunity.waitingList.concat({
                    _id: data._id,
                    email: data.email,
                    fullname: data.fullname,
                    totalRange: data.totalRange,
                    role: data.role
                })
                return Community.findOneAndUpdate ({_id: chosenCommunity._id}, {waitingList: chosenCommunity.waitingList}, {new: true, useFindAndModify: false})
                    .exec()
            })
            .then(data => {
                res.status(200).json(data)
            })
            .catch(err => {
                next(err)
            })
    }

    static approveWaitingList (req, res, next) {
        let chosenCommunity;
        Community.findOne({_id: req.loggedInUser.communityId})
            .exec()
            .then(data => {
                chosenCommunity = data

                let onWaitingList = chosenCommunity.waitingList.filter(user => {
                    return user._id.toString() === req.params.userId
                })
                let onMembers = chosenCommunity.members.filter(user => {
                    return user._id.toString() === req.params.userId
                })
                if (onWaitingList.length && !onMembers.length) {
                    return User.findOneAndUpdate({_id: req.params.userId}, {role: "member", communityId: data._id}, {new: true, useFindAndModify: false})
                    .exec()
                }
                else {
                    throw {
                        status: 401,
                        message: "User is not on the waiting list/ already a member"
                    }
                }
            })
            .then(data => {
                let waitingList = chosenCommunity.waitingList.filter(wait => {
                    return wait._id.toString() !== data._id.toString()
                })
                let members = chosenCommunity.members.concat({
                    _id: data._id,
                    email: data.email,
                    fullname: data.fullname,
                    totalRange: data.totalRange,
                    role: data.role
                })
                return Community.findOneAndUpdate({_id: req.loggedInUser.communityId}, {waitingList: waitingList, members: members}, {new: true, useFindAndModify: false})
            })
            .then(data => {
                res.status(200).json(data)
            })
            .catch(err => {
                next(err)
            })
    }

    static rejectWaiting (req, res, next) {
        let chosenCommunity;
        Community.findOne({_id: req.loggedInUser.communityId})
            .exec()
            .then(data => {
                chosenCommunity = data

                let onWaitingList = chosenCommunity.waitingList.filter(user => {
                    return user._id.toString() === req.params.userId
                })
                if (onWaitingList.length) {
                    return User.findOneAndUpdate({_id: req.params.userId}, {role: null, communityId: null}, {new: true, useFindAndModify: false})
                    .exec()
                }
                else {
                    throw {
                        status: 401,
                        message: "User is not on the waiting list/ already a member"
                    }
                }
            })
            .then(data => {
                let waitingList = chosenCommunity.waitingList.filter(wait => {
                    return wait._id.toString() !== data._id.toString()
                })
                return Community.findOneAndUpdate({_id: req.loggedInUser.communityId}, {waitingList: waitingList}, {new: true, useFindAndModify: false})
            })
            .then(data => {
                res.status(200).json(data)
            })
            .catch(err => {
                next(err)
            })
    }
    static deleteCommunity (req, res, next) {
        Community.findOneAndDelete({_id: req.params.communityId}, {useFindAndModify: false})
            .exec()
            .then(data => {
                if (data) {
                    res.status(200).json("deleted")
                }
                else {
                    throw {
                        status: 404,
                        message: "Data not found"
                    }
                }
            })
            .catch(err => {
                next(err)
            })
    }
   
    static createEvent (req, res, next) {
        let chosenCommunity;
        let user;
        User.findOne({_id: req.loggedInUser.id})
            .exec()
            .then(data => {
                user = data
                return Community.findOne({_id: data.communityId})
                .exec()
            })
            .then(data => {
                chosenCommunity = data
                let event = {
                    name: req.body.name,
                    date: req.body.date,
                    time: req.body.time
                }
                let events = data.events.concat(event)
                return Community.findOneAndUpdate({_id: user.communityId}, {events: events}, {new: true, useFindAndModify: false})
            })
            .then(_ => {
                res.status(201).json("Data event berhasil ditambahkan")
            })

    }

}
module.exports = CommunityController