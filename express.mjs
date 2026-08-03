import express from "express";

const app = express();
const PORT = 5001;

app.get("/", (request, response) => {
  response.send("Hello Express!");
});

app.listen(PORT, () => {
  console.log("Приложение запущено на " + PORT + " порту");
});
