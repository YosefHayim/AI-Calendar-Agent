import type { Conversation } from '@grammyjs/conversations';
import type { Context } from 'grammy';
import type { GlobalContext } from './init-bot';

export const scheduleEvent = async (conversation: Conversation<GlobalContext>, ctx: Context) => {
  const session = await conversation.external((ctx) => ctx.session);
  console.log(session);
  await ctx.reply('Event title?');
  const titleMsg = await conversation.waitFor(':text', { maxMilliseconds: 60_000 }).catch(() => null);
  if (!titleMsg) {
    return ctx.reply('Timed out. Use /schedule to try again.');
  }

  await ctx.reply('Date (YYYY-MM-DD)?');
  const dateMsg = await conversation.waitFor(':text', { maxMilliseconds: 60_000 }).catch(() => null);
  if (!dateMsg) {
    return ctx.reply('Timed out. Use /schedule to try again.');
  }

  return ctx.reply('Event created ✅');
};
