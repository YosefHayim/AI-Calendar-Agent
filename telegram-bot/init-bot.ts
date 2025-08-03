//@ts-nocheck

import { Bot, type Context } from "grammy";
import { conversations, createConversation, ConversationFlavor, Conversation } from "@grammyjs/conversations";
import { chatWithAgent, getCalendarList, insertEventToCalendar, searchForEventByName } from "./conversations";
import { CONFIG } from "../config/root-config";
import { asyncHandler } from "../utils/async-handler";
import { Menu, MenuFlavor } from "@grammyjs/menu";
import { mainMenu } from "./menus";

type BaseContext = Context & MenuFlavor;
type MyContext = ConversationFlavor<BaseContext>;

const bot = new Bot<MyContext>(CONFIG.telegram_access_token!);

bot.catch((err) => {
  console.error("Error in bot:", err);
});

const commandMap: Record<string, string> = {
  "get-calendars-list": "getCalendarList",
  "add-event": "insertEventToCalendar",
  "search-event": "searchForEventByName",
  "chat-with-agent": "chatWithAgent",
};

bot.use(conversations());
bot.use(mainMenu);

bot.command("start", async (ctx) => {
  await ctx.reply("Calendar Opreations Bot", { reply_markup: mainMenu });
});

bot.use(createConversation(insertEventToCalendar));
bot.use(createConversation(getCalendarList));
bot.use(createConversation(searchForEventByName));
bot.use(createConversation(chatWithAgent));

bot.on("message:text", async (ctx) => {
  const message = ctx.message?.text.toLowerCase();

  if (message === "return") {
    console.log("Exited conversation successfully");
    ctx.reply("You have exited the conversation.");
    return ctx.conversation.exit(commandMap[message]);
  }

  if (commandMap[message]) {
    return ctx.conversation.enter(commandMap[message]);
  }
});

export const startTelegramBot = asyncHandler(async () => {
  console.log("Telegram bot is running...");
  await bot.start({ allowed_updates: ["message"] });
});
