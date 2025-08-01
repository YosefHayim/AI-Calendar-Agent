import { CONFIG } from "./config/root-config";
import authRouter from "./routes/auth-route";
import calendarRoute from "./routes/calendar-route";
import cors from "cors";
import errorHandler from "./middlewares/error-handler";
import express from "express";
import morgan from "morgan";
import path from "path";
import { startTelegramBot } from "./telegram-bot/init-bot";

const app = express();
const PORT = CONFIG.port;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/static", express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.status(200).send("Server is running and everything is established.");
});

app.use("/api/auth", authRouter);
app.use("/api/calendar", calendarRoute);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

startTelegramBot();
