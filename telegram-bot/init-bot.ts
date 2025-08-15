import {
  type ConversationFlavor,
  conversations,
  createConversation,
} from '@grammyjs/conversations';
import type { MenuFlavor } from '@grammyjs/menu';
import { Bot, type Context, type SessionFlavor, session } from 'grammy';

import { CONFIG } from '@/config/root-config';
import type { SessionData } from '@/types';
import { mainMenu } from './menus';
import { authTgHandler } from './middleware/auth-tg-handler';

export type MyContext = Context &
  MenuFlavor &
  SessionFlavor<SessionData> &
  ConversationFlavor<Context>;

const bot = new Bot<MyContext>(CONFIG.telegram_access_token!);

bot.use(
  session({
    initial: (): SessionData => {
      return {
        chatId: 0,
        codeLang: undefined,
        email: undefined,
        messageCount: 0,
        userId: 0,
        username: undefined,
      };
    },
  })
);
bot.use(authTgHandler);
bot.use(conversations());
bot.use(mainMenu);

bot.command('start', async (ctx) => {
  await ctx.reply('Welcome to the AI Calendar Assistant', {
    reply_markup: mainMenu,
  });
});

export const startTelegramBot = async () => {
  console.log('Telegram bot is running...');
  await bot.start();
};
