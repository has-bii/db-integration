require("dotenv").config();
const fs = require("fs");
const { insertLeftConfig } = require("./compareConfig");

function readErrorConfig() {
  try {
    const filePath = process.env.ERROR_CONFIG_FILE_PATH;
    let jsonData;

    if (fs.existsSync(filePath)) {
      jsonData = fs.readFileSync(filePath, "utf-8");

      if (typeof jsonData === "string") jsonData = [];
    } else {
      fs.writeFileSync(filePath, "[]", "utf-8");
      jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }

    return jsonData;
  } catch (error) {
    console.error(
      "An error has occurred while reading Error Config File: ",
      error
    );
  }
}

function writeErrorConfig(newErrorConfig) {
  try {
    // Read the existed Error Config
    var errorConfig = readErrorConfig();

    // Adding the new Error Config
    errorConfig = insertLeftConfig(errorConfig, newErrorConfig);

    // Writing New Error Config
    fs.writeFileSync(
      process.env.ERROR_CONFIG_FILE_PATH,
      JSON.stringify(errorConfig, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Failed to write error config file:", error);
  }
}

function writeNewConfig(newConfig) {
  try {
    const configFilePath = process.env.CONFIG_FILE_PATH;

    // Writing new config File
    fs.writeFile(
      configFilePath,
      JSON.stringify(newConfig, null, 2),
      { flag: "w+" },
      (err) => {}
    );
  } catch (error) {
    console.error(
      "An error has occurred while writing new Config file: ",
      error
    );
  }
}

function insertToConfig(newConfig) {
  try {
    const configFilePath = process.env.CONFIG_FILE_PATH;

    // Reading config file
    const configFile = JSON.parse(fs.readFileSync(configFilePath, "utf-8"));

    // Adding new Config to main Config
    const insertedConfig = insertLeftConfig(configFile, newConfig);

    // Writing new config
    writeNewConfig(insertedConfig);
  } catch (error) {
    console.error(
      "An error has occurred while Inserting to Config file: ",
      error
    );
  }
}

module.exports = { insertToConfig, writeErrorConfig, writeNewConfig };
