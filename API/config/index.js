const express = require("express");
const { getConfig, writeNewConfig } = require("../../lib/configHandler");
const router = express.Router();

router.get("/", (req, res) => {
  const config = getConfig();

  if (config) {
    res
      .status(200)
      .json({ message: "Config fetched successfully.", config: config });
  } else {
    res.status(400).json({ message: "Failed to fetch data!" });
  }
});

router.put("/update", (req, res) => {
  const { config } = req.body;

  const result = writeNewConfig(JSON.parse(config));

  if (result)
    res.status(200).json({
      message: "Config has been updated.",
    });
  else res.status(400).json({ message: "Failed to update Config!" });
});

module.exports = router;
