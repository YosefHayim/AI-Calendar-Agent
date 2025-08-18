import type { Conversation } from '@grammyjs/conversations';
import type { Context } from 'grammy';
import { calendarRouterAgent } from '@/ai-agents/agents';
import { activateAgent } from '@/utils/activate-agent';
import type { GlobalContext } from './init-bot';

export const scheduleEvent = async (conversation: Conversation<GlobalContext>, ctx: Context) => {
  {
    const session = await conversation.external((externalCtx) => externalCtx.session);

    await ctx.reply('Summary of the event:');
    const titleMsg = await conversation.waitFor(':text', { maxMilliseconds: 15_000 }).catch(() => null);
    if (!titleMsg?.message?.text) {
      return ctx.reply('Timed out. Use /schedule to try again.');
    }
    const summary = titleMsg.message.text.trim();

    await ctx.reply('Date?');
    const dateMsg = await conversation.waitFor(':text', { maxMilliseconds: 15_000 }).catch(() => null);
    if (!dateMsg?.message?.text) {
      return ctx.reply('Timed out. Use /schedule to try again.');
    }
    const date = dateMsg.message.text.trim();

    await ctx.reply('Duration of the event?');
    const durationMsg = await conversation.waitFor(':text', { maxMilliseconds: 15_000 }).catch(() => null);
    if (!durationMsg?.message?.text) {
      return ctx.reply('Timed out. Use /schedule to try again.');
    }
    const duration = durationMsg.message.text.trim();

    const { finalOutput } = await activateAgent(
      calendarRouterAgent,
      `{
  "action": "insert_event",
  "user_email": ${session.email},
  "event": {
    "summary": ${summary},          // free text ok
    "date_text": ${date},           // e.g. "aug 19 2025"
    "duration_text": ${duration},   // e.g. "1am 2am" or "1h"
    "timezone": "Asia/Jerusalem"
  }
}`
    );

    await ctx.reply(finalOutput || 'No output received from AI Agent.');
  }
};
