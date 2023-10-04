const express = require("express")
const router = express.Router()
const fs = require("fs")
const {
  clearErrorJSON,
  readErrors,
  deleteErrorJSON,
} = require("../../lib/ErrorHandler")

router.get("/", (req, res) => {
  try {
    const FILE_PATH = process.env.ERROR_JSON_FILE || "src/error/error.json"

    const data = JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"))

    res
      .status(200)
      .json({ message: "Errors JSON has been fetched successfully.", data })
  } catch (error) {
    console.error("Error while fetching errors JSON\nError: ", error)
    res.status(400).json({ message: "Error while fetching errors JSON" })
  }
})

router.get("/clear", (req, res) => {
  try {
    clearErrorJSON()

    res.status(200).json({ message: "Notifications have been cleared." })
  } catch (error) {
    res.status(400).json({ message: "Error while clearing notifications!" })
  }
})

router.get("/read", (req, res) => {
  try {
    readErrors()

    res.status(200).json({ message: "Notifications have been read." })
  } catch (error) {
    res.status(400).json({ message: "Error while reading notifications!" })
  }
})

router.post("/delete", (req, res) => {
  try {
    const { data } = req.body

    deleteErrorJSON(data)

    res.status(200).json({ message: "Notification has been deleted." })
  } catch (error) {
    res.status(400).json({ message: "Error while deleting the notification!" })
  }
})

module.exports = router
