import express from "express";

const app = express();
const PORT = 5001;
const urlCollection = new Map([["abc123", "https://example.com"]]);

app.get("/", (request, response) => {
  response.send("Hello Express!");
});

app.get("/json", (request, response) => {
  response.send({ field: "Hello world" });
});

app.use(express.json());

app.post("/shorten", (request, response) => {
  console.log(request.body);

  response.send("ok");
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
