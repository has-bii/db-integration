const crypto = require("crypto")

const secretKey = crypto.randomBytes(32).toString("hex")

function getSecretKey() {
  return secretKey
}

module.exports = getSecretKey
