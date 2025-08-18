import type { calendar_v3 } from 'googleapis';
import { TIMEZONE } from '@/types';

type Event = calendar_v3.Schema$Event;

export const formatEventData = (params: Partial<Event>): Event => {
  const startParams = params.start || {};
  const endParams = params.end || {};

  const hasDateTime = Boolean(startParams.dateTime || endParams.dateTime);
  const hasDate = Boolean(startParams.date || endParams.date);

  validateEventDateType(hasDateTime, hasDate);

  let timeZone: string | undefined;
  if (hasDateTime) {
    timeZone = validateAndTimezone(startParams, endParams);
  }

  validateEventOrdering(hasDateTime, startParams, endParams, hasDate);

  const startOut: Event['start'] = hasDateTime ? { dateTime: startParams.dateTime, timeZone } : { date: startParams.date };
  const endOut: Event['end'] = hasDateTime ? { dateTime: endParams.dateTime, timeZone } : { date: endParams.date };

  // Validate required fields
  // Build final event payload
  const event: Event = {
    id: params.id || crypto.randomUUID(), // required for update/delete
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
    start: startOut,
    end: endOut,
  };

  // Remove undefined properties (clean payload)
  for (const key of Object.keys(event)) {
    if ((event as Record<string, string>)[key] === undefined) {
      delete (event as Record<string, string>)[key];
    }
  }

  return event;
};

const validateEventDateType = (hasDateTime: boolean, hasDate: boolean) => {
  if (!(hasDateTime || hasDate)) {
    throw new Error('Missing start and end dates!');
  }
  if (hasDateTime && hasDate) {
    throw new Error('Use either dateTime or date (all-day), not both.');
  }
};

const validateAndTimezone = (startParams: Partial<calendar_v3.Schema$EventDateTime>, endParams: Partial<calendar_v3.Schema$EventDateTime>) => {
  const startTZ = startParams.timeZone;
  const endTZ = endParams.timeZone;

  if (startTZ && endTZ && startTZ !== endTZ) {
    throw new Error('Start and end time zones must match.');
  }
  return startTZ || endTZ || TIMEZONE.DEFAULT;
};

const validateEventOrdering = (
  hasDateTime: boolean,
  startParams: Partial<calendar_v3.Schema$EventDateTime>,
  endParams: Partial<calendar_v3.Schema$EventDateTime>,
  hasDate: boolean
) => {
  if (hasDateTime && startParams.dateTime && endParams.dateTime) {
    if (new Date(endParams.dateTime) <= new Date(startParams.dateTime)) {
      throw new Error('End time must be after start time.');
    }
  } else if (hasDate && startParams.date && endParams.date && new Date(endParams.date) <= new Date(startParams.date)) {
    throw new Error('End date must be after start date.');
  }
};
