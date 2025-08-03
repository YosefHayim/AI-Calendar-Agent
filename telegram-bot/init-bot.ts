// bot.ts
import { Bot, type Context } from "grammy";
import { conversations, createConversation, type ConversationFlavor } from "@grammyjs/conversations";
import { MenuFlavor } from "@grammyjs/menu";

import { insertEventToCalendar, searchForEventByName, deleteEventByName, getCalendarList, updateEventByName, chatWithAgent } from "./conversations";

import { CONFIG } from "@/config/root-config";
import { mainMenu } from "./menus";

type BaseContext = Context & MenuFlavor;
export type MyContext = ConversationFlavor<BaseContext>;

const bot = new Bot<MyContext>(CONFIG.telegram_access_token!);

bot.use(conversations());
bot.use(createConversation(insertEventToCalendar));
bot.use(createConversation(searchForEventByName));
bot.use(createConversation(deleteEventByName));
bot.use(createConversation(updateEventByName));
bot.use(createConversation(getCalendarList));
bot.use(createConversation(chatWithAgent));
bot.use(mainMenu);

bot.command("start", async (ctx) => {
  await ctx.reply("Welcome to the AI Calendar Assistant", {
    reply_markup: mainMenu,
  });
});

export const startTelegramBot = async () => {
  console.log("Telegram bot is running...");
  await bot.start();
};
