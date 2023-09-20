const { QueryTypes } = require("sequelize");

const getDataByPrimaryKey = async (lastData, source_db, table) => {
  const data = await source_db.query(
    `SELECT * FROM ${table.sourceTable} WHERE ${table.filterByCol.source} > :filteredData`,
    {
      type: QueryTypes.SELECT,
      replacements: {
        filteredData: lastData[table.filterByCol.target],
      },
    }
  );

  return data;
};

const getDataByTimestamp = async (lastData, source_db, table) => {
  // Set millisecond to be 0 and add 1 second
  const timestamp = new Date(
    new Date(lastData[table.filterByCol.target]).setMilliseconds(0)
  ).getTime();

  const data = await source_db.query(
    `SELECT * FROM ${table.sourceTable} WHERE ${table.filterByCol.source} >= :filteredData`,
    {
      type: QueryTypes.SELECT,
      replacements: {
        filteredData: new Date(timestamp + 1000),
      },
    }
  );

  return data;
};

const getLastData = async (target_db, table) => {
  const data = await target_db.query(
    `SELECT * FROM ${table.targetTable} ORDER BY ${table.filterByCol.target} DESC LIMIT 1`,
    {
      type: QueryTypes.SELECT,
    }
  );

  return data;
};

const insertData = async (target_db, data, cols, targetTable) => {
  function dataToQuery(target_db, data, columns) {
    const query = data
      .map((value) => {
        const cols = columns
          .map((col) => target_db.escape(value[col.source]))
          .join(", ");

        return `(${cols})`;
      })
      .join(", ");

    return query;
  }

  const columns = cols.map((col) => col.target);
  const values = dataToQuery(target_db, data, cols);

  const [results, rows] = await target_db.query(
    `INSERT INTO ${targetTable} (${columns.join(", ")}) VALUES ${values}`,
    {
      type: QueryTypes.INSERT,
    }
  );

  return rows;
};

const isEmpty = async (tableName, sequelizeInstance) => {
  console.log(`\nChecking the ${tableName} table is empty...`);

  const result = await sequelizeInstance.query(
    `SELECT * FROM ${tableName} LIMIT 1`,
    {
      type: QueryTypes.SELECT,
    }
  );

  console.log(
    `${tableName} table ${result.length === 0 ? "is" : "is not"} empty\n`
  );

  return result.length === 0;
};

function dataToQuery(target_db, data, columns) {
  const query = data
    .map((value) => {
      const cols = columns
        .map((col) => target_db.escape(value[col]))
        .join(", ");

      return `(${cols})`;
    })
    .join(", ");

  return query;
}

module.exports = {
  getDataByPrimaryKey,
  getDataByTimestamp,
  getLastData,
  insertData,
  isEmpty,
  dataToQuery,
};
