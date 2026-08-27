import express from "express";
import { randomBytes } from "node:crypto";

const app = express();
const PORT = 5001;
const urlCollection = new Map();

app.use(express.json());

app.get("/", (request, response) => {
  response.send("Hello Express!");
});

app.get("/json", (request, response) => {
  response.send({ field: "Hello world" });
});

app.post("/shorten", (request, response) => {
  if (!request.body) {
    response.status(404);
    response.send("отсутствует тело");
    return;
  } else if (request.body && !request.body.hasOwnProperty("target")) {
    response.status(404);
    response.send("отсутствует поле target, проверьте вводимые данные");
    return;
  }

  const codeLink = randomBytes(4).toString("base64url");
  urlCollection.set(codeLink, request.body.target);

  response.send(
    "Ваш сокращенный адрес для перехода " +
      `http://localhost:${PORT}/` +
      codeLink,
  );

  return;
});

app.get("/:code", (request, response) => {
  const { code } = request.params;

  if (!urlCollection.has(code)) {
    response.status(404).send("такого роута нет");
    return;
  }
  response.redirect(urlCollection.get(code));
});

app.use((req, res, next) => {
  res.status(404).send("пишу из middleware, такого роута нет");
});

app.listen(PORT, () => {
  console.log("Приложение запущено на " + PORT + " порту");
});
