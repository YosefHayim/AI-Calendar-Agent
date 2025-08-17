import type { Conversation } from '@grammyjs/conversations';
import type { Context } from 'grammy';
import { activateAgent } from '@/utils/activate-agent';
import { asyncHandler } from '@/utils/async-handlers';
import type { GlobalContext } from './init-bot';

export const scheduleEvent = asyncHandler(async (conversation: Conversation<GlobalContext>, ctx: Context) => {
  {
    const session = await conversation.external((ctx) => ctx.session);

    await ctx.reply('Summary of the event:');
    const titleMsg = await conversation.waitFor(':text', { maxMilliseconds: 60_000 }).catch(() => null);
    if (!titleMsg) {
      return ctx.reply('Timed out. Use /schedule to try again.');
    }

    await ctx.reply('Date?');
    const dateMsg = await conversation.waitFor(':text', { maxMilliseconds: 60_000 }).catch(() => null);
    if (!dateMsg) {
      return ctx.reply('Timed out. Use /schedule to try again.');
    }

    await ctx.reply('Duration of the event?');
    const durationMsg = await conversation.waitFor(':text', { maxMilliseconds: 60_000 }).catch(() => null);
    if (!durationMsg) {
      return ctx.reply('Timed out. Use /schedule to try again.');
    }

    const responseOfAgent = await activateAgent('validateUserAuth', `Please validate the user and return the response from db${session.email}`);
    console.log(responseOfAgent.rawResponses);

    return ctx.reply('Event created ✅');
  }
});
