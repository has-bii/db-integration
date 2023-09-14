const express = require("express");
const {
  getConfig,
  writeNewConfig,
  readErrorConfig,
  writeNewErrorConfig,
} = require("../../lib/configHandler");
const { newConnection } = require("../../lib/connectDB");
const router = express.Router();

router.get("/", (req, res) => {
  const config = getConfig();

  if (config) {
    res.status(200).json({ message: "Config fetched successfully.", config });
  } else {
    res.status(400).json({ message: "Failed to fetch data!" });
  }
});

router.post("/update", (req, res) => {
  const { config } = req.body;

  const result = writeNewConfig(JSON.parse(config));

  if (result)
    res.status(200).json({
      message: "Config has been saved.",
    });
  else res.status(400).json({ message: "Failed to update Config!" });
});

router.post("/check-connection", async (req, res) => {
  const config = JSON.parse(req.body.connection);

  const connection = newConnection(config);

  await connection
    .authenticate()
    .then(() => {
      connection.close();
      res
        .status(200)
        .json({ ok: true, message: `${config.database} connection ok` });
    })
    .catch((err) => {
      console.log("Error while checking connection: ", err);
      res.status(400).json({ ok: false, message: err });
    });
});

router.get("/error", (req, res) => {
  const config = readErrorConfig();

  if (config) {
    res.status(200).json({ message: "Config fetched successfully.", config });
  } else {
    res.status(400).json({ message: "Failed to fetch data!" });
  }
});

router.post("/error-save", (req, res) => {
  const { config } = req.body;

  const result = writeNewErrorConfig(JSON.parse(config));

  if (result)
    res.status(200).json({
      message: "Config has been updated.",
    });
  else res.status(400).json({ message: "Failed to update Config!" });
});

module.exports = router;
