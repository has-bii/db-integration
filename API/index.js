const express = require("express");
const router = express.Router();
const authenticationMiddleware = require("../middleware/jwtVerify");

// Import your API route files

const auth = require("./auth");
const backup = require("./backup");
const config = require("./config");
const errorBackup = require("./errorBackup");
const log = require("./log");
const db = require("./db");

// Mount your API route files on the router

router.use("/login", auth);

router.use(authenticationMiddleware);

router.use("/backup", backup);

router.use("/error-backup", errorBackup);

router.use("/config", config);

router.use("/log", log);

router.use("/db", db);

module.exports = router;
