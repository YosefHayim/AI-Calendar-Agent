// __tests__/telegram-bot.test.ts
import { startTelegramBot } from '@/telegram-bot/init-bot';
import {expect, jest, test} from '@jest/globals';


jest.mock('grammy', () => {
  const ctxMock = { conversation: { enter: jest.fn() } };
  const BotMock = jest.fn().mockImplementation(() => ({
    catch: jest.fn(),
    use: jest.fn(),
    command: jest.fn(),
  }));
  return {
    Bot: BotMock,
    session: jest.fn(() => 'session-middleware'),
    Context: jest.fn(),
  };
});

jest.mock('@grammyjs/conversations', () => ({
  conversations: jest.fn(() => 'conversations-middleware'),
  createConversation: jest.fn(() => 'createConversation-middleware'),
}));

jest.mock('@grammyjs/runner', () => ({
  run: jest.fn(),
}));

jest.mock('../path/to/middleware/auth-tg-handler', () => ({
  authTgHandler: 'auth-middleware',
}));

jest.mock('../path/to/conversations', () => ({
  scheduleEvent: jest.fn(),
}));

describe('Telegram Bot initialization', () => {
  let Bot: any;
  let run: jest.Mock;
  let conversations: jest.Mock;
  let createConversation: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    Bot = require('grammy').Bot;
    run = require('@grammyjs/runner').run;
    conversations = require('@grammyjs/conversations').conversations;
    createConversation = require('@grammyjs/conversations').createConversation;
  });

  it('should wire middlewares and commands correctly', () => {
    startTelegramBot();

    expect(Bot).toHaveBeenCalledWith(expect.any(String));
    const botInstance = Bot.mock.results[0].value;

    // check middleware chain
    expect(botInstance.use).toHaveBeenCalledWith('session-middleware');
    expect(botInstance.use).toHaveBeenCalledWith('auth-middleware');
    expect(botInstance.use).toHaveBeenCalledWith('conversations-middleware');
    expect(botInstance.use).toHaveBeenCalledWith('createConversation-middleware');

    // check command wiring
    expect(botInstance.command).toHaveBeenCalledWith(
      'schedule',
      expect.any(Function)
    );

    // check run is called
    expect(run).toHaveBeenCalledWith(botInstance);
  });
});
