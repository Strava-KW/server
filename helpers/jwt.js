const jwt = require('jsonwebtoken')

function createToken(data) {
    const access_token = jwt.sign(data, process.env.SECRET_JWT)
    return access_token
}

function verifyToken(token) {
    const decode = jwt.verify(token, process.env.SECRET_JWT)
    return decode
}

module.exports = {
    createToken,
    verifyToken
}