const Community = require('../models/Community')
const User = require('../models/User')

class CommunityController {

    static addCommunity (req, res, next) {
        User.findOneAndUpdate({_id: req.loggedInUser.id}, {role: "admin"}, {new: true})
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
                    return User.findOneAndUpdate({_id: req.loggedInUser.id}, {communityId: data._id}, {new: true})
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
                return User.findOneAndUpdate({_id: req.loggedInUser.id}, {role: "waiting"}, {new: true})
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
                return Community.findOneAndUpdate ({_id: chosenCommunity._id}, {waitingList: chosenCommunity.waitingList}, {new: true})
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
        // Community.findOne({_id: req.loggedInUser.communityId})
        //     .exec()
        //     .then(data => {
        //         data.members = data.members.conc
        //     })
    }
    static deleteCommunity (req, res, next) {
        Community.findOneAndDelete({_id: req.params.communityId})
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
   
    // habis create community gimana cara biar ambil communityByIdnya? (lewat params atau req.loggedInUser.communityIdnya diganti)
    // kalau sudah di approve oleh yg bikin komunitas dan orang tersebut online, apa bisa langsung akses komunitasnya atau harus re-login
    // static findById(req, res, next) {
    //     Community.findById(req.params.id, function(err, result) {
    //         if(err) {
    //             console.log(err)
    //         } else {
    //             res.json(result)
    //         }
    //     })
    // }

}
module.exports = CommunityController