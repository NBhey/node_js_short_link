const http = require("node:http");
const { randomBytes } = require("node:crypto");
const { Buffer } = require("node:buffer");

const IP = "127.0.0.1";
const PORT = 5000;

function getLinkCode() {
  return randomBytes(4).toString("base64url");
}

const codeCollection = new Map();

const server = http.createServer((request, response) => {
  const url = request.url;
  const method = request.method;

  if (url === "/" && method === "GET") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.end("Привет, вы на главной странице");
  } else if (url === "/shorten" && method === "POST") {
    const chunks = [];
    const linkCode = getLinkCode();

    request.on("data", (chunk) => {
      chunks.push(chunk);
    });

    request.on("end", () => {
      const data = Buffer.concat(chunks);
      const json = JSON.parse(data);

      codeCollection.set(linkCode, json.target);

      if (codeCollection.has(linkCode)) {
        response.statusCode = 201;
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        response.end(
          "Ваш сокращенный адрес для перехода " +
            "http://localhost:5000/" +
            linkCode,
        );
      } else {
        response.statusCode = 500;
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        response.end("Адрес не преобразован, ошибка на сервере");
      }
    });
  } else if (codeCollection.has(url.slice(1)) && method === "GET") {
    response
      .writeHead(302, { Location: codeCollection.get(url.slice(1)) })
      .end();
  } else {
    response.statusCode = 404;
    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.end("Страница не найдена");
  }
});

server.listen(PORT, IP, () => {
  console.log(
    "Сервер запущен и слушает " + PORT + " порт",
    `http://${IP}:${PORT}`,
  );
});
