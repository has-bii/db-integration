const { QueryTypes } = require("sequelize");

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

module.exports = isEmpty;
