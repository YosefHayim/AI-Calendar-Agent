import { CONFIG } from "./config/root-config";
import calendarRoute from "./routes/calendar-route";
import conversationStatsRouter from "./routes/conversation-stats";
import cors from "cors";
import errorHandler from "./middlewares/error-handler";
import express from "express";
import morgan from "morgan";
import path from "path";
import { startTelegramBot } from "./telegram-bot/init-bot";
import telegramBotRouter from "./routes/telegram-bots";
import telegramUserRouter from "./routes/telegram-bots";
import usersRouter from "./routes/users";

const app = express();
const PORT = CONFIG.port;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/static", express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  if (CONFIG.node_env === "production") {
    console.log("---------------------------------------------Server is running on Production environment---------------------------------------------");
  } else {
    console.log("---------------------------------------------Server is running on Development environment---------------------------------------------");
  }
  res.status(200).send(`Server is running and everything is established.`);
});

app.use("/api/users", usersRouter);
app.use("/api/calendar", calendarRoute);
app.use("/api/telegram-bots", telegramBotRouter);
app.use("/api/telegram-users", telegramUserRouter);
app.use("/api/conversations-stats", conversationStatsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

startTelegramBot();
