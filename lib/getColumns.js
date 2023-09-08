const { QueryTypes } = require("sequelize");
const { connectToDB } = require("./connectDB");

async function getColumns(connection, table) {
  try {
    const [source_db, target_db] = await connectToDB({
      connection,
    });

    const sourceCols = await source_db.query(
      `SELECT COLUMN_NAME
        FROM USER_TAB_COLUMNS
        WHERE TABLE_NAME = '${table.sourceTable}'`,
      { type: QueryTypes.SELECT }
    );

    const targetCols = await target_db.query(
      `SELECT column_name
        FROM information_schema.columns
        WHERE table_name = '${table.targetTable}'`,
      { type: QueryTypes.SELECT }
    );

    console.log(targetCols);

    const cols = sourceCols.map((col, i) => {
      return { source: col.COLUMN_NAME, target: targetCols[i].column_name };
    });

    return cols;
  } catch (error) {
    console.error("Error while getting columns: ", error);
    return null;
  }
}

module.exports = getColumns;
