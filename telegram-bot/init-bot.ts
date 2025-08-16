import { Bot, type Context, type SessionFlavor, session } from 'grammy';

import { CONFIG } from '@/config/root-config';
import type { SessionData } from '@/types';
import { authTgHandler } from './middleware/auth-tg-handler';

export type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>(CONFIG.telegram_access_token || '');

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`, err.error);
});

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

export const startTelegramBot = async () => {
  await bot.start();
};
