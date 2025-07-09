import { Bot, GrammyError, HttpError, type Context } from "grammy";

import { CONFIG } from "./config/root-config";
import CREDENTIALS from "./CREDENTIALS.json";
import authRouter from "./routes/auth-route";
import calendarRoute from "./routes/calendar-route";
import { Conversation, conversations, createConversation, type ConversationFlavor } from "@grammyjs/conversations";
import cors from "cors";
import errorHandler from "./middlewares/error-handler";
import express from "express";
import { insertEventFnAgent } from "./agents";
import morgan from "morgan";
import { run } from "@openai/agents";

const app = express();
const PORT = CONFIG.port;

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

const bot = new Bot<ConversationFlavor<Context>>(CONFIG.telegram_access_token!);
bot.use(conversations());

/** Defines the conversation */
const welcomeMessage = async (conversation: Conversation, ctx: Context) => {
  await ctx.reply("Hi there! What is your name?");
  const { message } = await conversation.waitFor("message");
  await ctx.reply(`Welcome to the chat, ${message.text}!`);
};

const provideEventDetails = async (conversation: Conversation, ctx: Context) => {
  await ctx.reply("Please provide the name of the event: ");
  const { message: messageOne } = await conversation.waitFor("message");
  await ctx.reply(`Next, Please provide the date of the event.`);
  const { message: messageTwo } = await conversation.waitFor("message");
  await ctx.reply(`Great, so the last thing I need from you is what is the duration of that event? you can either provide a time range.`);
  const { message: messageThree } = await conversation.waitFor("message");
  await ctx.reply(
    `So, lets confirm and check that you provide accurate details in order to add them into your calendar:\nEvent name:${messageOne}\nDate of the event: ${messageTwo}\nTime range of the event: ${messageThree}`
  );
};

bot.use(createConversation(welcomeMessage));
bot.use(createConversation(provideEventDetails));

bot.command("start", async (ctx) => {
  await ctx.conversation.enter("welcomeMessage");
});

bot.command("insert-event", async (ctx) => {
  await ctx.conversation.enter("provideEventDetails");
});

bot.start();
