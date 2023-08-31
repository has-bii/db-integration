const fs = require("fs");
const mainBackup = require("./mainBackup");
const checkAllConfig = require("./checkConfig");

module.exports = async () => {
  const filePath = `log/json/errorConfig.json`;

  let config;

  console.log("Reading file: ", filePath);
  if (!fs.existsSync(filePath)) {
    console.log("Error detected");
    return;
  }

  config = JSON.parse(fs.readFileSync(filePath, "utf8"));

  if (config.length === 0) {
    console.log("No error detected");
    return;
  }

  console.log("Do backup with error config file");

  if (checkAllConfig(config)) {
    console.log("Do backup on error at ", new Date().toLocaleString());

    const status = mainBackup(config);

    if (!status) console.log("ERROR WHILE BACKUP ON ERROR CONFIG");
    else console.log("OK WHILE BACKUP ON ERROR CONFIG");
  }
};
