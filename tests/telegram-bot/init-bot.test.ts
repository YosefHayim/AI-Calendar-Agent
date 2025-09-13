// tests/telegram-bot/init-bot.test.ts
import { jest } from '@jest/globals';

const mkTool = () => jest.fn();

jest.mock('@/ai-agents/agents', () => ({
  AGENTS: {
    normalizeEventAgent: { asTool: jest.fn(() => mkTool()) },
    getUserDefaultTimeZone: { asTool: jest.fn(() => mkTool()) },
    validateEventFields: { asTool: jest.fn(() => mkTool()) },
    analysesCalendarTypeByEventInformation: { asTool: jest.fn(() => mkTool()) },
  },
  AGENT_HANDOFFS: {},
}));

jest.mock('@/ai-agents/agents', () => ({
  AGENTS: {
    normalizeEventAgent: { asTool: jest.fn(() => mkTool()) },
    getUserDefaultTimeZone: { asTool: jest.fn(() => mkTool()) },
    validateEventFields: { asTool: jest.fn(() => mkTool()) },
    analysesCalendarTypeByEventInformation: { asTool: jest.fn(() => mkTool()) },
  },
  AGENT_HANDOFFS: {},
}));

jest.mock('@openai/agents', () => {
  const tool = jest.fn(() => mkTool());
  class Agent {
    asTool = jest.fn(() => mkTool());
  }
  return {
    Agent,
    tool,
    setDefaultOpenAIKey: jest.fn(),
    setTracingExportApiKey: jest.fn(),
  };
});

beforeEach(() => {
  jest.resetModules();
});

jest.mock('@grammyjs/runner', () => ({ run: jest.fn() }));

jest.mock('grammy', () => {
  const Bot = jest.fn().mockImplementation(() => ({
    catch: jest.fn(),
    use: jest.fn(),
    command: jest.fn(),
  }));
  const session = jest.fn(() => (_: unknown) => undefined);
  return { Bot, session };
});

jest.mock('@grammyjs/conversations', () => ({
  conversations: jest.fn(() => (_: unknown) => undefined),
  createConversation: jest.fn(() => (_: unknown) => undefined),
}));

describe('Telegram Bot initialization', () => {
  it('should wire middlewares and commands correctly', () => {
    jest.isolateModules(() => {
      const { startTelegramBot } = require('@/telegram-bot/init-bot');
      const { Bot } = require('grammy');
      const { run } = require('@grammyjs/runner');

      startTelegramBot();

      const BotMock = Bot as jest.Mock;
      expect(BotMock).toHaveBeenCalledTimes(1);
      expect(BotMock).toHaveBeenCalledWith(expect.any(String));

      const botInstance: any = BotMock.mock.results[0].value;

      expect(botInstance.catch).toHaveBeenCalledTimes(1);
      expect(botInstance.use).toHaveBeenCalled();
      expect(botInstance.command).toHaveBeenCalledWith('schedule', expect.any(Function));
      expect(run).toHaveBeenCalledWith(botInstance);
    });
  });
});
