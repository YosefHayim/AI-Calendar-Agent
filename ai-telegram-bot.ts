import { Bot, GrammyError, HttpError } from "grammy";

import { CONFIG } from "./config/root-config";

const bot = new Bot(CONFIG.telegram_access_token!);

// Attach error handler for bot events
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

const initAiTelegramBot = async () => {
  bot.on("message", (ctx) => {
    const username = ctx.update.message.from.username;
    const chatType = ctx.update.message.chat.type;
    const message = ctx.update.message.text;

    console.log(`Received on date: ${new Date().toISOString()}`);
    console.log(`Chat type: ${chatType}`);
    console.log(`Username: ${username}`);
    console.log(`Message received: ${message}`);
  });

  await bot.start();
};

initAiTelegramBot().catch((err) => {
  console.error("Failed to start bot:", err);
});
