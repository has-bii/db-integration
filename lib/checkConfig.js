const json = ["connection", "tables"];
const connection = ["source", "target"];
const insideConnection = ["database", "user", "password", "host", "dialect"];
const tables = ["sourceTable", "targetTable", "filterByCol", "columns"];
const filterByCol = ["source", "target", "type"];
const columns = ["source", "target"];

function checkConfig(config = {}) {
  let conf = config;
  let error = 0;
  let missing = [];

  // Check outer config
  for (let key of json) {
    if (!config.hasOwnProperty(key)) {
      conf[key] = "MISSING!!!";
      missing = [...missing, key];
      error++;
    }
  }

  if (error !== 0) {
    return {
      ok: false,
      message: "Missing property: ==> " + missing.join(","),
      conf,
    };
  }

  // Check connection
  if (
    typeof config.connection === "object" &&
    Array.isArray(config.connection)
  ) {
    conf.connection = "THIS TYPE MUST BE AN OBJECT";
    error++;
  } else {
    for (let keyConn of connection) {
      if (!config.connection.hasOwnProperty(keyConn)) {
        conf.connection[keyConn] = "MISSING!!!";
        missing = [...missing, keyConn];
        error++;
      } else {
        if (
          typeof config.connection[keyConn] === "object" &&
          Array.isArray(config.connection[keyConn])
        ) {
          conf.connection[keyConn] = "THIS TYPE MUST BE AN OBJECT";
          error++;
        }
      }

      //   Check inside source and target
      for (let keyInConn of insideConnection) {
        if (!config.connection[keyConn].hasOwnProperty(keyInConn)) {
          conf.connection[keyConn][keyInConn] = "MISSING!!!";
          missing = [...missing, keyInConn];
          error++;
        }
      }
    }
  }

  //   Return error of connection
  if (error !== 0) {
    return {
      ok: false,
      message: "Missing property: ==> " + missing.join(","),
      conf,
    };
  }

  // Check tables
  if (Array.isArray(config.tables)) {
    for (let arrTables in config.tables) {
      const tablesArr = config.tables[arrTables];
      for (let keyTables of tables) {
        if (!tablesArr.hasOwnProperty(keyTables)) {
          conf.tables[arrTables][keyTables] = "MISSING!!!";
          missing = [...missing, keyTables];
          error++;
        }

        // Check filterBy
        if (keyTables === "filterBy") {
          if (
            typeof tablesArr[keyTables] === "object" &&
            Array.isArray(tablesArr[keyTables])
          ) {
            conf.tables[arrTables][keyTables] =
              "TYPE OF filterBy MUST BE AN OBJECT!";
            missing = [...missing, keyTables];
            error++;
          } else {
            //   Check inside filterBy
            for (let keyFilterBy of filterByCol) {
              if (!tablesArr[keyTables].hasOwnProperty(keyFilterBy)) {
                conf.tables[arrTables][keyTables][keyFilterBy] = "MISSING!!!";
                missing = [...missing, keyTables];
                error++;
              }
            }
          }
        }

        // Check columns
        if (keyTables === "columns") {
          if (Array.isArray(tablesArr[keyTables])) {
            if (tablesArr[keyTables].length > 0) {
              for (let arrCol in tablesArr[keyTables]) {
                const COLarr = tablesArr[keyTables][arrCol];

                //   Check inside columns
                if (typeof COLarr === "object" && !Array.isArray(COLarr)) {
                  for (let keyCol of columns) {
                    if (!COLarr.hasOwnProperty(keyCol)) {
                      conf.tables[arrTables][keyTables][arrCol][keyCol] =
                        "MISSING!!!";
                      missing = [...missing, keyCol];
                      error++;
                    }
                  }
                } else {
                  conf.tables[arrTables][keyTables] =
                    "TYPE OF INSIDE OF columns array MUST BE AN OBJECT!";
                  missing = [...missing, keyTables];
                  error++;
                }
              }
            } else {
              conf.tables[arrTables][keyTables] =
                "Columns MUST NOT BE AN EMPTY ARRAY";
              missing = [...missing, keyTables];
              error++;
            }
          } else {
            conf.tables[arrTables][keyTables] =
              "TYPE OF columns MUST BE AN ARRAY";
            missing = [...missing, keyTables];
            error++;
          }
        }
      }

      //   Check the error
      if (error !== 0) {
        return {
          ok: false,
          message: "Missing property: ==> " + missing.join(","),
          conf: { tables: ["...", conf.tables[arrTables], "..."] },
        };
      }
    }

    //   Check the error
    if (error !== 0) {
      return {
        ok: false,
        message: "Missing property: ==> " + missing.join(","),
        conf: { connection: "...", tables: conf.tables },
      };
    }
  } else {
    conf.tables = "THIS TYPE MUST BE AN ARRAY";
    error++;
  }

  //   Check the error
  if (error !== 0) {
    return {
      ok: false,
      message: "Missing property: ==> " + missing.join(","),
      conf,
    };
  }

  return { ok: true, message: "Configuration is ok." };
}

function checkAllConfig(config) {
  console.log("Checking all CONFIGURATION file...");

  let results = [];

  for (let i in config) {
    const conf = config[i];

    const result = checkConfig(conf);

    if (!result.ok) results = [...results, { index: i, ...result }];
  }

  if (results.length > 0) {
    console.log("ERROR: \n", JSON.stringify(results, null, 2));
    return false;
  } else {
    console.log("Config status OK!");
    return true;
  }
}

module.exports = { checkAllConfig, checkConfig };
