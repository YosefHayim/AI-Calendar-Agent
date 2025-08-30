import type { Conversation } from '@grammyjs/conversations';
import type { Context } from 'grammy';
import { HANDS_OFF_AGENTS } from '@/ai-agents/text-agents';
import { activateAgent } from '@/utils/activate-agent';
import type { GlobalContext } from './init-bot';

export const scheduleEvent = async (conversation: Conversation<GlobalContext>, ctx: Context) => {
  const session = await conversation.external((externalCtx) => externalCtx.session);

  await ctx.reply('You can chat with the scheduling agent. Type /exit to stop.');

  while (true) {
    const userMsg = await conversation.waitFor(':text').catch(() => null);
    if (!userMsg?.message?.text) {
      continue;
    }

    const text = userMsg.message.text.trim();
    if (text.toLowerCase() === '/exit') {
      await ctx.reply('Conversation ended.');
      break;
    }

    const { finalOutput } = await activateAgent(HANDS_OFF_AGENTS.insertEventHandOffAgent, `User ${session.email} says: ${text}`);

    await ctx.reply(finalOutput || 'No output received from AI Agent.');
  }
};
