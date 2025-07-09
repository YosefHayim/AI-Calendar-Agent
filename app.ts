import { Bot, GrammyError, HttpError } from "grammy";

import { CONFIG } from "./config/root-config";
import CREDENTIALS from "./CREDENTIALS.json";
import authRouter from "./routes/auth-route";
import calendarRoute from "./routes/calendar-route";
import cors from "cors";
import errorHandler from "./middlewares/error-handler";
import express from "express";
import morgan from "morgan";

const app = express();
const PORT = CONFIG.port;

const bot = new Bot(CONFIG.telegram_access_token!);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  if (CREDENTIALS.expiry_date <= Date.now() || CREDENTIALS.expiry_date === 0) {
    res.redirect(`${CONFIG.redirect_url}`);
  } else {
    res.status(200).send("Server is running and everything is established correctly.");
  }
});

app.use("/api/auth", authRouter);
app.use("/api/calendar", calendarRoute);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

bot.start();

bot.on("message", (ctx) => {
  const username = ctx.update.message.from.username;
  const chatType = ctx.update.message.chat.type;
  const message = ctx.update.message.text;

  console.log(`Received on date: ${new Date().toISOString()}`);
  console.log(`Chat type: ${chatType}`);
  console.log(`Username: ${username}`);
  console.log(`Message: ${message}`);
});
