const config = require("../config.json");

const json = ["connection", "DB"];
const connection = ["source", "target"];
const insideConnection = ["database", "user", "password", "host", "dialect"];
const DB = ["sourceTable", "targetTable", "filterByCol", "columns"];
const filterByCol = ["source", "target", "type"];
const columns = ["source", "target"];

const checkConfig = (config = {}) => {
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

  // Check DB
  if (Array.isArray(config.DB)) {
    for (let arrDB in config.DB) {
      const DBarr = config.DB[arrDB];
      for (let keyDB of DB) {
        if (!DBarr.hasOwnProperty(keyDB)) {
          conf.DB[arrDB][keyDB] = "MISSING!!!";
          missing = [...missing, keyDB];
          error++;
        }

        // Check filterBy
        if (keyDB === "filterBy") {
          if (typeof DBarr[keyDB] === "object" && Array.isArray(DBarr[keyDB])) {
            conf.DB[arrDB][keyDB] = "TYPE OF filterBy MUST BE AN OBJECT!";
            missing = [...missing, keyDB];
            error++;
          } else {
            //   Check inside filterBy
            for (let keyFilterBy of filterByCol) {
              if (!DBarr[keyDB].hasOwnProperty(keyFilterBy)) {
                conf.DB[arrDB][keyDB][keyFilterBy] = "MISSING!!!";
                missing = [...missing, keyDB];
                error++;
              }
            }
          }
        }

        // Check columns
        if (keyDB === "columns") {
          if (Array.isArray(DBarr[keyDB])) {
            if (DBarr[keyDB].length === 0) {
              conf.DB[arrDB][keyDB] = "columns ARRAY IS EMPTY!";
              missing = [...missing, keyDB];
              error++;
            } else {
              for (let arrCol in DBarr[keyDB]) {
                const COLarr = DBarr[keyDB][arrCol];

                //   Check inside columns
                if (typeof COLarr === "object" && !Array.isArray(COLarr)) {
                  for (let keyCol of columns) {
                    if (!COLarr.hasOwnProperty(keyCol)) {
                      conf.DB[arrDB][keyDB][arrCol][keyCol] = "MISSING!!!";
                      missing = [...missing, keyCol];
                      error++;
                    }
                  }
                } else {
                  conf.DB[arrDB][keyDB] =
                    "TYPE OF INSIDE OF columns array MUST BE AN OBJECT!";
                  missing = [...missing, keyDB];
                  error++;
                }
              }
            }
          } else {
            conf.DB[arrDB][keyDB] = "TYPE OF columns MUST BE AN ARRAY";
            missing = [...missing, keyDB];
            error++;
          }
        }
      }

      //   Check the error
      if (error !== 0) {
        return {
          ok: false,
          message: "Missing property: ==> " + missing.join(","),
          conf: { DB: ["...", conf.DB[arrDB], "..."] },
        };
      }
    }
  } else {
    conf.DB = "THIS TYPE MUST BE AN ARRAY";
    error++;
  }

  return { ok: true, message: null };
};

module.exports = checkConfig;
