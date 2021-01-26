const User  = require('../models/User')
const { verifyToken } = require('../helpers/jwt')

module.exports = async (req, res, next) => {
    try {

        const token = req.headers.access_token
        if (!token) {
            throw({
                status: 401,
                message: 'Please login first'
            })
        } else {
            const decoded = verifyToken(token)
            // console.log(decoded)
            req.loggedInUser = decoded
            const user = await User.findOne({_id: decoded.id})
            if (user) {
                next()
            } else {
                res.status(401).json({message: 'Please login first'})                
            }
        }
    } catch (error) {
        next (error)
    }
}