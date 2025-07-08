import { Bot } from "grammy";
import { CONFIG } from "./config/root-config";

const bot = new Bot(CONFIG.telegram_access_token!);

const initBot = async () => {
  // Handle the /start command.
  bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
  // Handle other messages.
  bot.on("message", (ctx) => ctx.reply("Got another message!"));

  bot.start();

  await bot.api.sendMessage(12345, "Hi!");
};

initBot();
