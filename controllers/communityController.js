const Community = require('../models/community')

class CommunityController {
    static addCommunity(req, res, next) {
        const community = new Community({
            name: req.body.name,
            members: [],
            wishlist: [],
            events: []
        })
        community
        .save()
        .then(data => {
            console.log(data)
        })
        .catch(err => {
            console.log(err)
        })
    }

    static showCommunity(req, res, next) {
        Community.find({}, function(err, result) {
            if(err){
                console.log(err)
            } else {
                res.json(result)
            }
        })
    }

    static deleteCommunity(req, res, next) {
        Community.remove({}, function(err, result) {
            if(err){
                console.log(err)
            } else 
                console.log("data has been deleted")
        })
    }

    static findById(req, res, next) {
        Community.findById(req.params.id, function(err, result) {
            if(err) {
                console.log(err)
            } else {
                res.json(result)
            }
        })
    }

}
module.exports = CommunityController