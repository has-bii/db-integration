const jwt = require("jsonwebtoken")
const getSecretKey = require("../lib/getSecretKey")

async function authenticateJWT(req, res, next) {
  const token = req.cookies.access_token

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  jwt.verify(token, getSecretKey(), (err) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" })
    }
    next()
  })
}

module.exports = authenticateJWT
