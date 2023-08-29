const checkConfig = require("./checkConfig");

const checkAllConfig = (config) => {
  console.log("Checking all CONFIGURATION file...");

  let results = [];

  for (let i in config) {
    const conf = config[i];

    const result = checkConfig(conf);

    if (!result.ok) results = [...results, { index: i, ...result }];
  }

  if (results.length > 0) {
    console.log("ERROR: \n", JSON.stringify(results, null, 2));
    return false;
  } else {
    console.log("Config status OK!");
    return true;
  }
};

module.exports = checkAllConfig;
