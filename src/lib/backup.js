const { QueryTypes } = require("sequelize")
const { connectToDB } = require("./connectDB")
const { writeErrorLog, queryErrorHandler } = require("./ErrorHandler")
const {
  isEmpty,
  getLastData,
  getDataByPrimaryKey,
  getDataByTimestamp,
  insertData,
  dataToQuery,
} = require("./queryHandler")
const { subLeftConfig } = require("./compareConfig")
const isValidDate = require("./isValidDate")

const backup = async (
  configuration,
  TIME_INTERVAL = null,
  type = null,
  writeError = false
) => {
  console.log("\n\nBACKUP AT ", new Date().toLocaleString())

  const config = JSON.parse(JSON.stringify(configuration))

  // Create new Error config
  const newErrorConfig = []

  // Iterate Config File
  for (const conf of config) {
    try {
      // Make connections to the DB
      const [source_db, target_db] = await connectToDB(conf)

      // Create new Error table array
      const newErrorTable = []

      // Iterate DB array
      for (const table of conf.tables) {
        // check intervals
        if (
          TIME_INTERVAL === type ||
          table.intervals.some(
            (int) => parseInt(int.value) === TIME_INTERVAL && int.type === type
          )
        ) {
          try {
            console.log(
              `\n================ BACKUP FROM ${table.sourceTable} TO ${table.targetTable} ================\n\nCOLUMNS: `,
              JSON.stringify(table.columns, null, 2)
            )

            const isTargetEmpty = await isEmpty(
              table.targetTable,
              target_db
            ).catch((error) => {
              queryErrorHandler(
                table,
                "Error has occurred while checking Target DB is empty",
                error
              )
            })

            let data = []

            if (isTargetEmpty) {
              //   IF TARGET TABLE IS EMPTY
              console.log("\nRetrieving all data...")

              data = await source_db
                .query(`SELECT * FROM ${table.sourceTable}`, {
                  type: QueryTypes.SELECT,
                })
                .catch((error) => {
                  queryErrorHandler(
                    table,
                    `Error has occurred while retrieving all data from ${table.sourceTable}`,
                    error
                  )
                })
            } else {
              // If TARGET TABLE IS NOT EMPTY

              const [lastData] = await getLastData(target_db, table).catch(
                (error) => {
                  queryErrorHandler(
                    table,
                    `Error has occurred while retrieving last data from ${table.targetTable} table`,
                    error
                  )
                }
              )

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
                  )
                })
              else if (table.filterByCol.type === "TIMESTAMP")
                data = await getDataByTimestamp(
                  lastData,
                  source_db,
                  table
                ).catch((error) => {
                  queryErrorHandler(
                    table,
                    `Error has occurred while get data by timestamp from ${table.sourceTable} table`,
                    error
                  )
                })
            }

            // Checking if data is empty
            console.log("\nData count: ", data.length)

            //   If new data collected
            if (data.length > 0) {
              console.log(`\nInserting data to ${table.targetTable} table`)

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
                )
              })

              console.log("\nInserted:", rows, "rows")
            } else {
              console.log("\nThere is no any data, no action done\n")
            }

            console.log("\n================ BACKUP SUCCESS ================\n")
          } catch (error) {
            console.error("An Error has occurred in Tables Section")

            if (writeError) writeErrorLog(error)

            // Inserting the error table
            if (error.table) newErrorTable.push(error.table)
          }
        }
      }

      // Iterate SQLS array
      for (const sql of conf.sqls) {
        // check intervals
        if (
          TIME_INTERVAL === type ||
          sql.intervals.some(
            (int) => parseInt(int.value) === TIME_INTERVAL && int.type === type
          )
        ) {
          try {
            console.log(
              `\n================ STARTING TO ${sql.label} SQL ================\n`
            )

            const { query } = sql

            if (sql.type === "read & write") {
              let results = []

              // check if there is filtering clause using last data
              const isLastDataExists = query.wheres.some(
                (item) => item.type === "last data"
              )

              if (!isLastDataExists) {
                // If there is no filtering clause using last data

                // Creating retrieving query string
                const getQuery = `SELECT ${query.columnsSQL
                  .map((item) => item.column + " AS " + `"${item.name}"`)
                  .join(", ")}\nFROM ${query.from} ${
                  query.joins.length !== 0
                    ? `\n${query.joins
                        .map(
                          (join) =>
                            join.type + " JOIN " + join.table + " ON " + join.on
                        )
                        .join("\n")}`
                    : ""
                }${
                  query.wheres.length !== 0
                    ? `\nWHERE${query.wheres
                        .map((where) => `${where.condition} ${where.clause}`)
                        .join(" ")}`
                    : ""
                }`

                // Retrieving data from source
                results = await source_db.query(getQuery, {
                  type: QueryTypes.SELECT,
                })
              } else {
                // Check if target table whether empty or not
                const isTableEmpty = await isEmpty(query.targetTable, target_db)

                if (isTableEmpty) {
                  // If target table is empty

                  // remove clause using last data
                  const newWheres = query.wheres.filter(
                    (item) => item.type !== "last data"
                  )

                  // Retrieving all rows
                  const getQuery = `SELECT ${query.columnsSQL
                    .map((item) => item.column + " AS " + `"${item.name}"`)
                    .join(", ")}\nFROM ${query.from} ${
                    query.joins.length !== 0
                      ? `\n${query.joins
                          .map(
                            (join) =>
                              join.type +
                              " JOIN " +
                              join.table +
                              " ON " +
                              join.on
                          )
                          .join("\n")}`
                      : ""
                  }${
                    newWheres.length !== 0
                      ? `\nWHERE${newWheres
                          .map((where) => `${where.condition} ${where.clause}`)
                          .join(" ")}`
                      : ""
                  }`

                  results = await source_db.query(getQuery, {
                    type: QueryTypes.SELECT,
                  })
                } else {
                  // If target table is not empty
                  // Getting clause using last data
                  const filteredColumns = query.wheres.filter(
                    (item) => item.type === "last data"
                  )

                  // Getting column name
                  const filteredColumn = filteredColumns[0].clause.split(":")[1]

                  // Retrieving last data
                  const [lastData] = await target_db.query(
                    `SELECT * FROM ${query.targetTable} ORDER BY ${filteredColumn} DESC LIMIT 1`,
                    {
                      type: QueryTypes.SELECT,
                    }
                  )

                  console.log(lastData)

                  // Creating retrieving data query from source table
                  const getDataQuery = `SELECT ${query.columnsSQL
                    .map((item) => item.column + " AS " + `"${item.name}"`)
                    .join(", ")}\nFROM ${query.from} ${
                    query.joins.length !== 0
                      ? `\n${query.joins
                          .map(
                            (join) =>
                              join.type +
                              " JOIN " +
                              join.table +
                              " ON " +
                              join.on
                          )
                          .join("\n")}`
                      : ""
                  }${
                    query.wheres.length !== 0
                      ? `\nWHERE${query.wheres
                          .map((where) => `${where.condition} ${where.clause}`)
                          .join(" ")}`
                      : ""
                  }`

                  if (isValidDate(lastData[filteredColumn])) {
                    const timestamp = new Date(lastData[filteredColumn])

                    const millisecond = timestamp.getMilliseconds()

                    const newTimestamp = new Date(timestamp).setMilliseconds(
                      millisecond + 1
                    )

                    lastData[filteredColumn] = new Date(newTimestamp)
                  }

                  results = await source_db.query(getDataQuery, {
                    type: QueryTypes.SELECT,
                    replacements: lastData,
                  })
                }
              }

              console.log("Retrieved Rows: ", results.length, "\n")

              // check whether results is empty or not
              if (results.length !== 0) {
                // Mapping value
                const values = dataToQuery(target_db, results, query.values)

                // Creating inserting query string
                const insertQuery = `INSERT INTO ${
                  query.targetTable
                } (${query.values.join(", ")})\nVALUES ${values}`

                // Inserting rows to target table
                const [result, insertedRows] = await target_db.query(
                  insertQuery,
                  {
                    type: QueryTypes.INSERT,
                  }
                )

                console.log("\nInserted Rows: ", insertedRows)
              }
            }

            console.log("\n================ RUN SQL SUCCESS ================\n")
          } catch (error) {
            console.error("An Error has occurred in SQL Section")

            if (writeError) writeErrorLog(error)
          }
        }
      }

      // If error table is not empty
      if (newErrorTable.length > 0) {
        const tempConf = conf
        tempConf.tables = newErrorTable
        newErrorConfig.push(tempConf)
      }

      // Close the connections
      source_db.close()
      target_db.close()
    } catch (error) {
      if (writeError) writeErrorLog(error)

      if (error.conf) newErrorConfig.push(error.conf)
    }
  }

  // Return New Error Config and no Error Config
  return [newErrorConfig, subLeftConfig(configuration, newErrorConfig)]
}

module.exports = backup
