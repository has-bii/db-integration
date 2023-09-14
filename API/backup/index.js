const express = require("express");
const router = express.Router();
const { main } = require("../../app/app");

const intervals = [];

router.post("/start", (req, res) => {
  try {
    const reqIntervals = req.body.intervals;

    if (!reqIntervals) {
      return res
        .status(400)
        .json({ message: "Intervals property is required!" });
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
      message: `${
        intervals.filter((int) => int.status).length
      } tasks are running`,
      intervals: intervals.map((int) => ({
        value: int.value,
        type: int.type,
        status: int.status,
      })),
    });
  } catch (error) {
    console.error("Error has occurred while starting task: ", error);
    res.status(400).json({ message: error });
  }
});

router.post("/start-all", (req, res) => {
  try {
    const reqIntervals = req.body.intervals;

    if (!reqIntervals) {
      return res
        .status(400)
        .json({ message: "Intervals property is required!" });
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

      reqInt.status = true; // Change all statuses to be true
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
      message: `${
        intervals.filter((int) => int.status).length
      } tasks are running`,
      intervals: intervals.map((int) => ({
        value: int.value,
        type: int.type,
        status: int.status,
      })),
    });
  } catch (error) {
    console.error("Error has occurred while starting task: ", error);
    res.status(400).json({ message: error });
  }
});

router.get("/stop-all", (req, res) => {
  try {
    // Stop and clear existing cron jobs
    intervals.forEach((interval) => {
      if (interval.cronJob) {
        interval.cronJob.stop();
        interval.cronJob = null;
      }
      interval.status = false;
    });

    res.status(200).json({
      message: "All tasks has been stopped",
      intervals: intervals.map((int) => {
        return { value: int.value, type: int.type, status: int.status };
      }),
    });
  } catch (error) {
    console.error("Error has occurred while stopping tasks: ", error);
    res.status(400).json({ message: error });
  }
});

router.post("/restart", (req, res) => {
  try {
    // Stop and clear existing cron jobs
    intervals.forEach((interval) => {
      if (interval.status === true && interval.cronJob) {
        interval.cronJob.stop();
        interval.cronJob = null;
      }
    });

    // Start new cron jobs
    intervals.forEach((int) => {
      if (int.status === true) {
        int.cronJob = main(int.value, int.type);
      }
    });

    res.status(200).json({
      message: "Backup restarted",
      intervals: intervals.map((int) => ({
        value: int.value,
        type: int.type,
        status: int.status,
      })),
    });
  } catch (error) {
    console.error("Error has occurred while restarting tasks: ", error);
    res.status(400).json({ message: error });
  }
});

router.get("/isRunning", (req, res) => {
  res.status(200).json({
    intervals: intervals.map((int) => {
      return { value: int.value, type: int.type, status: int.status };
    }),
  });
});

module.exports = router;
