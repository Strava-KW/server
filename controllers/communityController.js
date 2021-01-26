const Community = require('../models/Community')
const User = require('../models/User')
const Event = require('../models/Event')

class CommunityController {

    static addCommunity (req, res, next) {
        User.findOne({_id: req.loggedInUser.id})
            .exec()
            .then(data => {
                let community = new Community ({
                    name: req.body.name,
                    members: [{
                        _id: data._id,
                        email: data.email,
                        fullname: data.fullname,
                        totalRange: data.totalRange,
                        role: "admin"
                    }],
                    waitingList: [],
                    events: []
                })
                community
                .save()
                .then(data => {
                    req.loggedInUser.communityId = data._id
                    return User.findOneAndUpdate({_id: req.loggedInUser.id}, {communityId: data._id, role: "admin"}, {new: true, useFindAndModify: false})
                    .exec()
                })
            })
            .then(_ => {
                res.status(200).json({
                    message: "User is an admin now"
                })
            })
            .catch(error => {
                next(error)
            })
    }
   
    static findOne (req, res, next) {
        User.findOne({_id: req.loggedInUser.id})
            .exec()
            .then(data => {
                if (data.role === "admin" || data.role === "member"){
                    return Community.findOne ({_id: data.communityId})
                    .exec()
                }
                else if (data.role === null) {
                    return Community.find()
                    .exec()
                }
                else {
                    return {message: "Your request for join community has been sent"}
                }
            })
            .then(data => {
                res.status(200).json(data)
            })
            .catch(err => {
                next(err)
            })
    }

    // static showCommunity(req, res, next) {
    //     Community.find({}, function(err, result) {
    //         if(err){
    //             next(err)
    //         } else {
    //             res.status(200).json(result)
    //         }
    //     })
    // }

    static joinCommunity (req, res, next) {
        let chosenCommunity
        let waitingUser;
        Community.findOne({_id: req.params.communityId})
            .exec()
            .then(data => {
                chosenCommunity = data
                return User.findOneAndUpdate({_id: req.loggedInUser.id}, {role: "waiting"}, {new: true, useFindAndModify: false})
                .exec()

            })
            .then (data => {
                waitingUser = data
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
                res.status(200).json({
                    message: `${waitingUser.fullname} request to join community has been sent`
                })
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
                res.status(200).json({
                    message: "The member has been approved"
                })
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
                res.status(200).json({
                    message: "The member has been rejected"
                })
            })
            .catch(err => {
                next(err)
            })
    }

    // static deleteCommunity (req, res, next) {
    //     Community.findOneAndDelete({_id: req.params.communityId}, {useFindAndModify: false})
    //         .exec()
    //         .then(data => {
    //             if (data) {
    //                 res.status(200).json("deleted")
    //             }
    //             else {
    //                 throw {
    //                     status: 404,
    //                     message: "Data not found"
    //                 }
    //             }
    //         })
    //         .catch(err => {
    //             next(err)
    //         })
    // }
   
    static createEvent (req, res, next) {
        let event;
        const newEvent = new Event({
            name: req.body.name,
            location: req.body.location,
            date: req.body.date,
            time: req.body.time,
            hashed: req.body.location
        })
        newEvent
        .save()
        .then(data => {
            event = data
            return User.findOne({_id: req.loggedInUser.id})
                .exec()
        })
        .then(data => {
            return Community.findOne({_id: data.communityId})
                .exec()
        })
        .then(data => {
            let events = data.events.concat(event)
            return Community.findOneAndUpdate({_id: data.id}, {events: events}, {useFindAndModify: false})
            .exec()
        })
        .then(_ => {
            res.status(201).json({
                message: "Event created"
            })
        })
        .catch(err => {
            next(err)
        })

    }

    static deleteEvent (req, res, next) {
        User.findOne({_id: req.loggedInUser.id})
            .exec()
            .then(data => {
                return Community.findOne({_id: data.communityId})
                    .exec()
            })
            .then(data => {
                let selectedEvent = data.events.filter(event => {
                    return event._id.toString() === req.params.eventId
                })
                if (selectedEvent.length) {
                    let events = data.events.filter(event => {
                        return event._id.toString() !== req.params.eventId
                    })
                    return Community.findOneAndUpdate({_id: data._id}, {events: events}, {useFindAndModify: false})
                        .exec()
                }
                else {
                    throw {
                        status: 404,
                        message: "Data not found"
                    }
                }
            })
            .then(_ => {
                return Event.findOneAndDelete({_id: req.params.eventId})
                    .exec()
            })
            .then(_ => {
                res.status(200).json({
                    message: "Deleted"
                })
            })
            .catch(err => {
                next(err)
            })
    }
}
module.exports = CommunityController