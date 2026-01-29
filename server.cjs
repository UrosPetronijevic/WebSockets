const WebSocket = require("ws");
const http = require("http");
const url = require("url");

const server = http.createServer();
const wss = new WebSocket.Server({ server });
const userSockets = new Map(); // userId -> ws

wss.on("connection", (ws, req) => {
  const params = url.parse(req.url, true).query; // Parse the req.url
  const userId = params.userId; // extract the url from params
  if (!userId) return ws.close(1008, "Missing userId"); // early return if no user id

  userSockets.set(userId, ws); // set in map
  ws.send(`Welcome, ${userId}!`); // send welcome msg to user via the same websocket pipe

  ws.on("message", (data) => {
    /// when user sends a msg and server receives
    try {
      const msg = JSON.parse(data.toString()); // .toString() for Buffer safety // parses the msg
      const targetWs = userSockets.get(msg.to); // from the msg.to payload gets the info of what pipe it should send the msg
      if (targetWs?.readyState === WebSocket.OPEN) {
        // checks if the pipe is open (not offline)
        targetWs.send(JSON.stringify({ from: userId, text: msg.text })); // ✅ Expects .text // makes new payload with the same msg and sends it
      } else {
        ws.send(`User ${msg.to} offline`);
      }
    } catch (e) {
      ws.send("Invalid JSON");
    }
  });

  ws.on("close", () => {
    userSockets.delete(userId);
  });
});

server.listen(3000, () =>
  console.log("Chat server on ws://localhost:3000/?userId=alice"),
);
