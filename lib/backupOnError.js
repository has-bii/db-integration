const fs = require("fs")
const { checkAllConfig } = require("./checkConfig")
const { insertToConfig, writeNewErrorConfig } = require("./configHandler")
const backup = require("./backup")

module.exports = async () => {
  try {
    const errorConfigFilePath =
      process.env.ERROR_CONFIG_FILE_PATH || "error/errorConfig.json"

    let config

    // Check the Error Config File if exists
    console.log("Reading file: ", errorConfigFilePath)
    if (!fs.existsSync(errorConfigFilePath)) {
      console.log("No Error detected")
      return
    }

    // Reading the Error Config File
    config = JSON.parse(fs.readFileSync(errorConfigFilePath, "utf-8"))

    if (config.length === 0) {
      console.log("No error detected")
      return
    }

    console.log("\nBACKUP ON ERROR CONFIG")

    if (checkAllConfig(config)) {
      console.log("Do backup on error at ", new Date().toLocaleString())

      const [newErrorConf, newConfig] = await backup(config)

      // If there is any error handle the error
      if (newConfig.length > 0) {
        writeNewErrorConfig(newErrorConf)
        insertToConfig(newConfig)
      }
    }
  } catch (error) {
    console.error("An error has occurred while Backup on Error Config: ", error)
  }
}
