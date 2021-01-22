const bcrypt = require("bcryptjs")

function verifyPassword(input, db){
  return bcrypt.compareSync(input, db);
}
module.exports = verifyPassword