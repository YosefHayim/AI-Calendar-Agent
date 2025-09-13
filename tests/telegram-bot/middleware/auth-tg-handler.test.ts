import type { GlobalContext } from '@/telegram-bot/init-bot';
import { authTgHandler } from '@/telegram-bot/middleware/auth-tg-handler';

const fromTable = jest.fn();
const select = jest.fn();
const eq = jest.fn();
const single = jest.fn();

jest.mock('@/config/root-config', () => ({
  SUPABASE: {
    from: (table: string) => fromTable(table),
  },
}));

jest.mock('validator/lib/isEmail', () => jest.fn((x: string) => x.includes('@')));

import isEmail from 'validator/lib/isEmail';

type PartialCtx = Pick<
  GlobalContext,
  'from' | 'session' | 'message' | 'reply'
>;

// Helpers
const mkCtx = (overrides?: Partial<PartialCtx>): any => {
  const base: any = {
    from: {
      id: 123,
      username: 'john',
      first_name: 'John',
      language_code: 'en',
    },
    session: {
      chatId: 0,
      userId: 0,
      username: '',
      codeLang: undefined,
      messageCount: 0,
      email: undefined as string | undefined,
    },
    message: undefined,
    reply: jest.fn(async () => {}),
  };
  return { ...base, ...overrides };
};

const resolveDbRow = (row: any) => {
  fromTable.mockImplementation((table: string) => {
    expect(table).toBe('user_telegram_links');
    return { select };
  });
  select.mockImplementation((_sel: string) => ({ eq }));
  eq.mockImplementation((_col: string, _val: any) => ({ single }));
  single.mockResolvedValue({ data: row });
};

const resetDbMocks = () => {
  fromTable.mockReset();
  select.mockReset();
  eq.mockReset();
  single.mockReset();
};

describe('authTgHandler', () => {
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    resetDbMocks();
  });

  it('passes through when ctx.from or ctx.session is missing', async () => {
    resolveDbRow(null);

    const ctx1 = mkCtx({ from: undefined as any });
    await authTgHandler(ctx1 as any, next);
    expect(next).toHaveBeenCalledTimes(1);

    next.mockClear();
    const ctx2 = mkCtx({ session: undefined as any });
    await authTgHandler(ctx2 as any, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('initializes session on first contact', async () => {
    resolveDbRow(null);

    const ctx = mkCtx();
    expect(ctx.session.chatId).toBe(0);

    ctx.message = { text: 'hello' } as any;

    await authTgHandler(ctx as any, next);

    expect(ctx.session.chatId).toBe(ctx.from.id);
    expect(ctx.session.userId).toBe(ctx.from.id);
    expect(ctx.session.username).toBe(ctx.from.username);
    expect(ctx.session.codeLang).toBe(ctx.from.language_code);
    expect(ctx.session.messageCount).toBe(0);

    expect(ctx.reply).toHaveBeenCalledWith(
      'First time? Please provide your email to authorize:'
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('loads existing user from DB, sets email if missing, greets once, increments count, calls next', async () => {
    resolveDbRow({ email: 'john@example.com', first_name: 'John' });

    const ctx = mkCtx();
    await authTgHandler(ctx as any, next);

    expect(ctx.session.email).toBe('john@example.com');

    expect(ctx.reply).toHaveBeenCalledWith('Hello there John');

    expect(ctx.session.messageCount).toBe(1);
    expect(next).toHaveBeenCalledTimes(1);

    next.mockClear();
    ctx.reply.mockClear();
    await authTgHandler(ctx as any, next);
    expect(ctx.reply).not.toHaveBeenCalled();
    expect(ctx.session.messageCount).toBe(2);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('asks for email when not in DB and not in session, does not call next', async () => {
    resolveDbRow(null);

    const ctx = mkCtx({ message: { text: 'not-an-email' } as any });
    await authTgHandler(ctx as any, next);

    expect(ctx.reply).toHaveBeenCalledWith(
      'First time? Please provide your email to authorize:'
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('saves provided valid email, replies success, increments count, calls next', async () => {
    resolveDbRow(null);

    const upsert = jest.fn().mockResolvedValue({ data: {}, error: null });
    // Extend SUPABASE.from to also be used for upsert call path
    fromTable.mockImplementation((table: string) => {
      expect(table).toBe('user_telegram_links');
      return {
        select,
        upsert,
      };
    });
    select.mockImplementation((_sel: string) => ({ eq }));
    eq.mockImplementation((_col: string, _val: any) => ({ single }));
    single.mockResolvedValue({ data: null });

    (isEmail as jest.Mock).mockImplementation((x: string) => true);

    const ctx = mkCtx({ message: { text: 'jane@company.com' } as any });
    await authTgHandler(ctx as any, next);

    // Email stored in session
    expect(ctx.session.email).toBe('jane@company.com');

    // Upsert called with expected payload
    expect(upsert).toHaveBeenCalledWith({
      chat_id: ctx.from.id,
      username: ctx.from.username,
      first_name: ctx.from.first_name,
      language_code: ctx.from.language_code,
      email: 'jane@company.com',
    });

    // Confirmation, count increment, next called
    expect(ctx.reply).toHaveBeenCalledWith('Email has been saved successfully!');
    expect(ctx.session.messageCount).toBe(1);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('with existing session.email and no DB row, proceeds to next without prompting', async () => {
    resolveDbRow(null);

    const ctx = mkCtx({
      session: {
        chatId: 123,
        userId: 123,
        username: 'john',
        codeLang: 'en',
        messageCount: 2,
        email: 'exists@acme.com',
      },
    });

    await authTgHandler(ctx as any, next);

    expect(ctx.reply).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('when DB has email and session.email already set, does not overwrite, greets only if first message', async () => {
    resolveDbRow({ email: 'db@mail.com', first_name: 'DBUser' });

    const ctx = mkCtx({
      session: {
        chatId: 123,
        userId: 123,
        username: 'john',
        codeLang: 'en',
        messageCount: 0,
        email: 'session@mail.com',
      },
    });

    await authTgHandler(ctx as any, next);

    // Keep existing session email (middleware only sets email if missing)
    expect(ctx.session.email).toBe('session@mail.com');
    expect(ctx.reply).toHaveBeenCalledWith('Hello there DBUser');
    expect(ctx.session.messageCount).toBe(1);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
