export const TOOLS_DESCRIPTION = {
  registerUserViaDb:
    'Registers a new user in the auth system. Requires "email" and "password". Validates email and password length. On success returns the auth provider’s JSON response; otherwise throws an error.',

  validateUser: `Checks if a user has stored Google Calendar tokens. Requires "email". Returns the single token record if found; throws "User not found or no tokens available." otherwise.
Example input:
{ "email": "user@example.com" }
Example success (shape varies by storage):
{ "email": "user@example.com", "access_token": "...", "refresh_token": "...", "expiry_date": 1720000000000 }`,

  validateEventFields: `Normalizes free-text into a minimal Google Calendar event object. Requires "email". Returns ONLY the normalized event fields (no calendarId). Time zone precedence: explicit IANA in text > user default (getUserDefaultTimeZone) > "Asia/Jerusalem" > "UTC".
Accepted inputs may include: Summary, Date, Start, End, Duration, Timezone, Location, Description.

Rules:
- Range like "9 PM–10 PM" → start/end.
- Single time → 60m duration.
- Date + duration (no time) → start 09:00 local; end = start + duration (timed).
- Date only → all-day (start.date=YYYY-MM-DD; end.date=YYYY-MM-DD+1).
- Ensure end > start; if not, roll end by +1 day.
- Use RFC3339 for dateTime and include timeZone on start/end when dateTime is used.
- Omit absent optional fields.

Example input:
{ "email": "user@example.com", "text": "Lunch with Sarah tomorrow at 13:00 in Tel Aviv" }

Example output (timed):
{
  "summary": "Lunch with Sarah",
  "start": { "dateTime": "2025-06-30T13:00:00+03:00", "timeZone": "Asia/Jerusalem" },
  "end":   { "dateTime": "2025-06-30T14:00:00+03:00", "timeZone": "Asia/Jerusalem" },
  "location": "Tel Aviv"
}`,

  insertEvent: `Creates a new calendar event for the specified user. Requires "email" and event details (summary, start/end in RFC3339 or all-day dates; optional description/location). If required fields are missing, applies one-time sensible defaults (summary="Untitled Event", duration=60m, timezone from getUserDefaultTimeZone→"Asia/Jerusalem"→"UTC"). Returns the created event object from the provider.
Example:
{
  "email": "user@example.com",
  "calendarId": "primary",
  "summary": "Quick Standup Meeting",
  "location": "Online - Google Meet",
  "description": "Daily standup.",
  "start": { "dateTime": "2025-06-29T15:00:00+03:00", "timeZone": "Asia/Jerusalem" },
  "end":   { "dateTime": "2025-06-29T15:30:00+03:00", "timeZone": "Asia/Jerusalem" }
}`,

  updateEvent: `Modifies an existing calendar event. Requires "email", "eventId", and an "updates" object with fields to change (summary, description, start/end, location, etc.). Preserves unspecified fields. If "duration" is supplied without "end", recomputes end = start + duration. Returns the updated event object.
Example:
{
  "email": "user@example.com",
  "calendarId": "primary",
  "eventId": "abc123def456",
  "updates": {
    "summary": "Updated Meeting Title",
    "start": { "dateTime": "2025-06-29T16:00:00+03:00", "timeZone": "Asia/Jerusalem" },
    "end":   { "dateTime": "2025-06-29T16:30:00+03:00", "timeZone": "Asia/Jerusalem" }
  }
}`,

  deleteEvent: `Deletes a calendar event permanently. Requires "email" and "eventId". Returns confirmation JSON from the provider.
Example:
{ "email": "user@example.com", "eventId": "abc123def456" }`,

  getEvent: `Retrieves events from the user's calendar. Requires "email". Optional: "q" (keyword query), "timeMin" (RFC3339). If not provided, the implementation defaults timeMin to today's date (YYYY-MM-DD). Returns an array of event objects.
Example:
{ "email": "user@example.com", "q": "standup", "timeMin": "2025-01-01" }`,

  getCalendarTypesByEventDetails: `Lists all calendars linked to the user. Requires "email". Returns an array of { calendarName, calendarId }.
Example return:
[
  { "calendarName": "משפחה וחברים", "calendarId": "49508390...@group.calendar.google.com" },
  { "calendarName": "Side Projects", "calendarId": "sideproj...@group.calendar.google.com" }
]`,

  getUserDefaultTimeZone: `Retrieves the user's default timezone from Google Calendar settings. Requires "email". Returns the provider settings response including the timezone value (e.g., { "kind": "calendar#setting", "etag": "...", "id": "timezone", "value": "Asia/Jerusalem" }).`,
} as const;
