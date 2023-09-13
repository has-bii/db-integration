const express = require("express");
const router = express.Router();
const { main } = require("../../app/app");

let backup;
let intervals = [];

router.post("/start", (req, res) => {
  if (req.body.intervals) {
    let reqIntervals = req.body.intervals;

    reqIntervals = [
      ...reqIntervals.map((reqInt) => {
        if (reqInt.type === "hour") {
          reqInt.value < 1
            ? (reqInt.value = 1)
            : reqInt.value > 24
            ? (reqInt.value = 24)
            : (reqInt.value = reqInt.value);
        } else if (reqInt.type === "minute") {
          reqInt.value < 1
            ? (reqInt.value = 1)
            : reqInt.value > 60
            ? (reqInt.value = 60)
            : (reqInt.value = reqInt.value);
        }

        return reqInt;
      }),
    ];

    if (intervals.length === 0) intervals.push(...reqIntervals);
    else {
      intervals.unshift(
        ...reqIntervals.filter(
          (reqInt) =>
            !intervals.some(
              (int) =>
                JSON.stringify({ value: int.value, type: int.type }) ===
                JSON.stringify({ value: reqInt.value, type: reqInt.type })
            )
        )
      );

      intervals = [
        ...intervals.filter((int) =>
          reqIntervals.some(
            (intt) =>
              JSON.stringify({ value: int.value, type: int.type }) ===
              JSON.stringify({
                value: intt.value,
                type: intt.type,
              })
          )
        ),
      ];

      reqIntervals.forEach((reqInt, i) => {
        if (reqInt.status) {
          intervals[i].status = reqInt.status;
        } else {
          intervals[i].status = reqInt.status;
        }
      });
    }

    console.log("ReqIntervals: ", JSON.stringify(intervals, null, 2));

    // backup = main(interval);

    // console.log(`\n\nMAIN BACKUP STARTED EVERY ${interval} MINS \n\n`);

    res.status(200).json({ message: "Backup started", intervals });
  } else res.status(400).json({ message: "Intervals property is required!" });
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
    intervals,
  });
});

module.exports = router;
