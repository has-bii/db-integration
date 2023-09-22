const express = require("express")
const router = express.Router()
const { mainError } = require("../../app/app")

let backup
let timestamp
let interval = process.env.TIME_INTERVAL || 15
let status = false
let type = "interval"
let time = "23:59"

router.post("/start", (req, res) => {
  if (!backup) {
    req.body.type
      ? (type = req.body.type)
      : res.status(400).json({ message: "Type is required!" })

    if (type === "interval") {
      req.body.timeInterval
        ? (interval = req.body.timeInterval)
        : res.status(400).json({ message: "Time Interval is required!" })

      backup = mainError(interval, type)
    }

    if (type === "time") {
      req.body.time
        ? (time = req.body.time)
        : res.status(400).json({ message: "Time is required!" })

      backup = mainError(time, type)
    }

    timestamp = new Date()

    status = true

    console.log(
      `\n\nBACKUP ON ERROR STARTED and PERFORMS EVERY ${
        type === "interval" ? interval + " MINS" : "AT " + time
      } \n\n`
    )

    res.status(200).json({
      message: "Backup started",
      timestamp,
      interval,
      status,
      type,
      time,
    })
  } else {
    res.status(200).json({
      message: "Backup is already running",
      timestamp,
      interval,
      status,
      type,
      time,
    })
  }
})

router.get("/stop", (req, res) => {
  if (!backup) {
    res
      .status(200)
      .json({ message: "Backup is not running", timestamp, status })
  } else {
    backup.stop()

    backup = null

    timestamp = new Date()

    status = false

    console.log("\n\nBACKUP ON ERROR STOPPED\n\n")

    res.status(200).json({ message: "Backup is stopped", timestamp, status })
  }
})

router.post("/restart", (req, res) => {
  if (backup) backup.stop()

  req.body.type
    ? (type = req.body.type)
    : res.status(400).json({ message: "Type is required!" })

  if (type === "interval") {
    req.body.timeInterval
      ? (interval = req.body.timeInterval)
      : res.status(400).json({ message: "Time Interval is required!" })

    backup = mainError(interval, type)
  }

  if (type === "time") {
    req.body.time
      ? (time = req.body.time)
      : res.status(400).json({ message: "Time is required!" })

    backup = mainError(time, type)
  }

  timestamp = new Date()

  status = true

  console.log(
    `\n\nBACKUP ON ERROR STARTED and PERFORMS EVERY ${
      type === "interval" ? interval + " MINS" : "AT " + time
    } \n\n`
  )

  res.status(200).json({
    message: "Backup started",
    timestamp,
    interval,
    status,
    type,
    time,
  })
})

router.get("/isRunning", (req, res) => {
  if (!backup) {
    res.status(200).json({
      message: "Backup is not running.",
      timestamp,
      status,
      interval,
      type,
      time,
    })
  } else {
    res.status(200).json({
      message: "Backup is running",
      timestamp,
      interval,
      status,
      type,
      time,
    })
  }
})

module.exports = router
