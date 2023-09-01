const cron = require("node-cron");
const { input } = require("@inquirer/prompts");
const mainBackup = require("./lib/mainBackup");
const { delErrorLog } = require("./lib/ErrorHandler");

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
  // Getting TIME INTERVAL from user
  const TIME_INTERVAL = await input({
    message: "Every how many minutes will the backup be performed?: ",
    validate: validateInput,
  });
  console.log(`Backup will be performed every ${TIME_INTERVAL} minutes\n`);

  // Backup for the first time
  mainBackup();

  // Cronjob every TIME_INTERVAL
  const cronjob = cron.schedule(`*/${TIME_INTERVAL} * * * *`, () => {
    mainBackup();
  });

  const cronjob2 = cron.schedule("59 23 * * *", delErrorLog);

  // Handle Ctrl+C or other termination signals
  process.on("SIGINT", () => {
    console.log("Script terminated.\n");
    cronjob.stop();
    cronjob2.stop();
    process.exit();
  });
};

main();
