const fs = require("fs");
const { QueryTypes } = require("sequelize");
const config = require("../config.json");
const isEmpty = require("./isEmpty");
const getLastData = require("./getLastData");
const { getDataByPrimaryKey, getDataByTimestamp } = require("./getData");
const connectToDB = require("./connectDB");
const insertData = require("./insertData");
const { writeErrorJson } = require("./writeErrorJson");

const mainBackup = async (TIME_INTERVAL) => {
  console.log("TIME INTERVAL: ", TIME_INTERVAL, " mins\n");

  if (config.length === 0) throw new Error("Config file is empty");

  // Iterate Config File
  for (let i in config) {
    const conf = config[i];

    conf.id = i;

    try {
      // Make connections to the DB
      const [source_db, target_db] = await connectToDB(conf);

      // Iterate DB array
      for (let index in conf.DB) {
        const DB = conf.DB[index];

        console.log(
          `\n================ BACKUP FROM ${DB.sourceTable} TO ${DB.targetTable} ================\n\nCOLUMNS: `,
          JSON.stringify(DB.columns, null, 2)
        );

        const isTargetEmpty = await isEmpty(DB.targetTable, target_db);

        let data = [];

        if (isTargetEmpty) {
          //   IF TARGET TABLE IS EMPTY
          console.log("\nRetrieving all data...");

          data = await source_db.query(`SELECT * FROM ${DB.sourceTable}`, {
            type: QueryTypes.SELECT,
          });
        } else {
          // If TARGET TABLE IS NOT EMPTY

          const [lastData] = await getLastData(target_db, DB);

          // Get data by type
          if (DB.filterByCol.type === "PRIMARYKEY")
            data = await getDataByPrimaryKey(lastData, source_db, DB);
          else if (DB.filterByCol.type === "TIMESTAMP")
            data = await getDataByTimestamp(lastData, source_db, DB);
        }

        // Checking if data is empty
        console.log("\nData count: ", data.length);

        //   If new data collected
        if (data.length > 0) {
          console.log(`\nInserting data to ${DB.targetTable} table`);

          // Inserting data and returns number of inserted row
          const rows = await insertData(
            target_db,
            data,
            DB.columns,
            DB.targetTable
          );

          console.log("\nInserted:", rows, "rows");
        } else {
          console.log("\nThere is no any data, no action done\n");
        }

        console.log("\n================ BACKUP SUCCESS ================\n");
      }

      // Close the connections
      source_db.close();
      target_db.close();
    } catch (error) {
      const message = `\n\n====================================================================\nAN ERROR HAS OCCURRED at ${new Date().toLocaleString()} :\n${error}\n====================================================================\n\n`;
      console.error(message);
      const pathFile = `./log/${new Date()
        .toLocaleDateString()
        .replaceAll("/", "-")}.text`;
      fs.writeFile(pathFile, message, { flag: "a" }, (err) => {});

      if (error.conf) writeErrorJson(error.conf);
    }
  }
};

module.exports = mainBackup;
