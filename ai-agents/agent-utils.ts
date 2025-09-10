import type { calendar_v3 } from "googleapis";
import { SUPABASE } from "@/config/root-config";
import { TIMEZONE } from "@/types";
import { asyncHandler } from "@/utils/async-handlers";

type Event = calendar_v3.Schema$Event;
type EDT = calendar_v3.Schema$EventDateTime;

const ALLOWED_TZ = new Set<string>(Object.values(TIMEZONE) as string[]);

function deepClean<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== "object") {
    return obj;
  }
  const out: any = Array.isArray(obj) ? [] : {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === "" || v === undefined || v === null) {
      continue;
    }
    if (typeof v === "object") {
      const cleaned = deepClean(v as Record<string, unknown>);
      if (Array.isArray(cleaned) ? cleaned.length : Object.keys(cleaned).length) {
        out[k] = cleaned;
      }
    } else {
      out[k] = v;
    }
  }
  return out;
}

function normalizeEDT(input: Partial<EDT>): EDT {
  const e: Partial<EDT> = { ...input };

  // Remove empty fields early
  for (const k of Object.keys(e) as (keyof EDT)[]) {
    if (e[k] === "" || e[k] === undefined || e[k] === null) {
      delete e[k];
    }
  }

  // Enforce mutual exclusivity
  if (e.dateTime) {
    e.date = undefined;
  } else if (e.date) {
    // All-day: no dateTime, and Google recommends omitting timeZone
    e.dateTime = undefined;
    e.timeZone = undefined;
  }

  return e as EDT;
}

export const formatEventData = (params: Partial<Event>): Event => {
  // Clean early so required-field checks see real values
  const cleaned = deepClean(params || {});

  const start = normalizeEDT((cleaned.start ?? {}) as Partial<EDT>);
  const end = normalizeEDT((cleaned.end ?? {}) as Partial<EDT>);

  if (!cleaned.summary) {
    throw new Error("Event summary is required.");
  }
  if (!(start.dateTime || start.date)) {
    throw new Error("Event start is required.");
  }
  if (!(end.dateTime || end.date)) {
    throw new Error("Event end is required.");
  }

  // Time zone rules: only for timed events
  const tzStart = start.dateTime ? start.timeZone : undefined;
  const tzEnd = end.dateTime ? (end.timeZone ?? tzStart) : undefined;

  if ((start.dateTime || end.dateTime) && !(tzStart || tzEnd)) {
    throw new Error("Event timeZone is required for timed events.");
  }

  if (tzStart && !ALLOWED_TZ.has(tzStart)) {
    throw new Error(`Invalid timeZone: ${tzStart}. Allowed: ${Array.from(ALLOWED_TZ).join(", ")}`);
  }
  if (tzEnd && !ALLOWED_TZ.has(tzEnd)) {
    throw new Error(`Invalid timeZone: ${tzEnd}. Allowed: ${Array.from(ALLOWED_TZ).join(", ")}`);
  }
  if (tzStart && tzEnd && tzStart !== tzEnd) {
    throw new Error("Start and end time zones must match.");
  }

  if (start.dateTime) {
    start.timeZone = tzStart ?? tzEnd;
  }
  if (end.dateTime) {
    end.timeZone = tzStart ?? tzEnd;
  }

  const event: Event = {
    summary: cleaned.summary,
    description: cleaned.description,
    location: cleaned.location,
    attendees: cleaned.attendees,
    reminders: cleaned.reminders,
    recurrence: cleaned.recurrence,
    colorId: cleaned.colorId,
    conferenceData: cleaned.conferenceData,
    transparency: cleaned.transparency,
    visibility: cleaned.visibility,
    start,
    end,
  };

  return deepClean(event);
};

export const getCalendarCategoriesByEmail = asyncHandler(async (email: string) => {
  const { data, error } = await SUPABASE.from("calendar_categories").select("*").eq("email", email);
  if (error) {
    throw error;
  }
  return data;
});

function cleanObject<T extends Record<string, unknown>>(obj: T): T {
  const newObj: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      const value = obj[key];
      if (value !== null && value !== "") {
        newObj[key] = value;
      }
    }
  }
  return newObj as T;
}
export function coerceArgs(raw: unknown) {
  // 1) accept stringified input
  const base = typeof (raw as { input?: string })?.input === "string" ? safeParse((raw as { input: string }).input) : raw;

  // 2) unwrap common nestings
  const outer = base?.fullEventParameters ?? base;
  const inner = outer?.eventParameters ?? base?.eventParameters ?? base;

  // 3) collect fields
  const email = base?.email ?? outer?.email ?? inner?.email;
  const calendarId = outer?.calendarId ?? base?.calendarId;
  const eventId = base?.eventId ?? outer?.eventId;

  // 4) extract event fields (summary/start/end/…)
  const eventLike: Partial<Event> = {
    id: inner?.id,
    summary: inner?.summary,
    description: inner?.description,
    location: inner?.location,
    attendees: inner?.attendees,
    reminders: inner?.reminders,
    recurrence: inner?.recurrence,
    colorId: inner?.colorId,
    conferenceData: inner?.conferenceData,
    transparency: inner?.transparency,
    visibility: inner?.visibility,
    start: inner?.start,
    end: inner?.end,
  };

  return { email, calendarId, eventId, eventLike: cleanObject(eventLike) };
}

export function safeParse(s: string) {
  return JSON.parse(s);
}
