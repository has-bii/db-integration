const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")

// Define API endpoints and route handlers
router.post("/", (req, res) => {
  const { password } = req.body

  if (process.env.PASSWORD || "service" === password) {
    jwt.sign("Logged", process.env.SECRET_KEY, (err, token) => {
      if (err) {
        console.log(err)
        return res.status(500).json({ message: "Error generating token" })
      }
      res
        .status(200)
        .cookie("access_token", token, {
          sameSite: "strict",
        })
        .json({ message: "Login successful", access_token: token })
    })
  } else {
    res.status(401).json({ message: "Incorrect password" })
  }
})

// Add more routes as needed

module.exports = router
