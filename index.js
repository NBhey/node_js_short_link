const http = require("node:http");
const { randomBytes } = require("node:crypto");
const { Buffer } = require("node:buffer");
const fs = require("node:fs");

const IP = "127.0.0.1";
const PORT = 5000;

function getLinkCode() {
  return randomBytes(4).toString("base64url");
}

const REDIRECT_URL_COLLECTION = fs.readFileSync(
  "redirect_url_collection.txt",
  "utf-8",
);

const codeCollection = new Map(
  Object.entries(JSON.parse(REDIRECT_URL_COLLECTION)),
);

const server = http.createServer((request, response) => {
  const url = request.url;
  const method = request.method;

  if (url === "/" && method === "GET") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.end("Привет, вы на главной странице");
  } else if (url === "/shorten" && method === "POST") {
    const chunks = [];
    let json;

    request.on("data", (chunk) => {
      chunks.push(chunk);
    });

    request.on("end", async () => {
      try {
        const data = Buffer.concat(chunks);
        json = JSON.parse(data);
      } catch (error) {
        response.statusCode = 400;
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        response.end("Введите корректные данные");
        return;
      }

      const linkCode = getLinkCode();

      if (json !== null && json.hasOwnProperty("target")) {
        codeCollection.set(linkCode, json.target);

        const codeCollectionString = JSON.stringify(
          Object.fromEntries(codeCollection),
        );

        try {
          await fs.promises.writeFile(
            "redirect_url_collection.txt",
            codeCollectionString,
          );

          response.statusCode = 201;
          response.setHeader("Content-Type", "text/plain; charset=utf-8");
          response.end(
            "Ваш сокращенный адрес для перехода " +
              "http://localhost:5000/" +
              linkCode,
          );
        } catch (error) {
          response.statusCode = 500;
          response.setHeader("Content-Type", "text/plain; charset=utf-8");
          response.end("Ошибка на сервере, файл не сохранен");
        }
      } else {
        response.statusCode = 422;
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        response.end("Отсутствует поле target");

        return;
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
