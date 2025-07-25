import { Bot, type Context } from "grammy";

import { CONFIG } from "./config/root-config";
import credentials from "./credentials.json";
import authRouter from "./routes/auth-route";
import calendarRoute from "./routes/calendar-route";
import { conversations, createConversation, type ConversationFlavor } from "@grammyjs/conversations";
import cors from "cors";
import errorHandler from "./middlewares/error-handler";
import express from "express";
import morgan from "morgan";
import { getCalendarList, insertEventToCalendar, searchForEventByName } from "./telegram-bot/conversations";

const app = express();
const PORT = CONFIG.port;
export const bot = new Bot<ConversationFlavor<Context>>(CONFIG.telegram_access_token!);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  if (credentials.expiry_date <= Date.now() || credentials.expiry_date === 0) {
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

bot.use(conversations());
bot.use(createConversation(insertEventToCalendar));
bot.use(createConversation(getCalendarList));
bot.use(createConversation(searchForEventByName));

const commandMap: Record<string, string> = {
  "get-calendars-list": "getCalendarList",
  "add-event": "insertEventToCalendar",
  "search-event": "searchForEventByName",
};

bot.on("message:text", async (ctx) => {
  const message = ctx.message?.text.toLowerCase();
  if (commandMap[message]) {
    if (message === "return") {
      ctx.reply("You have exited the conversation.");
      return ctx.conversation.exit(commandMap[message]);
    }
    return ctx.conversation.enter(commandMap[message]);
  }
});

bot.start({ allowed_updates: ["message"] });
