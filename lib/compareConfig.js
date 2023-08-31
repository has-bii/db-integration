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

module.exports = compareConfig;
