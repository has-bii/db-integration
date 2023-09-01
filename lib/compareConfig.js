function compareConfig(obj1, obj2) {
  // Compare the "connection" property
  if (JSON.stringify(obj1.connection) !== JSON.stringify(obj2.connection)) {
    return false;
  }

  // Compare the "DB" property
  if (JSON.stringify(obj1.DB) !== JSON.stringify(obj2.DB)) {
    return false;
  }

  return true;
}

function subLeftConfig(conf1, conf2) {
  const mappedConf = conf1.map((lConf) => {
    for (const rConf of conf2) {
      if (
        JSON.stringify(lConf.connection) === JSON.stringify(rConf.connection)
      ) {
        const tempTables = lConf.tables.filter((lTable) => {
          return !rConf.tables.some((rTable) => {
            return JSON.stringify(lTable) === JSON.stringify(rTable);
          });
        });

        if (tempTables.length > 0) lConf.tables = tempTables;
        else return null;
      }
    }
    return lConf;
  });

  return mappedConf.filter((mapConf) => {
    return JSON.stringify(mapConf) !== "null";
  });
}

function insertLeftConfig(conf1, conf2) {
  // Iterate through each configuration in conf2
  for (const rConf2 of conf2) {
    // Check if the connection exists in conf1
    const existingConf = conf1.find(
      (lConf1) =>
        JSON.stringify(lConf1.connection) === JSON.stringify(rConf2.connection)
    );

    if (existingConf) {
      // If connection exists, merge tables from rConf2 into existing configuration
      existingConf.tables = existingConf.tables.concat(
        rConf2.tables.filter(
          (rTable2) =>
            !existingConf.tables.some(
              (lTable1) => JSON.stringify(lTable1) === JSON.stringify(rTable2)
            )
        )
      );
    } else {
      // If connection doesn't exist, insert new configuration from rConf2
      conf1.push(rConf2);
    }
  }

  return conf1;
}

module.exports = { compareConfig, subLeftConfig, insertLeftConfig };
