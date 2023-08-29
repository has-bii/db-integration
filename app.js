const cron = require("node-cron");
const mainBackup = require("./lib/mainBackup");
const { input } = require("@inquirer/prompts");
const checkAllConfig = require("./lib/checkAllConfig");
const { delErrorJson } = require("./lib/writeErrorJson");

// Validate input from user
const validateInput = (input) => {
  const num = parseInt(input);
  if (isNaN(num) || num < 1 || num > 59) {
    return "Please enter a valid number between 1 and 59.";
  }
  return true;
};

// Main
const main = async () => {
  // Deleting Error JSON
  delErrorJson();

  const configResult = checkAllConfig();

  if (!configResult) process.exit();

  // Getting TIME INTERVAL from user
  const TIME_INTERVAL = await input({
    message: "Every how many minutes will the backup be performed?: ",
    validate: validateInput,
  });
  console.log(`Backup will be performed every ${TIME_INTERVAL} minutes\n`);

  // Backup for the first time
  mainBackup(TIME_INTERVAL);

  // Cronjob every TIME_INTERVAL
  const cronjob = cron.schedule(`*/${TIME_INTERVAL} * * * *`, () =>
    mainBackup(TIME_INTERVAL)
  );

  // Handle Ctrl+C or other termination signals
  process.on("SIGINT", () => {
    console.log("Script terminated.\n");
    cronjob.stop();
    process.exit();
  });
};

main();
