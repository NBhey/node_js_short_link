const http = require("node:http");

const server = http.createServer((incomingMessage, serverResponse) => {
  const start = Date.now();

  while (Date.now() - start < 5000) {}

  serverResponse.end();
});

server.listen(4040, "127.0.0.1");
