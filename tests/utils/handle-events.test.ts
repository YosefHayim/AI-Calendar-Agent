import { expect, jest, test } from '@jest/globals';
import type { Request } from 'express';
import { ACTION, STATUS_RESPONSE } from '@/types';

jest.mock('@/config/root-config', () => ({
  requestConfigBase: { calendarId: 'primary', sendUpdates: 'all', supportsAttachments: true },
}));

const fetchCredentialsByEmailMock = jest.fn();
jest.mock('@/utils/get-user-calendar-tokens', () => ({
  fetchCredentialsByEmail: (...args: unknown[]) => fetchCredentialsByEmailMock(...args),
}));

const initCalendarWithUserTokensAndUpdateTokensMock = jest.fn();
jest.mock('@/utils/init-calendar-with-user-tokens-and-update-tokens', () => ({
  initCalendarWithUserTokensAndUpdateTokens: (...args: unknown[]) => initCalendarWithUserTokensAndUpdateTokensMock(...args),
}));

const getEventDurationStringMock = jest.fn();
jest.mock('@/utils/get-event-duration-string', () => ({
  getEventDurationString: (...args: unknown[]) => getEventDurationStringMock(...args),
}));

import { eventsHandler } from '@/utils/handle-events';

describe('eventsHandler (closer-to-real mocks)', () => {
  const TEST_EMAIL = process.env.testEmail || 'test@example.com';

  const listMock = jest.fn();
  const insertMock = jest.fn();
  const updateMock = jest.fn();
  const deleteMock = jest.fn();

  const setCalendarMocks = () => {
    listMock.mockReset();
    insertMock.mockReset();
    updateMock.mockReset();
    deleteMock.mockReset();

    initCalendarWithUserTokensAndUpdateTokensMock.mockResolvedValue({
      events: {
        list: listMock,
        insert: insertMock,
        update: updateMock,
        delete: deleteMock,
      },
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setCalendarMocks();
    fetchCredentialsByEmailMock.mockResolvedValue({ access_token: 'tok', refresh_token: 'r-tok', scope: 'scope', token_type: 'Bearer', id_token: 'id-tok', expiry_date: 123, refresh_token_expires_in: 123 });
  });

  test('400 when email missing', async () => {
    await expect(eventsHandler(undefined, ACTION.GET)).rejects.toThrow('Email is required to resolve calendar credentials');
  });

  test('GET maps events and uses real-like base config', async () => {
    const req = { user: { email: TEST_EMAIL } } as unknown as Request;

    getEventDurationStringMock.mockReturnValueOnce('2h').mockReturnValueOnce('1h 30m');

    listMock.mockResolvedValue({
      data: {
        items: [
          {
            id: 'e1',
            summary: 'Standup',
            description: 'Daily',
            location: 'Zoom',
            start: { dateTime: '2024-01-01T09:00:00Z' },
            end: { dateTime: '2024-01-01T11:00:00Z' },
          },
          {
            id: 'e2',
            summary: undefined,
            description: null,
            location: undefined,
            start: { date: '2024-01-02' },
            end: { date: '2024-01-02' },
          },
        ],
      },
    });

    const result = (await eventsHandler(req, ACTION.GET)) as unknown;

    expect(fetchCredentialsByEmailMock).toHaveBeenCalledWith(TEST_EMAIL);

    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarId: 'primary',
        sendUpdates: 'all',
        supportsAttachments: true,
        prettyPrint: true,
        maxResults: 2500,
      })
    );

    expect(getEventDurationStringMock).toHaveBeenNthCalledWith(1, '2024-01-01T09:00:00Z', '2024-01-01T11:00:00Z');
    expect(getEventDurationStringMock).toHaveBeenNthCalledWith(2, '2024-01-02', '2024-01-02');

    expect(result).toEqual({
      totalNumberOfEventsFound: 2,
      totalEventsFound: [
        {
          eventId: 'e1',
          summary: 'Standup',
          durationOfEvent: '2h',
          description: 'Daily',
          location: 'Zoom',
          start: '2024-01-01T09:00:00Z',
        },
        {
          eventId: 'e2',
          summary: 'Untitled Event',
          durationOfEvent: '1h 30m',
          description: null,
          location: null,
          start: '2024-01-02',
        },
      ],
    });
  });

  test('GET strips email from extra and forwards others', async () => {
    const extra = {
      email: 'omit@x.com',
      timeMin: '2024-01-01T00:00:00Z',
      timeMax: '2024-01-31T23:59:59Z',
      singleEvents: 'true',
    };

    listMock.mockResolvedValue({ data: { items: [] } });

    const result = (await eventsHandler(undefined as unknown, ACTION.GET, undefined, {
      ...extra,
      email: TEST_EMAIL,
    })) as unknown;

    expect(fetchCredentialsByEmailMock).toHaveBeenCalledWith(TEST_EMAIL);

    const callArg = listMock.mock.calls[0][0];
    expect(callArg.email).toBeUndefined();
    expect(callArg.timeMin).toBe(extra.timeMin);
    expect(callArg.timeMax).toBe(extra.timeMax);
    expect(callArg.singleEvents).toBe(extra.singleEvents);

    expect(result).toEqual({ totalNumberOfEventsFound: 0, totalEventsFound: [] });
  });

  test('INSERT honors calendarId and requestBody; uses real-like base config', async () => {
    insertMock.mockResolvedValue({ data: { id: 'new-id' } });

    const res = await eventsHandler({ user: { email: TEST_EMAIL } } as unknown as Request, ACTION.INSERT, { summary: 'New Event' } as unknown, {
      calendarId: 'primary',
    });

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarId: 'primary',
        sendUpdates: 'all',
        supportsAttachments: true,
        requestBody: { summary: 'New Event' },
      })
    );
    expect(res).toEqual({ data: { id: 'new-id' } });
  });

  test('UPDATE without id -> 400', async () => {
    await expect(eventsHandler({ user: { email: TEST_EMAIL } } as unknown as Request, ACTION.UPDATE, {} as unknown)).rejects.toThrow(
      'Event ID is required for update or delete action'
    );
  });

  test('UPDATE passes eventId and body; preserves base config', async () => {
    updateMock.mockResolvedValue({ data: { id: 'e123', updated: true } });

    const res = await eventsHandler({ user: { email: TEST_EMAIL } } as unknown as Request, ACTION.UPDATE, { id: 'e123', summary: 'Edited' } as unknown);

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarId: 'primary',
        sendUpdates: 'all',
        supportsAttachments: true,
        eventId: 'e123',
        requestBody: { id: 'e123', summary: 'Edited' },
      })
    );
    expect(res).toEqual({ data: { id: 'e123', updated: true } });
  });

  test('DELETE without id -> 400', async () => {
    await expect(eventsHandler({ user: { email: TEST_EMAIL } } as unknown as Request, ACTION.DELETE, {} as unknown)).rejects.toThrow(
      'Event ID is required for update or delete action'
    );
  });

  test('DELETE passes eventId; preserves base config', async () => {
    deleteMock.mockResolvedValue({ data: { id: 'e999', deleted: true } });

    const res = await eventsHandler({ user: { email: TEST_EMAIL } } as unknown as Request, ACTION.DELETE, { id: 'e999' } as unknown);

    expect(deleteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarId: 'primary',
        sendUpdates: 'all',
        supportsAttachments: true,
        eventId: 'e999',
      })
    );
    expect(res).toEqual({ data: { id: 'e999', deleted: true } });
  });

  test('maps events with missing fields safely', async () => {
    getEventDurationStringMock.mockReturnValueOnce(null);

    listMock.mockResolvedValue({
      data: {
        items: [
          {
            start: { dateTime: '2024-05-01T10:00:00Z' },
            end: { dateTime: '2024-05-01T10:00:30Z' },
          },
        ],
      },
    });

    const res = (await eventsHandler({ user: { email: TEST_EMAIL } } as unknown as Request, ACTION.GET)) as unknown;

    expect(res.totalNumberOfEventsFound).toBe(1);
    expect(res.totalEventsFound[0]).toEqual({
      eventId: 'No ID',
      summary: 'Untitled Event',
      durationOfEvent: null,
      description: null,
      location: null,
      start: '2024-05-01T10:00:00Z',
    });
  });

  test('propagates calendar API errors', async () => {
    listMock.mockRejectedValueOnce(new Error('calendar down'));
    await expect(eventsHandler({ user: { email: TEST_EMAIL } } as unknown as Request, ACTION.GET)).rejects.toThrow('calendar down');
  });

  test('STATUS_RESPONSE constants exist', () => {
    expect(STATUS_RESPONSE).toBeDefined();
    expect(typeof STATUS_RESPONSE.BAD_REQUEST).toBe('number');
  });

  test('email can be supplied via extra when req is undefined', async () => {
    listMock.mockResolvedValue({ data: { items: [] } });
    await eventsHandler(undefined as unknown, ACTION.GET, undefined, { email: TEST_EMAIL });
    expect(fetchCredentialsByEmailMock).toHaveBeenCalledWith(TEST_EMAIL);
    expect(listMock).toHaveBeenCalledTimes(1);
  });
});
