const express = require("express");
const router = express.Router();
const { main } = require("../../app/app");

let backup;
let timestamp;
let interval = process.env.TIME_INTERVAL;
let status = false;

router.post("/start", (req, res) => {
  if (!backup) {
    if (req.body.timeInterval) interval = req.body.timeInterval;

    backup = main(interval);

    timestamp = new Date();

    status = true;

    console.log(`\n\nMAIN BACKUP STARTED EVERY ${interval} MINS \n\n`);

    res
      .status(200)
      .json({ message: "Backup started", timestamp, interval, status });
  } else {
    res.status(200).json({
      message: "Backup is already running",
      timestamp,
      interval,
      status,
    });
  }
});

router.get("/stop", (req, res) => {
  if (!backup) {
    res
      .status(200)
      .json({ message: "Backup is not running", timestamp, status });
  } else {
    backup.stop();

    backup = null;

    timestamp = new Date();

    status = false;

    console.log("\n\nMAIN BACKUP STOPPED\n\n");

    res.status(200).json({ message: "Backup is stopped", timestamp, status });
  }
});

router.post("/restart", (req, res) => {
  if (req.body.timeInterval) interval = req.body.timeInterval;

  if (backup) backup.stop();

  backup = main(interval);

  timestamp = new Date();

  status = true;

  console.log(`\n\nMAIN BACKUP RESTARTED EVERY ${interval} MINS \n\n`);

  res
    .status(200)
    .json({ message: "Backup restarted", timestamp, interval, status });
});

router.get("/isRunning", (req, res) => {
  if (!backup) {
    res.status(200).json({
      message: "Backup is not running.",
      timestamp,
      status,
      interval,
    });
  } else {
    res
      .status(200)
      .json({ message: "Backup is running", timestamp, status, interval });
  }
});

module.exports = router;
