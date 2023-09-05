const express = require("express");
const router = express.Router();
const main = require("../../app");

let backup;

router.get("/start", (req, res) => {
  if (!backup) {
    backup = main();

    res.status(200).json({ message: "Backup started." });
  } else {
    res.status(200).json({ message: "Backup is already running." });
  }
});

router.get("/stop", (req, res) => {
  if (!backup) {
    res.status(200).json({ message: "Backup is not running." });
  } else {
    backup.stop();

    backup = null;

    res.status(200).json({ message: "Backup is stopped." });
  }
});

router.get("/isRunning", (req, res) => {
  if (!backup) {
    res.status(200).json({ message: "Backup is not running." });
  } else {
    res.status(200).json({ message: "Backup is running." });
  }
});

module.exports = router;
