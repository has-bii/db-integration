const crypto = require("crypto")

const secretKey =
  process.env.SECRET_KEY || crypto.randomBytes(32).toString("hex")

function getSecretKey() {
  return secretKey
}

module.exports = getSecretKey
