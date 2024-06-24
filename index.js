const http = require('http');
const WebSocket = require('ws');
const express = require('express');
const { processDir, isValidPath } = require('./util');
const path = require('path');

const app = express();
const httpPort = 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Create the HTTP server
const server = http.createServer(app);
server.listen(httpPort, () => {
  console.log(`HTTP server started on port ${httpPort}`);
});

// Create the WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  console.log('WebSocket connection established');

  ws.on('message', async (message) => {
    const dirPath = message.toString(); // Convert the received Buffer to a string
    console.log(`Received directory path: ${dirPath}`);

    if (!await isValidPath(dirPath)) {
      console.error(`Invalid directory path: ${dirPath}`);
      ws.send(JSON.stringify({ error: `Invalid directory path: ${dirPath}` }));
      return;
    }

    const startTime = Date.now();
    const result = await processDir(dirPath);
    const endTime = Date.now();
    const elapsedTime = (endTime - startTime);

    console.log(`Directory ${dirPath} processed in ${elapsedTime / 1000} seconds`);

    const jsonResult = JSON.stringify(result, null, 2);
    ws.send(jsonResult);
  });
});

console.log(`WebSocket server started on port ${httpPort}`);
