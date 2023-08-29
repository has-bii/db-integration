const { QueryTypes } = require("sequelize");

const dataToQuery = (target_db, data, columns) => {
  const query = data
    .map((value) => {
      const cols = columns
        .map((col) => target_db.escape(value[col.source]))
        .join(", ");

      return `(${cols})`;
    })
    .join(", ");

  return query;
};

const insertData = async (target_db, data, cols, targetTable) => {
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

module.exports = insertData;
