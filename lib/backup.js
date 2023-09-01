const { QueryTypes } = require("sequelize");
const connectToDB = require("./connectDB");
const { writeErrorLog, queryErrorHandler } = require("./ErrorHandler");
const {
  isEmpty,
  getLastData,
  getDataByPrimaryKey,
  getDataByTimestamp,
  insertData,
} = require("./queryHandler");
const { subLeftConfig } = require("./compareConfig");

const backup = async (configuration) => {
  const config = JSON.parse(JSON.stringify(configuration));

  // Create new Error config
  const newErrorConfig = [];

  if (config.length === 0) throw new Error("Config file is empty");

  // Iterate Config File
  for (const conf of config) {
    try {
      // Make connections to the DB
      const [source_db, target_db] = await connectToDB(conf);

      // Create new Error table array
      const newErrorTable = [];

      // Iterate DB array
      for (const table of conf.tables) {
        try {
          console.log(
            `\n================ BACKUP FROM ${table.sourceTable} TO ${table.targetTable} ================\n\nCOLUMNS: `,
            JSON.stringify(table.columns, null, 2)
          );

          const isTargetEmpty = await isEmpty(
            table.targetTable,
            target_db
          ).catch((error) => {
            queryErrorHandler(
              table,
              "Error has occurred while checking Target DB is empty",
              error
            );
          });

          let data = [];

          if (isTargetEmpty) {
            //   IF TARGET TABLE IS EMPTY
            console.log("\nRetrieving all data...");

            data = await source_db
              .query(`SELECT * FROM ${table.sourceTable}`, {
                type: QueryTypes.SELECT,
              })
              .catch((error) => {
                queryErrorHandler(
                  table,
                  `Error has occurred while retrieving all data from ${table.sourceTable}`,
                  error
                );
              });
          } else {
            // If TARGET TABLE IS NOT EMPTY

            const [lastData] = await getLastData(target_db, table).catch(
              (error) => {
                queryErrorHandler(
                  table,
                  `Error has occurred while retrieving last data from ${table.targetTable} table`,
                  error
                );
              }
            );

            // Get data by type
            if (table.filterByCol.type === "PRIMARYKEY")
              data = await getDataByPrimaryKey(
                lastData,
                source_db,
                table
              ).catch((error) => {
                queryErrorHandler(
                  table,
                  `Error has occurred while get data by primary key from ${table.sourceTable} table`,
                  error
                );
              });
            else if (table.filterByCol.type === "TIMESTAMP")
              data = await getDataByTimestamp(lastData, source_db, table).catch(
                (error) => {
                  queryErrorHandler(
                    table,
                    `Error has occurred while get data by timestamp from ${table.sourceTable} table`,
                    error
                  );
                }
              );
          }

          // Checking if data is empty
          console.log("\nData count: ", data.length);

          //   If new data collected
          if (data.length > 0) {
            console.log(`\nInserting data to ${table.targetTable} table`);

            // Inserting data and returns number of inserted row
            const rows = await insertData(
              target_db,
              data,
              table.columns,
              table.targetTable
            ).catch((error) => {
              queryErrorHandler(
                table,
                `Error has occurred while inserting data to ${table.targetTable} table`,
                error
              );
            });

            console.log("\nInserted:", rows, "rows");
          } else {
            console.log("\nThere is no any data, no action done\n");
          }

          console.log("\n================ BACKUP SUCCESS ================\n");
        } catch (error) {
          console.error("An Error has occurred in Tables Section");

          writeErrorLog(error);

          // Inserting the error table
          if (error.table) newErrorTable.push(error.table);
        }
      }

      // If error table is not empty
      if (newErrorTable.length > 0) {
        const tempConf = conf;
        tempConf.tables = newErrorTable;
        newErrorConfig.push(tempConf);
      }

      // Close the connections
      source_db.close();
      target_db.close();
    } catch (error) {
      writeErrorLog(error);

      if (error.conf) newErrorConfig.push(error.conf);
    }
  }

  // Return New Error Config and no Error Config
  return [newErrorConfig, subLeftConfig(configuration, newErrorConfig)];
};

module.exports = backup;
