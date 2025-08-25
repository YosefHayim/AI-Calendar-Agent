import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const noopMw = jest.fn((_req: any, _res: any, next?: () => void) => next?.());

jest.mock('cors', () => jest.fn(() => noopMw));
jest.mock('cookie-parser', () => jest.fn(() => noopMw));
jest.mock('morgan', () => jest.fn(() => noopMw));

const staticMw = jest.fn();
const jsonMw = jest.fn();
const urlencodedMw = jest.fn();
const appUse = jest.fn();
const appGet = jest.fn();
const appListen = jest.fn((_port: number, cb?: (err?: Error) => void) => cb?.());

const expressMock = Object.assign(
  jest.fn(() => ({
    use: appUse,
    get: appGet,
    listen: appListen,
  })),
  {
    json: jest.fn(() => jsonMw),
    urlencoded: jest.fn(() => urlencodedMw),
    static: jest.fn(() => staticMw),
  }
);
jest.mock('express', () => ({
  __esModule: true,
  default: expressMock,
}));

jest.mock('node:path', () => ({
  __esModule: true,
  default: { join: jest.fn(() => '/abs/public') },
  join: jest.fn(() => '/abs/public'),
}));

jest.mock('@/config/root-config', () => ({
  CONFIG: { port: 4321 },
}));

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

const errorHandler = jest.fn((_err: any, _req: any, _res: any, _next: any) => {});
jest.mock('@/middlewares/error-handler', () => ({
  __esModule: true,
  default: errorHandler,
}));

const startTelegramBot = jest.fn();
jest.mock('@/telegram-bot/init-bot', () => ({
  startTelegramBot,
}));

jest.mock('@/types', () => ({
  ROUTES: { USERS: '/users', CALENDAR: '/calendar' },
  STATUS_RESPONSE: { SUCCESS: 200 },
}));

describe('server bootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('@/index');
    });
  });

  it('configures express with core middlewares and static', () => {
    expect(expressMock).toHaveBeenCalledTimes(1);

    expect(appUse).toHaveBeenCalledWith(expect.any(Function)); // cors()
    expect((expressMock as any).json).toHaveBeenCalledWith();
    expect(appUse).toHaveBeenCalledWith(jsonMw);

    const cookieParser = (require('cookie-parser').default || require('cookie-parser')) as jest.Mock;
    expect(cookieParser).toHaveBeenCalled();
    expect(appUse).toHaveBeenCalledWith(noopMw);

    expect((expressMock as any).urlencoded).toHaveBeenCalledWith({ extended: true });
    expect(appUse).toHaveBeenCalledWith(urlencodedMw);

    const morgan = (require('morgan').default || require('morgan')) as jest.Mock;
    expect(morgan).toHaveBeenCalledWith('dev');
    expect(appUse).toHaveBeenCalledWith(noopMw);

    expect((expressMock as any).static).toHaveBeenCalledWith('/abs/public');
    expect(appUse).toHaveBeenCalledWith(staticMw);
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
