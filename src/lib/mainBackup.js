require("dotenv").config()
const { writeErrorConfig, writeNewConfig } = require("./configHandler")
const backup = require("./backup")
const { checkAllConfig } = require("./checkConfig")
const fs = require("fs")

module.exports = async function mainBackup(TIME_INTERVAL = null, type = null) {
  // Config File Path
  const path = process.env.CONFIG_FILE_PATH || "src/config.json"

  // Check the Configuration File if exists
  console.log("Reading config file: ")
  if (!fs.existsSync(path)) {
    console.log("config.json does not exist!")
    return
  }

  // Reading the Configuration File
  const configuration = JSON.parse(fs.readFileSync(path, "utf-8"))

  // Checking the Configuration
  const configResult = checkAllConfig(configuration)

  // If it is not OK exit from the app
  if (!configResult) process.exit()

  // Backup with the configuration and return an Error Config and the new one
  const [newErrorConf, newConfig] = await backup(
    configuration,
    TIME_INTERVAL,
    type,
    true
  )

  // If there is any error handle the error
  if (newErrorConf.length > 0) {
    writeErrorConfig(newErrorConf)
    writeNewConfig(newConfig)
  }
}
