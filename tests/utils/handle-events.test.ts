// tests/events-handler.test.ts
// Jest tests for eventsHandler. Pass user via env: process.env.testEmail

import type { Request } from 'express';
import { ACTION, STATUS_RESPONSE } from '@/types';

// Mocks for dependencies used by eventsHandler
jest.mock('@/config/root-config', () => ({
  requestConfigBase: { auth: 'test-auth', headers: { 'x-test': '1' } },
}));

const fetchCredentialsByEmailMock = jest.fn();
jest.mock('@/utils/get-user-calendar-tokens', () => ({
  fetchCredentialsByEmail: (...args: any[]) => fetchCredentialsByEmailMock(...args),
}));

const initCalendarWithUserTokensAndUpdateTokensMock = jest.fn();
jest.mock('@/utils/init-calendar-with-user-tokens-and-update-tokens', () => ({
  initCalendarWithUserTokensAndUpdateTokens: (...args: any[]) => initCalendarWithUserTokensAndUpdateTokensMock(...args),
}));

const getEventDurationStringMock = jest.fn();
jest.mock('@/utils/get-event-duration-string', () => ({
  getEventDurationString: (...args: any[]) => getEventDurationStringMock(...args),
}));

// Import after mocks
import { eventsHandler } from '@/utils/events-handler';

describe('eventsHandler', () => {
  const TEST_EMAIL = process.env.testEmail || 'yosefisabag@gmail.com';

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
    fetchCredentialsByEmailMock.mockResolvedValue({ access_token: 'tok' });
  });

  test('throws 400 when email is missing', async () => {
    await expect(eventsHandler(undefined, ACTION.GET)).rejects.toThrow('Email is required to resolve calendar credentials');
  });

  test('resolves email from req.user.email and performs GET with mapping', async () => {
    const req = { user: { email: TEST_EMAIL } } as unknown as Request;

    getEventDurationStringMock
      .mockReturnValueOnce('2h') // for first event
      .mockReturnValueOnce('1h 30m'); // for second event

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

    const result = (await eventsHandler(req, ACTION.GET)) as any;

    expect(fetchCredentialsByEmailMock).toHaveBeenCalledWith(TEST_EMAIL);
    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({
        auth: 'test-auth',
        prettyPrint: true,
        maxResults: 2500,
      })
    );

    // Ensure duration helper was called with the raw start/end strings
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

  test('GET removes email from extra and forwards other query params', async () => {
    const extra = {
      email: 'should_be_omitted@example.com',
      timeMin: '2024-01-01T00:00:00Z',
      timeMax: '2024-01-31T23:59:59Z',
    };

    listMock.mockResolvedValue({ data: { items: [] } });

    const result = (await eventsHandler(undefined as any, ACTION.GET, undefined, {
      ...extra,
      email: TEST_EMAIL,
    })) as any;

    expect(fetchCredentialsByEmailMock).toHaveBeenCalledWith(TEST_EMAIL);
    // Ensure list was called WITHOUT email but WITH timeMin/timeMax
    const callArg = listMock.mock.calls[0][0];
    expect(callArg.email).toBeUndefined();
    expect(callArg.timeMin).toBe(extra.timeMin);
    expect(callArg.timeMax).toBe(extra.timeMax);
    expect(result).toEqual({ totalNumberOfEventsFound: 0, totalEventsFound: [] });
  });

  test('INSERT uses provided calendarId (extra) and requestBody', async () => {
    insertMock.mockResolvedValue({ data: { id: 'new-id' } });

    const res = await eventsHandler({ user: { email: TEST_EMAIL } } as unknown as Request, ACTION.INSERT, { summary: 'New Event' } as any, {
      calendarId: 'primary',
    });

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarId: 'primary',
        requestBody: { summary: 'New Event' },
      })
    );
    expect(res).toEqual({ data: { id: 'new-id' } });
  });

  test('UPDATE without event id throws 400', async () => {
    await expect(eventsHandler({ user: { email: TEST_EMAIL } } as unknown as Request, ACTION.UPDATE, {} as any)).rejects.toThrow(
      'Event ID is required for update or delete action'
    );
  });

  test('UPDATE calls calendar.events.update with eventId and requestBody', async () => {
    updateMock.mockResolvedValue({ data: { id: 'e123', updated: true } });

    const res = await eventsHandler({ user: { email: TEST_EMAIL } } as unknown as Request, ACTION.UPDATE, { id: 'e123', summary: 'Edited' } as any);

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: 'e123',
        requestBody: { id: 'e123', summary: 'Edited' },
      })
    );
    expect(res).toEqual({ data: { id: 'e123', updated: true } });
  });

  test('DELETE without event id throws 400', async () => {
    await expect(eventsHandler({ user: { email: TEST_EMAIL } } as unknown as Request, ACTION.DELETE, {} as any)).rejects.toThrow(
      'Event ID is required for update or delete action'
    );
  });

  test('DELETE calls calendar.events.delete with eventId', async () => {
    deleteMock.mockResolvedValue({ data: { id: 'e999', deleted: true } });

    const res = await eventsHandler({ user: { email: TEST_EMAIL } } as unknown as Request, ACTION.DELETE, { id: 'e999' } as any);

    expect(deleteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: 'e999',
      })
    );
    expect(res).toEqual({ data: { id: 'e999', deleted: true } });
  });

  test('unsupported action throws 400', async () => {
    await expect(eventsHandler({ user: { email: TEST_EMAIL } } as unknown as Request, 'NOPE' as unknown as ACTION)).rejects.toThrow(
      'Unsupported calendar action'
    );
  });

  test('email can be supplied via extra when req is undefined', async () => {
    listMock.mockResolvedValue({ data: { items: [] } });

    await eventsHandler(undefined as any, ACTION.GET, undefined, { email: TEST_EMAIL });

    expect(fetchCredentialsByEmailMock).toHaveBeenCalledWith(TEST_EMAIL);
    expect(listMock).toHaveBeenCalledTimes(1);
  });

  test('maps events with missing fields safely', async () => {
    getEventDurationStringMock.mockReturnValueOnce(null);

    listMock.mockResolvedValue({
      data: {
        items: [
          {
            // no id, no summary, no description/location; only start provided
            start: { dateTime: '2024-05-01T10:00:00Z' },
            end: { dateTime: '2024-05-01T10:00:30Z' },
          },
        ],
      },
    });

    const res = (await eventsHandler({ user: { email: TEST_EMAIL } } as unknown as Request, ACTION.GET)) as any;

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

  test('propagates calendar API errors (e.g., list failure)', async () => {
    listMock.mockRejectedValueOnce(new Error('calendar down'));

    await expect(eventsHandler({ user: { email: TEST_EMAIL } } as unknown as Request, ACTION.GET)).rejects.toThrow('calendar down');
  });

  test('status code constants available for reference', () => {
    // Sanity check that STATUS_RESPONSE is wired; do not assert specific numbers in case they change.
    expect(STATUS_RESPONSE).toBeDefined();
    expect(typeof STATUS_RESPONSE.BAD_REQUEST).toBe('number');
  });
});
