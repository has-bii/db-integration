const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const getSecretKey = require("../../lib/getSecretKey")

// Define API endpoints and route handlers
router.post("/", (req, res) => {
  const { password } = req.body

  if (process.env.PASSWORD || "service" === password) {
    jwt.sign("Logged", getSecretKey(), (err, token) => {
      if (err) {
        console.log(err)
        return res.status(500).json({ message: "Error generating token" })
      }
      res
        .status(200)
        .cookie("access_token", token, {
          sameSite: "strict",
          secure: true,
        })
        .json({ message: "Login successful" })
    })
  } else {
    res.status(401).json({ message: "Incorrect password" })
  }
})

// Add more routes as needed

module.exports = router
