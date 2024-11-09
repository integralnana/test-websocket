const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);

  ws.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      console.log("got message:", parsedMessage);

      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "broadcast",
              message: parsedMessage.message,
              timestamp: new Date().toISOString(),
            })
          );
        }
      });
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    connectedClients: clients.size,
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`running...`);
});
