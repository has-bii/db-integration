const cron = require("node-cron");
const mainBackup = require("./lib/mainBackup");

// Main
const main = () => {
  // Getting TIME INTERVAL from env
  const TIME_INTERVAL = process.env.TIME_INTERVAL;

  console.log(`Backup will be performed every ${TIME_INTERVAL} minutes\n`);

  // Backup for the first time
  mainBackup();

  // Cronjob every TIME_INTERVAL
  const cronjob = cron.schedule(`*/${TIME_INTERVAL} * * * *`, () => {
    mainBackup();
  });

  return cronjob;
};

module.exports = main;
