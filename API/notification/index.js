const express = require("express");
const router = express.Router();
const fs = require("fs");
const { clearErrorJSON, readErrors } = require("../../lib/ErrorHandler");

router.get("/clear", (req, res) => {
  try {
    clearErrorJSON();

    res.status(200).json({ message: "Notifications have been cleared." });
  } catch (error) {
    res.status(400).json({ message: "Error while clearing notifications!" });
  }
});

router.get("/read", (req, res) => {
  try {
    readErrors();

    res.status(200).json({ message: "Notifications have been read." });
  } catch (error) {
    res.status(400).json({ message: "Error while reading notifications!" });
  }
});

module.exports = router;
