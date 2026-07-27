const http = require("node:http");
const { randomBytes } = require("node:crypto");
const { Buffer } = require("node:buffer");
const fs = require("node:fs");
const path = require("node:path");

const IP = "127.0.0.1";
const PORT = 5000;

function getLinkCode() {
  return randomBytes(4).toString("base64url");
}

function checkShortenLinkInCodeCollection(codeCollection, userLink) {
  for (let [linkCode, saveUserLink] of codeCollection.entries()) {
    if (saveUserLink === userLink) {
      return { hasInCodeCollection: true, linkCode };
    }
  }
  return { hasInCodeCollection: false, linkCode: getLinkCode() };
}

const URL_COLLECTION_PATH = path.join(__dirname, "redirect_url_collection.txt");

function initCodeCollection() {
  try {
    const REDIRECT_URL_COLLECTION = fs.readFileSync(
      URL_COLLECTION_PATH,
      "utf-8",
    );
    return new Map(Object.entries(JSON.parse(REDIRECT_URL_COLLECTION)));
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log("Файл не был прочитан");
      return new Map();
    }
    throw error;
  }
}

const codeCollection = initCodeCollection();

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

      if (
        json !== null &&
        json.hasOwnProperty("target") &&
        URL.canParse(json.target) &&
        (new URL(json.target).protocol === "http:" ||
          new URL(json.target).protocol === "https:")
      ) {
        const { hasInCodeCollection, linkCode } =
          checkShortenLinkInCodeCollection(codeCollection, json.target);

        if (hasInCodeCollection) {
          response.statusCode = 201;
          response.setHeader("Content-Type", "text/plain; charset=utf-8");
          response.end(
            "Ваш сокращенный адрес для перехода " +
              "http://localhost:5000/" +
              linkCode,
          );
          return;
        }

        codeCollection.set(linkCode, json.target);

        const codeCollectionString = JSON.stringify(
          Object.fromEntries(codeCollection),
        );

        try {
          await fs.promises.writeFile(
            URL_COLLECTION_PATH,
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

        if (json === null || !json.hasOwnProperty("target")) {
          response.end("Отсутствует поле target");
          return;
        }
        if (
          !URL.canParse(json.target) ||
          !(new URL(json.target).protocol === "http:") ||
          !(new URL(json.target).protocol === "https:")
        ) {
          response.end(
            "Неверное значение в полне ввода, используйте URL согласно примеру: https://example.com",
          );
          return;
        }
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
