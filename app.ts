import { CONFIG } from "./config/env-config";
import express from "express";
import authRouter from "./routes/auth";

const app = express();
const PORT = CONFIG.port;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to backend of AI Calendar Agent");
});

app.use("/api/auth", authRouter);

app.listen(PORT);
