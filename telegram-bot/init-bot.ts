import { type ConversationFlavor, conversations } from '@grammyjs/conversations';
import { run } from '@grammyjs/runner';
import { Bot, type Context, type SessionFlavor, session } from 'grammy';
import { CONFIG } from '@/config/root-config';
import type { SessionData } from '@/types';
import { authTgHandler } from './middleware/auth-tg-handler';

export type GlobalContext = Context & SessionFlavor<SessionData> & ConversationFlavor<Context>;

const bot = new Bot<GlobalContext>(CONFIG.telegram_access_token || '');

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
bot.use(conversations());
// bot.use(createConversation('scheduleEvent'));

bot.command('schedule', (ctx) => ctx.conversation.enter('scheduleEvent'));

export const startTelegramBot = () => {
  run(bot);
};
