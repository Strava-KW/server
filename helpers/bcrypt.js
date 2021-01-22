const bcrypt = require('bcryptjs')

function hashPassword(password) {
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(password, salt)

    return hash
}

function checkPassword(password, passwordDB) {
    return bcrypt.compareSync(password, passwordDB)
}

module.exports = {
    hashPassword,
    checkPassword
}