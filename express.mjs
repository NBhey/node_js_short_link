import express from "express";

const app = express();
const PORT = 5001;

app.get("/", (request, response) => {
  response.send("Hello Express!");
});

app.get("/json", (request, response) => {
  response.send({ field: "Hello world" });
});

app.get("/:code", (request, response) => {
  response.send(request.params.code);
});

app.listen(PORT, () => {
  console.log("Приложение запущено на " + PORT + " порту");
});
