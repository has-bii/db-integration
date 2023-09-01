require("dotenv").config();
const fs = require("fs");

function queryErrorHandler(table, errorName, error) {
  const err = new Error();
  err.name = errorName;
  err.message = error;
  err.table = table;

  throw err;
}

function writeErrorLog(error) {
  try {
    const message = `\n\n====================================================================\nAN ERROR HAS OCCURRED at ${new Date().toLocaleString()} :\n${error}\n====================================================================\n\n`;
    console.error(message);
    const pathFile = `${process.env.LOG_ERROR_FOLDER}/${new Date()
      .toLocaleDateString()
      .replaceAll("/", "-")}.text`;
    fs.writeFile(pathFile, message, { flag: "a" }, (err) => {});
  } catch (error) {
    console.error("An error has occurred while writing error log: ", error);
  }
}

function delErrorLog() {
  try {
    // Get the current date
    const currentDate = new Date();

    // Calculate one week ago by subtracting 7 days
    const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toLocaleDateString()
      .replaceAll("/", "-");

    const filePath = `log/${oneWeekAgo}.text`;

    console.log("Deleting Error log: ", filePath);

    // Check if exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(
      "An error has occurred while deleting error log file: ",
      error
    );
  }
}

module.exports = {
  writeErrorLog,
  queryErrorHandler,
  delErrorLog,
};
