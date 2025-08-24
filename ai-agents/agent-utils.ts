import type { calendar_v3 } from 'googleapis';
import { TIMEZONE } from '@/types';

type Event = calendar_v3.Schema$Event;
type EDT = calendar_v3.Schema$EventDateTime;

const ALLOWED_TZ = new Set<string>(Object.values(TIMEZONE) as string[]);

export const formatEventData = (params: Partial<Event>): Event => {
  const start: Partial<EDT> = params.start ?? {};
  const end: Partial<EDT> = params.end ?? {};

  if (!params.summary) {
    throw new Error('Event summary is required.');
  }
  if (!(start.dateTime || start.date)) {
    throw new Error('Event start is required.');
  }
  if (!(end.dateTime || end.date)) {
    throw new Error('Event end is required.');
  }

  const tzStart = start.timeZone;
  const tzEnd = end.timeZone ?? tzStart; // default end tz to start tz if missing

  if (!(tzStart || tzEnd)) {
    throw new Error('Event timeZone is required.');
  }
  if (tzStart && !ALLOWED_TZ.has(tzStart)) {
    throw new Error(`Invalid timeZone: ${tzStart}. Allowed: ${Array.from(ALLOWED_TZ).join(', ')}`);
  }
  if (tzEnd && !ALLOWED_TZ.has(tzEnd)) {
    throw new Error(`Invalid timeZone: ${tzEnd}. Allowed: ${Array.from(ALLOWED_TZ).join(', ')}`);
  }
  if (tzStart && tzEnd && tzStart !== tzEnd) {
    throw new Error('Start and end time zones must match.');
  }

  const event: Event = {
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
    start: { ...start, timeZone: tzStart ?? tzEnd },
    end: { ...end, timeZone: tzEnd ?? tzStart },
  };

  // prune undefined/empty strings
  for (const k of Object.keys(event) as (keyof Event)[]) {
    const v = event[k] as unknown;
    if (v === undefined || v === null || v === '') {
      delete event[k];
    }
  }
  return event;
};
