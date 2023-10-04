const express = require("express")
const router = express.Router()
const fs = require("fs")

router.get("/", (req, res) => {
  try {
    const LOG_ERROR_FOLDER = process.env.LOG_ERROR_FOLDER || "src/log"

    const filesNames = fs
      .readdirSync(LOG_ERROR_FOLDER)
      .filter((file) => file !== ".gitignore")

    const data = filesNames.map((file) => {
      const temp = {
        name: file,
        log: fs.readFileSync(`${LOG_ERROR_FOLDER}/${file}`, "utf-8"),
      }

      return temp
    })

    res.status(200).json({ message: "Fetched successfully.", data })
  } catch (error) {
    res.status(400).json({ message: "Error while reading files!" })
  }
})

module.exports = router
