const { QueryTypes } = require("sequelize");

const getLastData = async (target_db, DB) => {
  const data = await target_db.query(
    `SELECT * FROM ${DB.targetTable} ORDER BY ${DB.filterByCol.target} DESC LIMIT 1`,
    {
      type: QueryTypes.SELECT,
    }
  );

  return data;
};

module.exports = getLastData;
