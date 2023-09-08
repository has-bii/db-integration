const express = require("express");
const getColumns = require("../../lib/getColumns");
const router = express.Router();

router.post("/get-columns", async (req, res) => {
  const { connection, table } = req.body;

  const cols = await getColumns(connection, table);

  if (!connection) res.status(400).json({ message: "Connection is required!" });

  if (cols === null)
    res.status(400).json({ message: "Error while getting columns!" });
  else res.status(200).json({ message: "Fetched successfully", data: cols });
});

module.exports = router;
