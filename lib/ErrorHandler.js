const fs = require("fs");
const compareConfig = require("./compareConfig");

function writeErrorConfig(conf) {
  try {
    const filePath = `log/json/errorConfig.json`;

    let jsonData;

    if (fs.existsSync(filePath)) {
      jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } else {
      fs.writeFileSync(filePath, "[]", "utf-8");
      jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    let isNew = true;

    if (jsonData.length > 0) {
      jsonData.forEach((data) => {
        if (compareConfig(data, conf)) isNew = false;
      });
    }

    // Push the config if it is new
    if (isNew) jsonData = [...jsonData, conf];

    // Get config file
    const fromConfigJson = JSON.parse(fs.readFileSync("config.json", "utf-8"));

    // Filter the config file with the error one
    const newConfig = fromConfigJson.filter((confJson) => {
      if (!compareConfig(confJson, conf)) return confJson;
    });

    // Create new config file
    fs.writeFile(
      "config.json",
      JSON.stringify(newConfig, null, 2),
      { flag: "w+" },
      (err) => {}
    );

    // Create error config file
    fs.writeFile(
      filePath,
      JSON.stringify(jsonData, null, 2),
      { flag: "w+" },
      (err) => {}
    );
  } catch (error) {
    console.error("Failed to write config file:", error);
  }
}

function writeErrorLog(error) {
  const message = `\n\n====================================================================\nAN ERROR HAS OCCURRED at ${new Date().toLocaleString()} :\n${error}\n====================================================================\n\n`;
  console.error(message);
  const pathFile = `log/${new Date()
    .toLocaleDateString()
    .replaceAll("/", "-")}.text`;
  fs.writeFile(pathFile, message, { flag: "a" }, (err) => {});
}

function queryErrorHandler(conf, table, errorName, error) {
  const errorTable = conf;

  errorTable.tables = [table];

  const err = new Error();
  err.name = errorName;
  err.message = error;
  err.tables = errorTable;

  throw err;
}

function tableErrorConfig(conf) {
  try {
    // Reading config file
    const configFile = JSON.parse(fs.readFileSync("config.json", "utf-8"));

    // Mapping config file
    const newConfigFile = configFile.map((confFile) => {
      if (
        JSON.stringify(confFile.connection) !== JSON.stringify(conf.connection)
      ) {
        return confFile;
      } else {
        const tables = confFile.tables.filter((table) => {
          return JSON.stringify(table) !== JSON.stringify(conf.tables[0]);
        });

        confFile.tables = tables;

        return confFile;
      }
    });

    // Create new config file
    fs.writeFile(
      "config.json",
      JSON.stringify(newConfigFile, null, 2),
      { flag: "w+" },
      (err) => {}
    );

    // Reading error config file
    const filePath = `log/json/errorConfig.json`;
    let errorConfigFile;

    if (fs.existsSync(filePath)) {
      errorConfigFile = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } else {
      fs.writeFileSync(filePath, "[]", "utf-8");
      errorConfigFile = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    // Mapping new Error Config File
    if (errorConfigFile.length === 0) {
      errorConfigFile = [conf];
    } else {
      const newErrorConfigFile = errorConfigFile.map((errConfig) => {
        if (compareConfig(errConfig, conf)) {
          return errConfig;
        } else {
          const newTables = errConfig.tables.filter((table) => {
            return JSON.stringify(table) !== JSON.stringify(conf.tables[0]);
          });

          errConfig.tables = [conf.tables[0], ...newTables];

          return errConfig;
        }
      });

      errorConfigFile = newErrorConfigFile;
    }

    // Create error config file
    fs.writeFile(
      filePath,
      JSON.stringify(errorConfigFile, null, 2),
      { flag: "w+" },
      (err) => {}
    );
  } catch (error) {
    console.error("Error while handling table error config\nError: ", error);
  }
}

module.exports = {
  writeErrorConfig,
  writeErrorLog,
  queryErrorHandler,
  tableErrorConfig,
};
