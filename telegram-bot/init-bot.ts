// bot.ts
import { Bot, type Context } from "grammy";
import { conversations, createConversation, type ConversationFlavor } from "@grammyjs/conversations";
import { getCalendarList, insertEventToCalendar, searchForEventByName } from "./conversations";
import { CONFIG } from "../config/root-config";
import { asyncHandler } from "../utils/async-handler";

export const bot = new Bot<ConversationFlavor<Context>>(CONFIG.telegram_access_token!);

const commandMap: Record<string, string> = {
  "get-calendars-list": "getCalendarList",
  "add-event": "insertEventToCalendar",
  "search-event": "searchForEventByName",
};

bot.use(conversations());
bot.use(createConversation(insertEventToCalendar));
bot.use(createConversation(getCalendarList));
bot.use(createConversation(searchForEventByName));

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
  await bot.start({ allowed_updates: ["message"] });
});
