const yup = require("yup");

// Define the schema using Yup
const schema = yup.object().shape({
  connection: yup.object().shape({
    source: yup.object().shape({
      database: yup.string().required(),
      user: yup.string().required(),
      password: yup.string().required(),
      host: yup.string().required(),
      port: yup.string().required(),
      dialect: yup.string().required(),
    }),
    target: yup.object().shape({
      database: yup.string().required(),
      user: yup.string().required(),
      password: yup.string().required(),
      host: yup.string().required(),
      port: yup.string().required(),
      dialect: yup.string().required(),
    }),
  }),
  tables: yup.array().of(
    yup.object().shape({
      sourceTable: yup.string().required(),
      targetTable: yup.string().required(),
      intervals: yup.array().of(
        yup.object().shape({
          value: yup.string().required(),
          type: yup.string().required(),
        })
      ),
      filterByCol: yup.object().shape({
        source: yup.string().required(),
        target: yup.string().required(),
        type: yup.string().required(),
      }),
      columns: yup.array().of(
        yup.object().shape({
          source: yup.string().required(),
          target: yup.string().required(),
        })
      ),
    })
  ),
  sqls: yup.array().of(
    yup.object().shape({
      label: yup.string().required(),
      type: yup.string().required(),
      query: yup.object().required(),
      intervals: yup.array().of(
        yup.object().shape({
          value: yup.string().required(),
          type: yup.string().required(),
        })
      ),
    })
  ),
});

// Function to validate the configuration
function checkConfig(config) {
  try {
    schema.validateSync(config);
    return { ok: true, message: "Configuration is ok." };
  } catch (error) {
    console.error("Configuration is invalid:", error.message);
    return { ok: false, message: error.message };
  }
}

function checkAllConfig(config) {
  console.log("Checking all CONFIGURATION file...");

  const results = [];

  for (let i in config) {
    const conf = config[i];

    const result = checkConfig(conf);

    if (!result.ok) results.push({ index: i, ...result });
  }

  if (results.length > 0) {
    console.log("ERROR: \n", JSON.stringify(results, null, 2));
    return false;
  } else {
    console.log("Config status OK!");
    return true;
  }
}

module.exports = { checkAllConfig, checkConfig };
