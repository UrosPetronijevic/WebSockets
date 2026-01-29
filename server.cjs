const WebSocket = require("ws");
const http = require("http");
const url = require("url");

const server = http.createServer();
const wss = new WebSocket.Server({ server });
const userSockets = new Map(); // userId -> ws

wss.on("connection", (ws, req) => {
  const params = url.parse(req.url, true).query;
  const userId = params.userId;
  if (!userId) return ws.close(1008, "Missing userId");

  console.log(`🔥 ${userId} CONNECTED`); // Debug log
  userSockets.set(userId, ws);
  ws.send(`Welcome, ${userId}!`);

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString()); // .toString() for Buffer safety
      console.log(`📨 From ${userId}: ${JSON.stringify(msg)}`);
      const targetWs = userSockets.get(msg.to);
      if (targetWs?.readyState === WebSocket.OPEN) {
        console.log(`📤 Relaying to ${msg.to}`);
        targetWs.send(JSON.stringify({ from: userId, text: msg.text })); // ✅ Expects .text
      } else {
        console.log(`❌ ${msg.to} offline`);
        ws.send(`User ${msg.to} offline`);
      }
    } catch (e) {
      console.error("JSON Error:", e);
      ws.send("Invalid JSON");
    }
  });

  ws.on("close", () => {
    console.log(`🔌 ${userId} DISCONNECTED`);
    userSockets.delete(userId);
  });
});

server.listen(3000, () =>
  console.log("Chat server on ws://localhost:3000/?userId=alice"),
);
