const { QueryTypes } = require("sequelize");

const getDataByPrimaryKey = async (lastData, source_db, DB) => {
  const data = await source_db.query(
    `SELECT * FROM ${DB.sourceTable} WHERE ${DB.filterByCol.source} > :filteredData`,
    {
      type: QueryTypes.SELECT,
      replacements: {
        filteredData: lastData[DB.filterByCol.target],
      },
    }
  );

  return data;
};

const getDataByTimestamp = async (lastData, source_db, DB) => {
  // Set millisecond to be 0 and add 1 second
  const timestamp = new Date(
    new Date(lastData[DB.filterByCol.target]).setMilliseconds(0)
  ).getTime();

  const data = await source_db.query(
    `SELECT * FROM ${DB.sourceTable} WHERE ${DB.filterByCol.source} > :filteredData`,
    {
      type: QueryTypes.SELECT,
      replacements: {
        filteredData: new Date(timestamp + 1000),
      },
    }
  );

  return data;
};

module.exports = { getDataByPrimaryKey, getDataByTimestamp };
