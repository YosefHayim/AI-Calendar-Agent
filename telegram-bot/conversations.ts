import type { Conversation } from '@grammyjs/conversations';
import type { Context } from 'grammy';
import { calendarRouterAgent } from '@/ai-agents/agents';
import { activateAgent } from '@/utils/activate-agent';
import type { GlobalContext } from './init-bot';

export const scheduleEvent = async (conversation: Conversation<GlobalContext>, ctx: Context) => {
  {
    const session = await conversation.external((externalCtx) => externalCtx.session);

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

    const { finalOutput } = await activateAgent(calendarRouterAgent, `Please provide me the calendars the user has: ${session.email}`);

    await ctx.reply(finalOutput || 'No output recieved from AI Agent.');

    return ctx.reply('Event created ✅');
  }
};
