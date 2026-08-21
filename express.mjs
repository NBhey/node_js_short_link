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
  const hashLink = randomBytes(4).toString("base64url");

  urlCollection.set(hashLink, request.body.target);
  response.send(
    "Ваш сокращенный адрес для перехода " + "http://localhost:5000/" + hashLink,
  );
});

app.get("/:code", (request, response) => {
  const code = request.params.code;

  if (!urlCollection.has(code)) {
    response.status(404).send("такого роута нет");
    return;
  }
  response.redirect(urlCollection.get(code));
});

app.listen(PORT, () => {
  console.log("Приложение запущено на " + PORT + " порту");
});
