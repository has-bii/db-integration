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

    writeErrorJson(error);
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

function writeErrorJson(error) {
  try {
    const data = { date: new Date(), message: `${error}`, isRead: false };

    const file = JSON.parse(readErrorJson());

    file.unshift(data);

    fs.writeFileSync(
      process.env.ERROR_JSON_FILE || "error/error.json",
      JSON.stringify(file, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Error while writing ERROR JSON: ", error);
  }
}

function readErrorJson() {
  try {
    let file = null;
    const FILE_PATH = process.env.ERROR_JSON_FILE || "error/error.json";

    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, "[]", "utf-8");

      file = "[]";
    } else {
      file = fs.readFileSync(FILE_PATH, "utf-8");

      if (file.length === 0) file = "[]";
    }

    return file;
  } catch (error) {
    console.error("Error while reading ERROR JSON!");
    throw error;
  }
}

function clearErrorJSON() {
  try {
    const FILE_PATH = process.env.ERROR_JSON_FILE || "error/error.json";

    fs.writeFileSync(FILE_PATH, "[]", "utf-8");
  } catch (error) {
    console.error("Error while clearing ERROR JSON!");
    throw error;
  }
}

function readErrors() {
  try {
    const FILE_PATH = process.env.ERROR_JSON_FILE || "error/error.json";

    const errorJSON = JSON.parse(readErrorJson()).map((err) => {
      err.isRead = true;

      return err;
    });

    fs.writeFileSync(FILE_PATH, JSON.stringify(errorJSON, null, 2), "utf-8");
  } catch (error) {
    console.error("Error while clearing ERROR JSON!");
    throw error;
  }
}

module.exports = {
  writeErrorLog,
  queryErrorHandler,
  delErrorLog,
  readErrorJson,
  clearErrorJSON,
  readErrors,
};
