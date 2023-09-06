const express = require("express");
const { getConfig, writeNewConfig } = require("../../lib/configHandler");
const { checkConfig } = require("../../lib/checkConfig");
const { newConnection } = require("../../lib/connectDB");
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

router.post("/check", (req, res) => {
  const { config } = req.body;

  const result = checkConfig(JSON.parse(config));

  if (result.ok) {
    res.status(200).json(result);
  } else {
    res.status(400).json(result);
  }
});

router.post("/check-connection", async (req, res) => {
  const config = JSON.parse(req.body.connection);

  const connection = newConnection(config);

  await connection
    .authenticate()
    .then(() => {
      connection.close();
      res.status(200).json({ ok: true, message: "Connection ok." });
    })
    .catch((err) => {
      console.log("Error while checking connection: ", err);
      res.status(400).json({ ok: false, message: err });
    });
});

module.exports = router;
