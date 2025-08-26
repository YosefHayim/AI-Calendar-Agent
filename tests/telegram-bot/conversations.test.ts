import type { Conversation } from '@grammyjs/conversations';
import type { Context } from 'grammy';
import { GlobalContext } from '@/telegram-bot/init-bot';
import { scheduleEvent } from '@/telegram-bot/conversations';

jest.mock('@/utils/activate-agent', () => ({
  activateAgent: jest.fn(),
}));
jest.mock('@/ai-agents/agents', () => ({
  calendarRouterAgent: {},
}));

import { activateAgent } from '@/utils/activate-agent';
import { calendarRouterAgent } from '@/ai-agents/text-agents';

type GCtx = GlobalContext

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

  // external(fn) should call fn with an object that has session
  const external = jest.fn(async (fn: (ext: any) => any) =>
    fn({ session: { email } }),
  );

  // Scripted waitFor behavior
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

describe('scheduleEvent conversation', () => {
  const originalTimeout = jest.setTimeout;

  beforeAll(() => {
    // In case the environment is slow
    originalTimeout(10000);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('happy path: prompts, collects inputs, calls agent, replies final output', async () => {
    (activateAgent as jest.Mock).mockResolvedValueOnce({
      finalOutput: 'Event created: 2025-08-30 14:00, 45m',
    });

    const { ctx, replies } = mkCtx();
    const { conversation, waitFor, external } = mkConversation({
      email: 'alice@company.com',
      waitForResults: [
        { ok: true, text: 'Team sync' },     // title
        { ok: true, text: '2025-08-30 14:00' }, // date
        { ok: true, text: '45m' },           // duration
      ],
    });

    await scheduleEvent(conversation, ctx);

    // Prompts sequence
    expect((ctx.reply as jest.Mock).mock.calls.map((c: any[]) => c[0])).toEqual([
      'Summary of the event:',
      'Date?',
      'Duration of the event?',
      'Event created: 2025-08-30 14:00, 45m',
    ]);

    // external session access
    expect(external).toHaveBeenCalledTimes(1);

    // waitFor called with :text three times
    expect(waitFor).toHaveBeenCalledTimes(3);
    expect(waitFor).toHaveBeenNthCalledWith(1, ':text', expect.any(Object));
    expect(waitFor).toHaveBeenNthCalledWith(2, ':text', expect.any(Object));
    expect(waitFor).toHaveBeenNthCalledWith(3, ':text', expect.any(Object));

    // agent invocation with composed prompt
    expect(activateAgent).toHaveBeenCalledTimes(1);
    const [agentArg, promptArg] = (activateAgent as jest.Mock).mock.calls[0];
    expect(agentArg).toBe(calendarRouterAgent);
    expect(promptArg).toContain('Please insert the event details of the user alice@company.com');
    expect(promptArg).toContain('Event summary: Team sync');
    expect(promptArg).toContain('Event date: 2025-08-30 14:00');
    expect(promptArg).toContain('Event duration: 45m');

    // final reply
    expect(replies[replies.length - 1]).toBe('Event created: 2025-08-30 14:00, 45m');
  });

  it('fallback when agent returns empty output', async () => {
    (activateAgent as jest.Mock).mockResolvedValueOnce({
      finalOutput: '',
    });

    const { ctx, replies } = mkCtx();
    const { conversation } = mkConversation({
      waitForResults: [
        { ok: true, text: 'Customer call' },
        { ok: true, text: '2025-09-01 10:00' },
        { ok: true, text: '30m' },
      ],
    });

    await scheduleEvent(conversation, ctx);

    expect(activateAgent).toHaveBeenCalledTimes(1);
    expect((ctx.reply as jest.Mock).mock.calls.map((c: any[]) => c[0])).toEqual([
      'Summary of the event:',
      'Date?',
      'Duration of the event?',
      'No output received from AI Agent.',
    ]);
    expect(replies[replies.length - 1]).toBe('No output received from AI Agent.');
  });

  it('timeout on the first question returns early with timeout message', async () => {
    const { ctx } = mkCtx();
    const { conversation, waitFor } = mkConversation({
      waitForResults: [
        { ok: false }, // title timeout
      ],
    });

    await scheduleEvent(conversation, ctx);

    const calls = (ctx.reply as jest.Mock).mock.calls.map((c: any[]) => c[0]);
    expect(calls).toEqual([
      'Summary of the event:',
      'Timed out. Use /schedule to try again.',
    ]);

    // No agent call if first input fails
    expect(activateAgent).not.toHaveBeenCalled();

    // Only one waitFor attempt
    expect(waitFor).toHaveBeenCalledTimes(1);
  });

  it('timeout on the second question returns early with timeout message', async () => {
    const { ctx } = mkCtx();
    const { conversation, waitFor } = mkConversation({
      waitForResults: [
        { ok: true, text: 'Roadmap review' }, // title ok
        { ok: false },                         // date timeout
      ],
    });

    await scheduleEvent(conversation, ctx);

    const calls = (ctx.reply as jest.Mock).mock.calls.map((c: any[]) => c[0]);
    expect(calls).toEqual([
      'Summary of the event:',
      'Date?',
      'Timed out. Use /schedule to try again.',
    ]);

    expect(activateAgent).not.toHaveBeenCalled();
    expect(waitFor).toHaveBeenCalledTimes(2);
  });

  it('timeout on the third question returns early with timeout message', async () => {
    const { ctx } = mkCtx();
    const { conversation, waitFor } = mkConversation({
      waitForResults: [
        { ok: true, text: 'Partner update' }, // title ok
        { ok: true, text: '2025-09-10 16:00' }, // date ok
        { ok: false },                           // duration timeout
      ],
    });

    await scheduleEvent(conversation, ctx);

    const calls = (ctx.reply as jest.Mock).mock.calls.map((c: any[]) => c[0]);
    expect(calls).toEqual([
      'Summary of the event:',
      'Date?',
      'Duration of the event?',
      'Timed out. Use /schedule to try again.',
    ]);

    expect(activateAgent).not.toHaveBeenCalled();
    expect(waitFor).toHaveBeenCalledTimes(3);
  });
});
