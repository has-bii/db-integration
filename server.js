require("dotenv").config()
const express = require("express")
const http = require("http") // Import the http module for WebSocket
const WebSocket = require("ws") // Import WebSocket library
const app = express()
const cookieParser = require("cookie-parser")
const apiRouter = require("./API")
const cors = require("cors")
const { readErrorJson } = require("./lib/ErrorHandler")
const fs = require("fs")
const { createProxyMiddleware } = require("http-proxy-middleware")
const port = process.env.PORT || 3000 // Define the port

app.use(cookieParser())
app.use(
  cors({
    credentials: true,
  })
)

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// Mount the API router under a specific base URL
app.use("/api", apiRouter)

// Serve static files from the Vite development server in development
if (process.env.NODE_ENV === "production") {
  // Serve Vite's static files in production
  app.use("/", express.static("frontend/dist"))
} else {
  // Proxy requests to the Vite development server
  app.use(
    "/",
    createProxyMiddleware({
      target: process.env.BASE_URL || "http://localhost:5173",
      changeOrigin: true,
    })
  )
}

// Create an HTTP server to attach WebSocket server to
const server = http.createServer(app)

// Create a WebSocket server
const wss = new WebSocket.Server({
  noServer: true,
  cors: {
    credentials: true,
  },
})

// Define the WebSocket route handler for '/api/get-notification'
wss.on("connection", (ws) => {
  let ErrorJSON = JSON.parse(readErrorJson())

  ws.send(JSON.stringify({ status: "all", data: ErrorJSON }))

  // Watch for changes to the error json
  const FILE_PATH = process.env.ERROR_JSON_FILE || "error/error.json"
  let timeout
  fs.watch(FILE_PATH, (eventType) => {
    if (eventType === "change") {
      clearTimeout(timeout)

      timeout = setTimeout(() => {
        // You can read the updated file here if needed
        fs.readFile(FILE_PATH, "utf-8", (err, data) => {
          if (err) {
            console.error(`Error reading file: ${err}`)
          } else {
            const newErrorJson = JSON.parse(data)

            if (newErrorJson.length === 0) {
              ws.send(JSON.stringify({ status: "clear" }))
            } else if (ErrorJSON.length !== newErrorJson.length) {
              ws.send(
                JSON.stringify({
                  status: "new",
                  data: newErrorJson,
                })
              )
            }

            ErrorJSON = [...newErrorJson]
          }
        })
      }, 1000)
    }
  })
})

// Attach the WebSocket server to the HTTP server
server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request)
  })
})

// Start the HTTP server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
