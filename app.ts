import { CONFIG } from "./config";
import express from "express";

const app = express();
const PORT = CONFIG.port;

app.get("/", (req, res) => {
  res.send("Welcome to backend of AI Calendar Agent");
});


app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
