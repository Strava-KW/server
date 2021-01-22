const User = require('../models/user')
const { hashPassword } = require('../helpers/bcrypt')
const { checkPassword } = require('../helpers/bcrypt')
const { createToken } = require('../helpers/jwt')

class UserController {
    static register(req, res, next) {
        const securePassword = hashPassword(req.body.password)
        const user = new User({
            fullname: req.body.fullname,
            email: req.body.email,
            password: securePassword,
            history: [],
            totalrange: 0,
            role: null,
            communityName: null
        })
        user
        .save()
        .then(data => {
            console.log(data)
        })
        .catch(err => {
            console.log(err)
        })
    }

    static login(req, res, next) {
        User.findOne({email: req.body.email}, function(err, result) {
            if (err) {
                console.log(err)
            } else {
                if(checkPassword(req.body.password, result.password)) {
                    const obj = {
                        id: result._id,
                        fullname: result.fullname,
                        email: result.email
                    }
                    res.json({token: createToken(obj), id: obj.id, fullname: obj.fullname, email: obj.email})
                }
            }
        })
    }
}
module.exports = UserController