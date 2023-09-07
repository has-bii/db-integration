const cron = require("node-cron");
const mainBackup = require("../lib/mainBackup");
const backupOnError = require("../lib/backupOnError");

// Main
const main = (TIME_INTERVAL = process.env.TIME_INTERVAL) => {
  console.log(`Backup will be performed every ${TIME_INTERVAL} minutes\n`);

  // Backup for the first time
  mainBackup();

  // Cronjob every TIME_INTERVAL
  const cronjob = cron.schedule(`*/${TIME_INTERVAL} * * * *`, () => {
    mainBackup();
  });

  return cronjob;
};

// Main
const mainError = (
  TIME_INTERVAL = process.env.TIME_INTERVAL,
  type = "interval"
) => {
  // Backup for the first time
  backupOnError();

  if (type === "interval") {
    console.log(`Backup will be performed every ${TIME_INTERVAL} minutes\n`);

    // Cronjob every TIME_INTERVAL
    const cronjob = cron.schedule(`*/${TIME_INTERVAL} * * * *`, () => {
      backupOnError();
    });

    return cronjob;
  }

  if (type === "time") {
    const time = TIME_INTERVAL.split(":");

    console.log(`Backup will be performed every at ${time.join(":")}\n`);

    // Cronjob every at TIME
    const cronjob = cron.schedule(`${time.reverse().join(" ")} * * *`, () => {
      backupOnError();
    });

    return cronjob;
  }
};

module.exports = { main, mainError };
