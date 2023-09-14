const cron = require("node-cron");
const mainBackup = require("../lib/mainBackup");
const backupOnError = require("../lib/backupOnError");

// Main
const main = (TIME_INTERVAL = process.env.TIME_INTERVAL, type = "minute") => {
  if (type === "minute") {
    // Cronjob at after every n minute
    const cronjob = cron.schedule(`*/${TIME_INTERVAL} * * * *`, () => {
      console.log("Schedule: ", `${TIME_INTERVAL} => ${type}`);
      mainBackup();
    });

    return cronjob;
  } else if (type === "hour") {
    // Cronjob At minute 0 past every nth hour
    const cronjob = cron.schedule(`0 */${TIME_INTERVAL} * * *`, () => {
      console.log("Schedule: ", `${TIME_INTERVAL} => ${type}`);
      mainBackup();
    });

    return cronjob;
  }

  return null;
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
