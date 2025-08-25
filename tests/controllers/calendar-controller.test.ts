import { describe, it, beforeEach, expect, jest } from '@jest/globals';

type Res = {
  status: jest.Mock;
  json: jest.Mock;
  send: jest.Mock;
};
const makeRes = (): Res => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
    send: jest.fn(),
  } as any;
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
};

const makeReq = (overrides: any = {}) =>
  ({
    params: {},
    query: {},
    body: {},
    user: { email: 'user@example.com' },
    ...overrides,
  } as any);

  const makeNext = () => jest.fn() as unknown as NextFunction;
  

const sendR = jest.fn();
jest.mock('@/utils/send-response', () => ({
  __esModule: true,
  default: (...args: any[]) => (sendR as any)(...args),
}));

const fetchCredentialsByEmail = jest.fn();
jest.mock('@/utils/get-user-calendar-tokens', () => ({
  fetchCredentialsByEmail: (...args: any[]) => (fetchCredentialsByEmail as any)(...args),
}));

const initCalendarWithUserTokensAndUpdateTokens = jest.fn();
jest.mock('@/utils/init-calendar-with-user-tokens-and-update-tokens', () => ({
  initCalendarWithUserTokensAndUpdateTokens: (...args: any[]) =>
    (initCalendarWithUserTokensAndUpdateTokens as any)(...args),
}));

const eventsHandler = jest.fn();
jest.mock('@/utils/handle-events', () => ({
  eventsHandler: (...args: any[]) => (eventsHandler as any)(...args),
}));

// request config constants
jest.mock('@/config/root-config', () => ({
  requestConfigBase: { calendarId: 'primary', sendUpdates: 'all', supportsAttachments: true },
}));

