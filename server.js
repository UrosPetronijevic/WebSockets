import http from "http";

const PORT = 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });

  res.end("Hi from server");
});

server.listen(PORT, "localhost", () => {
  console.log(`✅ Server has started and running at http://localhost:${PORT}/`); // Fixed emoji for visibility
});
