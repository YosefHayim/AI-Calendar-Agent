import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const noopMw = jest.fn((_req: any, _res: any, next?: () => void) => next?.());

// Core middleware mocks (ESM default + CJS compatibility)
jest.mock('cors', () => {
  const fn = jest.fn(() => noopMw);
  return { __esModule: true, default: fn, ...fn };
});
jest.mock('cookie-parser', () => {
  const fn = jest.fn(() => noopMw);
  return { __esModule: true, default: fn, ...fn };
});
jest.mock('morgan', () => {
  const fn = jest.fn(() => noopMw);
  return { __esModule: true, default: fn, ...fn };
});

// Express app/utility mocks (refs reassigned in beforeEach for clean state)
let staticMw: jest.Mock, jsonMw: jest.Mock, urlencodedMw: jest.Mock;
let appUse: jest.Mock, appGet: jest.Mock, appListen: jest.Mock;
let expressMock: any;
let corsMock: jest.Mock, cookieParserMock: jest.Mock, morganMock: jest.Mock;
let pathJoinMock: jest.Mock;

const buildExpressMock = () => {
  staticMw = jest.fn();
  jsonMw = jest.fn();
  urlencodedMw = jest.fn();
  appUse = jest.fn();
  appGet = jest.fn();
  appListen = jest.fn((_port: number, cb?: (err?: Error) => void) => cb?.());

  const fn: any = jest.fn(() => ({
    use: appUse,
    get: appGet,
    listen: appListen,
  }));
  fn.json = jest.fn(() => jsonMw);
  fn.urlencoded = jest.fn(() => urlencodedMw);
  fn.static = jest.fn(() => staticMw);
  expressMock = fn;

  return {
    __esModule: true,
    default: fn, // ESM default
    ...fn,       // CJS require('express')
  };
};

// Mock express with a fresh mock each module load cycle
jest.mock('express', () => buildExpressMock());

// path.join mock
jest.mock('node:path', () => ({
  __esModule: true,
  default: { join: jest.fn(() => '/abs/public') },
  join: jest.fn(() => '/abs/public'),
}));

// Config mock
jest.mock('@/config/root-config', () => ({
  CONFIG: { port: 4321 },
}));

// Routers
const usersRouter = jest.fn((_req: any, _res: any, next?: () => void) => next?.());
jest.mock('@/routes/users', () => ({
  __esModule: true,
  default: usersRouter,
}));

const calendarRouter = jest.fn((_req: any, _res: any, next?: () => void) => next?.());
jest.mock('@/routes/calendar-route', () => ({
  __esModule: true,
  default: calendarRouter,
}));

// Error handler
const errorHandler = jest.fn((_err: any, _req: any, _res: any, _next: any) => {});
jest.mock('@/middlewares/error-handler', () => ({
  __esModule: true,
  default: errorHandler,
}));

// Telegram bot
const startTelegramBot = jest.fn();
jest.mock('@/telegram-bot/init-bot', () => ({
  startTelegramBot,
}));

// Types used by app.ts
jest.mock('@/types', () => ({
  ROUTES: { USERS: '/users', CALENDAR: '/calendar' },
  STATUS_RESPONSE: { SUCCESS: 200 },
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetModules();

  corsMock = jest.fn(() => noopMw);
  cookieParserMock = jest.fn(() => noopMw);
  morganMock = jest.fn(() => noopMw);

  jest.doMock('cors', () => ({ __esModule: true, default: corsMock }));
  jest.doMock('cookie-parser', () => ({ __esModule: true, default: cookieParserMock }));
  jest.doMock('morgan', () => ({ __esModule: true, default: morganMock }));

  // deterministic path.join
  pathJoinMock = jest.fn(() => '/abs/public');
  jest.doMock('node:path', () => ({
    __esModule: true,
    default: { join: pathJoinMock },
    join: pathJoinMock,
  }));

  // fresh express
  jest.doMock('express', () => buildExpressMock());

  jest.isolateModules(() => {
    require('@/app.ts');
  });
});



describe('server bootstrap', () => {
  it('configures express with core middlewares and static', () => {
    expect(expressMock).toHaveBeenCalledTimes(1);

    // cors()
    const cors = (require('cors').default || require('cors')) as jest.Mock;
    expect(cors).toHaveBeenCalled();
    expect(appUse).toHaveBeenCalledWith(noopMw);

    // express.json()
    expect(expressMock.json).toHaveBeenCalledWith();
    expect(appUse).toHaveBeenCalledWith(jsonMw);

    // cookie-parser()
    const cookieParser = (require('cookie-parser').default || require('cookie-parser')) as jest.Mock;
    expect(cookieParser).toHaveBeenCalled();
    expect(appUse).toHaveBeenCalledWith(noopMw);

    // express.urlencoded({ extended: true })
    expect(expressMock.urlencoded).toHaveBeenCalledWith({ extended: true });
    expect(appUse).toHaveBeenCalledWith(urlencodedMw);

    // morgan('dev')
    const morgan = (require('morgan').default || require('morgan')) as jest.Mock;
    expect(morgan).toHaveBeenCalledWith('dev');
    expect(appUse).toHaveBeenCalledWith(noopMw);

    // express.static(public path) mounted at /static
    expect(expressMock.static).toHaveBeenCalledWith('/public');
    expect(appUse).toHaveBeenCalledWith('/public', staticMw);
  });

  it('registers health route and responds with 200 "Server is running."', () => {
    expect(appGet).toHaveBeenCalledWith('/', expect.any(Function));

    const handler = appGet.mock.calls[0][1] as (req: any, res: any) => void;

    const send = jest.fn();
    const status = jest.fn(() => ({ send }));
    const res = { status } as any;

    handler({}, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledWith('Server is running.');
  });

  it('mounts routers and error handler', () => {
    expect(appUse).toHaveBeenCalledWith('/users', usersRouter);
    expect(appUse).toHaveBeenCalledWith('/calendar', calendarRouter);

    const wasErrorMwRegistered = appUse.mock.calls.some(
      (args) => args.length === 1 && args[0] === errorHandler
    );
    expect(wasErrorMwRegistered).toBe(true);
  });

  it('starts server on CONFIG.port and calls startTelegramBot', () => {
    expect(appListen).toHaveBeenCalledWith(4321, expect.any(Function));
    expect(startTelegramBot).toHaveBeenCalledTimes(1);
  });

  it('listen callback rethrows when error is provided', () => {
    const cb = appListen.mock.calls[0][1] as (err?: Error) => void;
    expect(() => cb(new Error('boom'))).toThrow('boom');
  });
});
