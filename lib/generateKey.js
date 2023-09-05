const fs = require("fs");
const crypto = require("crypto");

// Generate a random secret key
const secretKey = crypto.randomBytes(32).toString("hex");

// File path
const filePath = ".env";

// Text or marker after which you want to insert new content
const marker = "SECRET_KEY=";

// Read the existing content of the file
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  // Find the index of the marker in the existing content
  const markerIndex = data.indexOf(marker);

  if (markerIndex === -1) {
    console.error("Marker not found in the file.");
    return;
  }

  // Insert the new content after the marker
  const updatedContent =
    data.slice(0, markerIndex + marker.length) +
    secretKey +
    data.slice(markerIndex + marker.length);

  // Write the updated content back to the file
  fs.writeFile(filePath, updatedContent, "utf8", (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("Secret key generated.");
  });
});
