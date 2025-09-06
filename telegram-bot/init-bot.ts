import { run } from '@grammyjs/runner';
import { Bot, type Context, type SessionFlavor, session } from 'grammy';
import { HANDS_OFF_AGENTS, ORCHESTRATOR_AGENT } from '@/ai-agents/agents';
import { CONFIG } from '@/config/root-config';
import type { SessionData } from '@/types';
import { activateAgent } from '@/utils/activate-agent';
import { authTgHandler } from './middleware/auth-tg-handler';

export type GlobalContext = SessionFlavor<SessionData> & Context;

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
        lastProcessedMsgId: 0,
        agentActive: false,
      };
    },
  })
);

bot.use(authTgHandler);

bot.on('message', async (ctx) => {
  const msgId = ctx.message.message_id;
  const userMsgText = ctx.message.text?.trim();

  // de-dupe: process each message once
  if (ctx.session.lastProcessedMsgId === msgId) {
    return;
  }
  ctx.session.lastProcessedMsgId = msgId;

  // guard: ignore non-text updates
  if (!userMsgText) {
    return;
  }
  // start/stop "loop" via session flag; no while(true)
  if (!ctx.session.agentActive) {
    ctx.session.agentActive = true;
    await ctx.reply('Type /exit to stop.');
  }

  if (userMsgText.toLowerCase() === '/exit') {
    ctx.session.agentActive = false;
    await ctx.reply('Conversation ended.');
    return;
  }

  if (!ctx.session.agentActive) {
    return;
  }

  try {
    const { finalOutput } = await activateAgent(ORCHESTRATOR_AGENT, `User ${ctx.session.email} requesting for help with: ${userMsgText}`);

    await ctx.reply(finalOutput || 'No output received from AI Agent.');
  } catch (e) {
    console.error('Agent error:', e);
    await ctx.reply('Error processing your request.');
  }
});

export const startTelegramBot = () => {
  run(bot);
};
