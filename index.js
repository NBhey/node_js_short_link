const http = require("node:http");

const IP = "127.0.0.1";
const PORT = 5000;

const server = http.createServer((request, response) => {
  const url = request.url;
  const method = request.method;

  if (url === "/" && method === "GET") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.end("Привет, вы на главной странице");
  } else if (url === "/shorten" && method === "POST") {
    const chunks = [];
    request.on("data", (chunk) => {
      chunks.push(chunk);
    });
    request.on("end", (chunk) => {
      const data = Buffer.concat(chunks);
      console.log(data);
      console.log(JSON.parse(data));
    });

    response.statusCode = 200;
    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.end("Вы получили данные от POST");
  } else if (url === "/go" && method === "GET") {
    // response.writeHead(302, { Location: "https://profile.nbhey.ru" }).end();
    response.statusCode = 302;
    response.setHeader("Location", "https://profile.nbhey.ru");
    response.end();
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
