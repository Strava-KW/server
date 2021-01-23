const bcrypt = require('bcryptjs')

function checkPassword(password, passwordDB) {
    return bcrypt.compareSync(password, passwordDB)
}

module.exports = {
    checkPassword
}