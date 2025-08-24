import type { calendar_v3 } from 'googleapis';
import { TIMEZONE } from '@/types';

type Event = calendar_v3.Schema$Event;

export const formatEventData = (params: Partial<Event>): Event => {
  if (!params.summary) {
    throw new Error('Event summary is required.');
  }
  if (!(params.start?.dateTime || params.start?.date)) {
    throw new Error('Event start is required.');
  }
  if (!(params.end?.dateTime || params.end?.date)) {
    throw new Error('Event end is required.');
  }

  if (
    !(params.start?.timeZone && params.start.timeZone in TIMEZONE) ||
    (params.end?.timeZone && params.end.timeZone in TIMEZONE && params.start.timeZone !== params.end.timeZone)
  ) {
    throw new Error(`Must be from one of the timezone list and to be the same timezone: ${TIMEZONE}`);
  }

  const event: Event = {
    id: crypto.randomUUID(),
    summary: params.summary,
    description: params.description,
    location: params.location,
    attendees: params.attendees,
    reminders: params.reminders,
    recurrence: params.recurrence,
    colorId: params.colorId,
    conferenceData: params.conferenceData,
    transparency: params.transparency,
    visibility: params.visibility,
    start: params.start,
    end: params.end,
  };

  return event;
};
