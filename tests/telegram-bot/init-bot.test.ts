// tests/telegram-bot/init-bot.test.ts
import { jest } from '@jest/globals';

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
      const { startTelegramBot } = require('../../src/telegram-bot/init-bot');
      const { Bot } = require('grammy');
      const { run } = require('@grammyjs/runner');

      startTelegramBot();

      const BotMock = Bot as jest.Mock;
      expect(BotMock).toHaveBeenCalledTimes(1);
      expect(BotMock).toHaveBeenCalledWith(expect.any(String)); // token string

      const botInstance: any = BotMock.mock.results[0].value;

      expect(botInstance.catch).toHaveBeenCalledTimes(1);
      expect(botInstance.use).toHaveBeenCalled(); // multiple times is fine
      expect(botInstance.command).toHaveBeenCalledWith('schedule', expect.any(Function));
      expect(run).toHaveBeenCalledWith(botInstance);
    });
  });
});
