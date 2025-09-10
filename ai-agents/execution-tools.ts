import type { calendar_v3 } from "googleapis";
import isEmail from "validator/lib/isEmail";
import { CONFIG, OAUTH2CLIENT, SCOPES, SUPABASE } from "@/config/root-config";
import { ACTION } from "@/types";
import { asyncHandler } from "@/utils/async-handlers";
import { fetchCredentialsByEmail } from "@/utils/get-user-calendar-tokens";
import { eventsHandler } from "@/utils/handle-events";
import { initCalendarWithUserTokensAndUpdateTokens } from "@/utils/init-calendar-with-user-tokens-and-update-tokens";
import { TOKEN_FIELDS } from "@/utils/storage";
import { coerceArgs, formatEventData, getCalendarCategoriesByEmail } from "./agent-utils";

type Event = calendar_v3.Schema$Event;

const MAX_PW = 72;
const MIN_PW = 6;

export const EXECUTION_TOOLS = {
  generateUserCbGoogleUrl: () => {
    const url = OAUTH2CLIENT.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
      include_granted_scopes: true,
      redirect_uri: CONFIG.redirect_url_dev,
    });

    return url;
  },
  registerUser: asyncHandler(async (params: { email: string; password: string }) => {
    if (!(params.email && params.password)) {
      throw new Error("Email and password are required in order to register.");
    }
    if (!isEmail(params.email)) {
      throw new Error("Invalid email address.");
    }

    if (params.password.length < MIN_PW || params.password.length > MAX_PW) {
      throw new Error("Password must be between 6 and maximum of 72 characters long.");
    }

    const { data, error } = await SUPABASE.auth.signUp({
      email: params.email,
      password: params.password,
    });

    if (data) {
      return data;
    }
    throw error;
  }),
  validateUser: asyncHandler(async ({ email }: { email: string }) => {
    const { data, error } = await SUPABASE.from("user_calendar_tokens").select(TOKEN_FIELDS).eq("email", email.trim().toLowerCase());
    if (error || !data || data.length === 0) {
      throw new Error("User not found or no tokens available.");
    }
    return data[0];
  }),

  validateEventFields: asyncHandler((params: calendar_v3.Schema$Event & { email: string }) => {
    const { email, eventLike } = coerceArgs(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    const formatted = formatEventData(eventLike as Event);
    return { ...formatted, email };
  }),

  insertEvent: asyncHandler((params: calendar_v3.Schema$Event & { email: string; customEvents?: boolean }) => {
    const { email, calendarId, eventLike } = coerceArgs(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    const eventData: Event = formatEventData(eventLike as Event);
    return eventsHandler(null, ACTION.INSERT, eventData, { email, calendarId: calendarId ?? "primary", customEvents: params.customEvents ?? false });
  }),

  updateEvent: asyncHandler((params: calendar_v3.Schema$Event & { email: string; eventId: string }) => {
    const { email, calendarId, eventId, eventLike } = coerceArgs(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    if (!eventId) {
      throw new Error("eventId is required for update.");
    }
    const eventData: Event = { ...formatEventData(eventLike as Event), id: eventId };
    const insureEventDataWithEventId = { ...eventData, id: eventId };
    return eventsHandler(null, ACTION.UPDATE, insureEventDataWithEventId, { email, calendarId: calendarId ?? "primary", eventId });
  }),

  getEvent: asyncHandler((params: calendar_v3.Schema$Event & { email: string; q?: string | null; timeMin?: string | null }) => {
    const startOfYear = new Date().toISOString().split("T")[0];

    const { email, calendarId } = coerceArgs(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    return eventsHandler(null, ACTION.GET, {}, { email, calendarId: calendarId ?? "primary", timeMin: params.timeMin ?? startOfYear, q: params.q || "" });
  }),

  getCalendarTypesByEventDetails: asyncHandler(async (params: { eventInformation: calendar_v3.Schema$Event; email: string }) => {
    if (!(params.email && isEmail(params.email))) {
      throw new Error("Invalid email address.");
    }
    const calendarsTypes = (await getCalendarCategoriesByEmail(params.email)).map((c) => {
      return {
        calendarId: c.calendar_id,
        calendarName: c.calendar_name,
      };
    });
    return calendarsTypes;
  }),

  deleteEvent: asyncHandler((params: { eventId: string; email: string }) => {
    const { email, eventId } = coerceArgs(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    if (!eventId) {
      throw new Error("Event ID is required to delete event.");
    }
    return eventsHandler(null, ACTION.DELETE, { id: eventId }, { email });
  }),
  getUserDefaultTimeZone: asyncHandler(async (params: { email: string }) => {
    const { email } = coerceArgs(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    const tokenProps = await fetchCredentialsByEmail(email);
    const CALENDAR = await initCalendarWithUserTokensAndUpdateTokens(tokenProps);
    const r = await CALENDAR.settings.get({ setting: "timezone" });
    return r;
  }),
};
