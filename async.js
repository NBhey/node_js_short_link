const http = require("node:http");

const startServer = Date.now();

const server = http.createServer((incomingMessage, serverResponse) => {
  const url = incomingMessage.url;
  console.log("старт обработки" + url, Date.now() - startServer);
  const start = Date.now();

  while (Date.now() - start < 5000) {}

  console.log("конец" + url, Date.now() - startServer);
  serverResponse.end();
});

server.on("connection", () => {
  console.log("соединение", Date.now() - startServer);
});

server.listen(4040, "127.0.0.1");
console.log("старт сервера", Date.now() - startServer);
