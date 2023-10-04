const { Sequelize } = require("sequelize");

// Create new Sequelize instance
const newConnection = (config) => {
  const connection = new Sequelize(
    config.database,
    config.user,
    config.password,
    {
      host: config.host,
      dialect: config.dialect,
      port: config.port,
      pool: {
        acquire: 10000,
      },
    }
  );
  return connection;
};

// Connect to DB
const connectToDB = async (conf) => {
  console.log(
    `\n------------------------------------------------------------------------------------\nCONNECTING TO SOURCE: ${conf.connection.source.database} AND TARGET: ${conf.connection.target.database}\n`
  );

  // Connecting to the DB
  const source_db = newConnection(conf.connection.source);
  const target_db = newConnection(conf.connection.target);

  // Checking the connections of source DB
  await source_db
    .authenticate()
    .then(() =>
      console.log(
        `Connected to Source DB (${conf.connection.source.database}) successfully.`
      )
    )
    .catch((error) => {
      const err = new Error();
      err.name = `Unable connect to Source DB (${conf.connection.source.database})`;
      err.message = error;
      err.conf = conf;

      throw err;
    });

  // Checking the connections of target DB
  await target_db
    .authenticate()
    .then(() =>
      console.log(
        `Connected to Target DB (${conf.connection.target.database}) successfully.`
      )
    )
    .catch((error) => {
      const err = new Error();
      err.name = `Unable connect to Target DB (${conf.connection.target.database})`;
      err.message = error;
      err.conf = conf;

      throw err;
    });

  console.log(
    "\nTHE CONNECTIONS HAVE BEEN ESTABLISHED\n------------------------------------------------------------------------------------\n"
  );

  return [source_db, target_db];
};

module.exports = { connectToDB, newConnection };
