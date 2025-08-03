import { ROUTES, STATUS_RESPONSE } from "./types";

import { CONFIG } from "./config/root-config";
import calendarRoute from "./routes/calendar-route";
import conversationStatsRouter from "./routes/conversation-stats";
import cookieParser from "cookie-parser";
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
const BASE_URL = CONFIG.base_url;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/static", express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.status(STATUS_RESPONSE.SUCCESS).send(`Server is running.`);
});

app.use(ROUTES.USERS, usersRouter);
app.use(ROUTES.CALENDAR, calendarRoute);
app.use(ROUTES.TELEGRAM_BOT, telegramBotRouter);
app.use(ROUTES.TELEGRAM_USERS, telegramUserRouter);
app.use(ROUTES.CONVERSATION_STATS, conversationStatsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  if (CONFIG.node_env === "production") {
    console.log("Server is running on Production environment");
  } else {
    console.log("Server is running on Development environment");
  }
  console.log(`Server is running on ${BASE_URL}:${PORT}`);
});

startTelegramBot();