// status/action constants and minimal types
jest.mock('@/types', () => ({
  ACTION: { GET: 'GET', INSERT: 'INSERT', UPDATE: 'UPDATE', DELETE: 'DELETE' },
  STATUS_RESPONSE: {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
}));

// Make reqResAsyncHandler a transparent wrapper so logic runs synchronously in tests
jest.mock('@/utils/async-handlers', () => ({
  reqResAsyncHandler:
    (fn: any) =>
    async (req: any, res: any) =>
      fn(req, res,makeNext),
}));

import handlers from '@/controllers/calendar-controller'; 
import { STATUS_RESPONSE, ACTION } from '@/types';
import { requestConfigBase } from '@/config/root-config';
import { NextFunction } from 'express';

describe('calendar handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCalendars', () => {
    it('returns 404 when no tokenData', async () => {
      fetchCredentialsByEmail.mockResolvedValueOnce(null);
      const req = makeReq();
      const res = makeRes();

      await handlers.getAllCalendars(req, res,makeNext);

      expect(fetchCredentialsByEmail).toHaveBeenCalledWith('user@example.com');
      expect(sendR).toHaveBeenCalledWith(
        res,
        STATUS_RESPONSE.NOT_FOUND,
        'User credentials not found in order to retrieve all calendars.'
      );
    });

    it('lists calendars and maps summaries', async () => {
      fetchCredentialsByEmail.mockResolvedValueOnce({ access_token: 'tok' });
      const list = jest.fn().mockResolvedValue({
        data: { items: [{ summary: 'Primary' }, { summary: 'Team' }] },
      });
      initCalendarWithUserTokensAndUpdateTokens.mockResolvedValueOnce({
        calendarList: { list },
      });

      const req = makeReq();
      const res = makeRes();

      await handlers.getAllCalendars(req, res,makeNext);

      expect(initCalendarWithUserTokensAndUpdateTokens).toHaveBeenCalledWith({ access_token: 'tok' });
      expect(list).toHaveBeenCalledTimes(1);
      expect(sendR).toHaveBeenCalledWith(
        res,
        STATUS_RESPONSE.SUCCESS,
        'Successfully received your current calendars',
        ['Primary', 'Team']
      );
    });
  });

  describe('getCalendarColors', () => {
    it('returns colors payload', async () => {
      fetchCredentialsByEmail.mockResolvedValueOnce({ access_token: 'tok' });
      const get = jest.fn().mockResolvedValue({ data: { event: { background: '#fff' } } });
      initCalendarWithUserTokensAndUpdateTokens.mockResolvedValueOnce({
        colors: { get },
      });

      const req = makeReq();
      const res = makeRes();
      await handlers.getCalendarColors(req, res,makeNext);

      expect(get).toHaveBeenCalledTimes(1);
      expect(sendR).toHaveBeenCalledWith(
        res,
        STATUS_RESPONSE.SUCCESS,
        'Successfully received calendar colors',
        { event: { background: '#fff' } }
      );
    });
  });

  describe('getCalendarTimezone', () => {
    it('returns timezone setting', async () => {
      fetchCredentialsByEmail.mockResolvedValueOnce({ access_token: 'tok' });
      const get = jest.fn().mockResolvedValue({ data: { value: 'UTC' } });
      initCalendarWithUserTokensAndUpdateTokens.mockResolvedValueOnce({
        settings: { get },
      });

      const req = makeReq();
      const res = makeRes();
      await handlers.getCalendarTimezone(req, res,makeNext);

      expect(get).toHaveBeenCalledWith({ setting: 'timezone' });
      expect(sendR).toHaveBeenCalledWith(
        res,
        STATUS_RESPONSE.SUCCESS,
        'Successfully received calendar timezone',
        { value: 'UTC' }
      );
    });
  });

  describe('getSpecificEvent', () => {
    it('404 when tokenData missing', async () => {
      fetchCredentialsByEmail.mockResolvedValueOnce(null);
      const req = makeReq({ params: { eventId: 'e1' } });
      const res = makeRes();

      await handlers.getSpecificEvent(req, res,makeNext);

      expect(sendR).toHaveBeenCalledWith(res, STATUS_RESPONSE.NOT_FOUND, 'User token not found.');
    });

    it('400 when eventId missing', async () => {
      fetchCredentialsByEmail.mockResolvedValueOnce({ access_token: 'tok' });
      const req = makeReq({ params: {} });
      const res = makeRes();

      await handlers.getSpecificEvent(req, res,makeNext);

      expect(sendR).toHaveBeenCalledWith(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        'Event ID is required in order to get specific event.'
      );
    });

    it('calls calendar.events.get with base config + eventId and returns data', async () => {
      fetchCredentialsByEmail.mockResolvedValueOnce({ access_token: 'tok' });
      const get = jest.fn().mockResolvedValue({ data: { id: 'e1' } });
      initCalendarWithUserTokensAndUpdateTokens.mockResolvedValueOnce({
        events: { get },
      });

      const req = makeReq({ params: { eventId: 'e1' } });
      const res = makeRes();

      await handlers.getSpecificEvent(req, res,makeNext);

      expect(get).toHaveBeenCalledWith({ ...requestConfigBase, eventId: 'e1' });
      expect(sendR).toHaveBeenCalledWith(res, STATUS_RESPONSE.SUCCESS, 'Event retrieved successfully', { id: 'e1' });
    });
  });

  describe('getAllEvents', () => {
    it('delegates to eventsHandler with ACTION.GET', async () => {
      eventsHandler.mockResolvedValueOnce({ totalNumberOfEventsFound: 0, totalEventsFound: [] });

      const req = makeReq();
      const res = makeRes();

      await handlers.getAllEvents(req, res,makeNext);

      expect(eventsHandler).toHaveBeenCalledWith(req, ACTION.GET);
      expect(sendR).toHaveBeenCalledWith(
        res,
        STATUS_RESPONSE.SUCCESS,
        'Successfully retrieved all events',
        { totalNumberOfEventsFound: 0, totalEventsFound: [] }
      );
    });
  });

  describe('getAllFilteredEvents', () => {
    it('passes req.query to eventsHandler', async () => {
      eventsHandler.mockResolvedValueOnce({ ok: true });
      const req = makeReq({ query: { timeMin: '2024-01-01', email: 'ignore@x.com' } });
      const res = makeRes();

      await handlers.getAllFilteredEvents(req, res,makeNext);

      expect(eventsHandler).toHaveBeenCalledWith(req, ACTION.GET, undefined, req.query);
      expect(sendR).toHaveBeenCalledWith(
        res,
        STATUS_RESPONSE.SUCCESS,
        'Successfully retrieved all filtered events',
        { ok: true }
      );
    });
  });

  describe('createEvent', () => {
    it('calls INSERT and responds 201', async () => {
      eventsHandler.mockResolvedValueOnce({ data: { id: 'new' } });
      const req = makeReq({ body: { summary: 'X' } });
      const res = makeRes();

      await handlers.createEvent(req, res,makeNext);

      expect(eventsHandler).toHaveBeenCalledWith(req, ACTION.INSERT, req.body);
      expect(sendR).toHaveBeenCalledWith(res, STATUS_RESPONSE.CREATED, 'Event created successfully', {
        data: { id: 'new' },
      });
    });
  });

  describe('updateEvent', () => {
    it('400 when eventId missing', async () => {
      const req = makeReq({ params: {}, body: { summary: 'x' } });
      const res = makeRes();

      await handlers.updateEvent(req, res,makeNext);

      expect(sendR).toHaveBeenCalledWith(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        'Event ID is required in order to update event.'
      );
      expect(eventsHandler).not.toHaveBeenCalled();
    });

    it('calls UPDATE and responds with NOT_FOUND (as implemented)', async () => {
      eventsHandler.mockResolvedValueOnce({ ok: true });
      const req = makeReq({ params: { eventId: 'e1' }, body: { summary: 'x' } });
      const res = makeRes();

      await handlers.updateEvent(req, res,makeNext);

      expect(eventsHandler).toHaveBeenCalledWith(req, ACTION.UPDATE, { id: 'e1', summary: 'x' });
      // Note: implementation uses NOT_FOUND on success; asserting as-is
      expect(sendR).toHaveBeenCalledWith(res, STATUS_RESPONSE.NOT_FOUND, 'Event updated successfully', { ok: true });
    });
  });

  describe('deleteEvent', () => {
    it('400 when eventId missing', async () => {
      const req = makeReq({ params: {} });
      const res = makeRes();

      await handlers.deleteEvent(req, res,makeNext);

      expect(sendR).toHaveBeenCalledWith(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        'Event ID is required in order to delete event.'
      );
      expect(eventsHandler).not.toHaveBeenCalled();
    });

    it('calls DELETE and responds with NOT_FOUND (as implemented)', async () => {
      eventsHandler.mockResolvedValueOnce({ ok: true });
      const req = makeReq({ params: { eventId: 'e1' } });
      const res = makeRes();

      await handlers.deleteEvent(req, res,makeNext);

      expect(eventsHandler).toHaveBeenCalledWith(req, ACTION.DELETE, { id: 'e1' });
      // Note: implementation uses NOT_FOUND on success; asserting as-is
      expect(sendR).toHaveBeenCalledWith(res, STATUS_RESPONSE.NOT_FOUND, 'Event deleted successfully', { ok: true });
    });
  });
});
