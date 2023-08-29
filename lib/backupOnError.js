const fs = require("fs");
const mainBackup = require("./mainBackup");
const checkAllConfig = require("./checkAllConfig");

module.exports = async () => {
  const date = new Date().toLocaleDateString().replaceAll("/", "-");

  const filePath = `log/json/${date}.json`;

  let config;

  console.log("Reading file: ", filePath);
  if (!fs.existsSync(filePath)) {
    console.log("No error detected");
    return;
  }

  config = JSON.parse(fs.readFileSync(filePath, "utf8"));

  if (config.length === 0) {
    console.log("No error detected");
    return;
  }

  console.log("Do backup with error config file");

  if (checkAllConfig(config)) {
    mainBackup(config);

    console.log("Do backup on error at ", new Date().toLocaleString());
  }
};
