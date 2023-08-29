const { error } = require("console");
const fs = require("fs");

const writeErrorJson = (conf) => {
  try {
    const date = new Date().toLocaleDateString().replaceAll("/", "-");

    const filePath = `log/json/${date}.json`;

    let jsonData;

    if (fs.existsSync(filePath)) {
      jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } else {
      fs.writeFileSync(filePath, "[]", "utf-8");
      jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    let isNew = true;

    if (jsonData.length > 0) {
      jsonData.forEach((data) => {
        if (data.id === conf.id) isNew = false;
      });
    }

    if (isNew) jsonData = [...jsonData, conf];

    fs.writeFile(
      filePath,
      JSON.stringify(jsonData, null, 2),
      { flag: "w+" },
      (err) => {}
    );
  } catch (error) {
    console.error("Failed to write config file:", error);
  }
};

const delErrorJson = () => {
  const date = new Date().toLocaleDateString().replaceAll("/", "-");

  const filePath = `log/json/${date}.json`;

  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, () => {});
  }
};

module.exports = { writeErrorJson, delErrorJson };
