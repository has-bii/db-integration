const express = require("express");
const router = express.Router();
const { main } = require("../../app/app");

const intervals = [];

router.post("/start", (req, res) => {
  const reqIntervals = req.body.intervals;

  if (!reqIntervals) {
    return res.status(400).json({ message: "Intervals property is required!" });
  }

  // Stop and clear existing cron jobs
  intervals.forEach((interval) => {
    if (interval.status === true && interval.cronJob) {
      interval.cronJob.stop();
      interval.cronJob = null;
    }
  });

  intervals.length = 0; // Clear the intervals array

  // Modify and add new intervals
  reqIntervals.forEach((reqInt) => {
    if (reqInt.type === "hour") {
      reqInt.value = Math.max(1, Math.min(24, reqInt.value));
    } else if (reqInt.type === "minute") {
      reqInt.value = Math.max(1, Math.min(60, reqInt.value));
    }

    reqInt.status = !!reqInt.status; // Ensure status is a boolean
    intervals.push(reqInt);
  });

  // Remove deleted intervals
  intervals.slice().forEach((int, index) => {
    const exists = reqIntervals.some(
      (reqInt) => reqInt.value === int.value && reqInt.type === int.type
    );

    if (!exists) {
      intervals.splice(index, 1);
      if (int.cronJob) {
        int.cronJob.stop();
      }
    }
  });

  // Start new cron jobs
  intervals.forEach((int) => {
    if (int.status === true) {
      int.cronJob = main(int.value, int.type);
    }
  });

  res.status(200).json({
    message: "Backup started",
    intervals: intervals.map((int) => ({
      value: int.value,
      type: int.type,
      status: int.status,
    })),
  });
});

router.get("/stop", (req, res) => {
  if (!backup) {
    res.status(200).json({ message: "Backup is not running", timestamp });
  } else {
    backup.stop();

    backup = null;

    timestamp = new Date();

    console.log("\n\nMAIN BACKUP STOPPED\n\n");

    res.status(200).json({ message: "Backup is stopped", timestamp });
  }
});

router.post("/restart", (req, res) => {
  if (req.body.timeInterval) interval = req.body.timeInterval;

  if (backup) backup.stop();

  backup = main(interval);

  timestamp = new Date();

  console.log(`\n\nMAIN BACKUP RESTARTED EVERY ${interval} MINS \n\n`);

  res.status(200).json({ message: "Backup restarted", timestamp, interval });
});

router.get("/isRunning", (req, res) => {
  res.status(200).json({
    message: "Backup is not running.",
    intervals: intervals.map((int) => {
      return { value: int.value, type: int.type, status: int.status };
    }),
  });
});

module.exports = router;
