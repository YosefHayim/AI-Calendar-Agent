import type { Conversation } from '@grammyjs/conversations';
import type { Context } from 'grammy';
import { GlobalContext } from '@/telegram-bot/init-bot';
import { scheduleEvent } from '@/telegram-bot/conversations';

jest.mock('@/utils/activate-agent', () => ({
  activateAgent: jest.fn(),
}));

// Prevent constructing real Agents and any OpenAI setup side-effects
jest.mock('@/ai-agents/agents', () => ({
  HANDS_OFF_AGENTS: {
    insertEventHandOffAgent: { __testToken: 'insertEventHandOffAgent' },
  },
}));

import { activateAgent } from '@/utils/activate-agent';
import { HANDS_OFF_AGENTS } from '@/ai-agents/agents';

type GCtx = GlobalContext;

const mkCtx = () => {
  const replies: string[] = [];
  const ctx: Partial<Context> & { reply: jest.Mock } = {
    reply: jest.fn(async (msg: string): Promise<any> => {
      replies.push(msg);
    }),
  };
  return { ctx: ctx as Context, replies };
};

const mkConversation = (opts: {
  email?: string;
  waitForResults?: Array<{ ok: true; text: string } | { ok: false }>;
}) => {
  const email = opts.email ?? 'user@example.com';

  const external = jest.fn(async (fn: (ext: any) => any) =>
    fn({ session: { email } }),
  );

  const waitFor = jest.fn().mockImplementation((_filter: string) => {
    if (!opts.waitForResults || opts.waitForResults.length === 0) {
      return Promise.reject(new Error('unexpected call'));
    }
    const next = opts.waitForResults.shift()!;
    if ('ok' in next && next.ok) {
      return Promise.resolve({ message: { text: next.text } });
    }
    return Promise.reject(new Error('timeout'));
  });

  return {
    conversation: { external, waitFor } as unknown as Conversation<GCtx>,
    external,
    waitFor,
  };
};

describe('scheduleEvent conversation (chat loop)', () => {


  afterEach(() => {
    jest.clearAllMocks();
  });

  it('happy path: user chats once, agent replies, then /exit', async () => {
    (activateAgent as jest.Mock).mockResolvedValueOnce({
      finalOutput: 'Event created: 2025-08-30 14:00, 45m',
    });

    const { ctx, replies } = mkCtx();
    const { conversation, waitFor, external } = mkConversation({
      email: 'alice@company.com',
      waitForResults: [
        { ok: true, text: 'Schedule Team sync on 2025-08-30 14:00 for 45m' },
        { ok: true, text: '/exit' },
      ],
    });

    await scheduleEvent(conversation, ctx);

    // Initial instruction + agent output + end message
    expect((ctx.reply as jest.Mock).mock.calls.map((c: any[]) => c[0])).toEqual([
      'You can chat with the scheduling agent. Type /exit to stop.',
      'Event created: 2025-08-30 14:00, 45m',
      'Conversation ended.',
    ]);

    // session accessed once
    expect(external).toHaveBeenCalledTimes(1);

    // waitFor loop: two text messages consumed
    expect(waitFor).toHaveBeenCalledTimes(2);
    const wfCalls = (waitFor as jest.Mock).mock.calls;
    expect(wfCalls[0][0]).toMatch(/(^:text$|^message:text$)/);
    expect(wfCalls[1][0]).toMatch(/(^:text$|^message:text$)/);

    // agent invoked with chat-style prompt
    expect(activateAgent).toHaveBeenCalledTimes(1);
    const [agentArg, promptArg] = (activateAgent as jest.Mock).mock.calls[0];
    expect(agentArg).toBe(HANDS_OFF_AGENTS.insertEventHandOffAgent);
    expect(promptArg).toContain('User alice@company.com says: Schedule Team sync on 2025-08-30 14:00 for 45m');
  });

  it('agent returns empty output → fallback message', async () => {
    (activateAgent as jest.Mock).mockResolvedValueOnce({ finalOutput: '' });

    const { ctx, replies } = mkCtx();
    const { conversation } = mkConversation({
      waitForResults: [
        { ok: true, text: 'Create event tomorrow 10:00 for 30m' },
        { ok: true, text: '/exit' },
      ],
    });

    await scheduleEvent(conversation, ctx);

    expect((ctx.reply as jest.Mock).mock.calls.map((c: any[]) => c[0])).toEqual([
      'You can chat with the scheduling agent. Type /exit to stop.',
      'No output received from AI Agent.',
      'Conversation ended.',
    ]);
    expect(activateAgent).toHaveBeenCalledTimes(1);
  });

  it('/exit immediately → end without calling agent', async () => {
    const { ctx } = mkCtx();
    const { conversation, waitFor } = mkConversation({
      waitForResults: [{ ok: true, text: '/exit' }],
    });

    await scheduleEvent(conversation, ctx);

    expect((ctx.reply as jest.Mock).mock.calls.map((c: any[]) => c[0])).toEqual([
      'You can chat with the scheduling agent. Type /exit to stop.',
      'Conversation ended.',
    ]);
    expect(activateAgent).not.toHaveBeenCalled();
    expect(waitFor).toHaveBeenCalledTimes(1);
  });

  it('timeout first, then user exits → no agent call, clean end', async () => {
    const { ctx } = mkCtx();
    const { conversation, waitFor } = mkConversation({
      waitForResults: [
        { ok: false },               // first waitFor rejects (timeout)
        { ok: true, text: '/exit' }, // next iteration gets exit
      ],
    });

    await scheduleEvent(conversation, ctx);

    const calls = (ctx.reply as jest.Mock).mock.calls.map((c: any[]) => c[0]);
    expect(calls).toEqual([
      'You can chat with the scheduling agent. Type /exit to stop.',
      'Conversation ended.',
    ]);

    expect(activateAgent).not.toHaveBeenCalled();
    expect(waitFor).toHaveBeenCalledTimes(2);
    const wfCalls = (waitFor as jest.Mock).mock.calls;
    expect(wfCalls[0][0]).toMatch(/(^:text$|^message:text$)/);
    expect(wfCalls[1][0]).toMatch(/(^:text$|^message:text$)/);
  });
});
