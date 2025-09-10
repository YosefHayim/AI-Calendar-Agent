export const TOOLS_DESCRIPTION = {
  registerUserViaDb: "Register a user to our database.",
  validateUser: `Checks if a user is registered in the system. Requires "email" (execution context parameter). Returns an array of matching user records, or an empty array if none are found.
Example:
{
  "email": "user@example.com"
}`,
  validateEventFields: `Converts free-text into a minimal Google Calendar event object. Requires "email" (execution context parameter) for token lookup. Always returns ONLY:
- "summary" (string)
- "start"  ({ date, dateTime, timeZone })
- "end"    ({ date, dateTime, timeZone })
- "calendarId" (string of digits, e.g., "1", "2"; must match ^\\d+$)

Example input:
{
  "email": "user@example.com",
  "text": "Lunch with Sarah tomorrow at 1pm in Tel Aviv"
}

Example output:
{
  "summary": "Lunch with Sarah",
  "start": {
    "date": "2025-06-30",
    "dateTime": "2025-06-30T13:00:00+03:00",
    "timeZone": "Asia/Jerusalem"
  },
  "end": {
    "date": "2025-06-30",
    "dateTime": "2025-06-30T14:00:00+03:00",
    "timeZone": "Asia/Jerusalem"
  },
  "calendarId": "1"
}`,
  insertEvent: `Creates a new calendar event for the specified user. Requires "email" (execution context parameter) and event details (summary, description, start/end time in RFC3339, time zone, and optional location). Returns the created event object.
Example:
{
  "summary": "Quick Standup Meeting",
  "location": "Online - Google Meet",
  "description": "Daily standup to sync team updates.",
  "start": {
    "dateTime": "2025-06-29T15:00:00+03:00",
    "timeZone": "Asia/Jerusalem"
  },
  "end": {
    "dateTime": "2025-06-29T15:30:00+03:00",
    "timeZone": "Asia/Jerusalem"
  }
}`,

  updateEvent: `Modifies an existing calendar event. Requires "email" (execution context parameter), "eventId", and an "updates" object specifying fields to change (summary, description, start/end time, location). Returns the updated event object.
Example:
{
  "eventId": "abc123def456",
  "updates": {
    "summary": "Updated Meeting Title",
    "description": "Updated meeting agenda.",
    "start": {
      "dateTime": "2025-06-29T16:00:00+03:00",
      "timeZone": "Asia/Jerusalem"
    },
    "end": {
      "dateTime": "2025-06-29T16:30:00+03:00",
      "timeZone": "Asia/Jerusalem"
    }
  }
}`,

  deleteEvent: `Deletes a calendar event permanently. Requires "email" (execution context parameter) and "eventId". Deleted events cannot be recovered. Returns confirmation of deletion.
Example:
{
  "eventId": "abc123def456"
}`,

  getEvent: `Retrieves all events from the user’s calendar. Requires "email" and optional timeMin field with RFC3339 date format (execution context parameter). Returns an array of event objects.
Example:
{
  // no additional fields required
}`,

  getCalendarTypesByEventParameters: `Lists all calendars linked to the user via Google Calendar API. Requires "email" (execution context parameter). Returns an array of calendar names and calendar Ids.
Example how data is returned:
[{
"calendarName": "משפחה וחברים",
"calendarId": "49508390rfjdkslfhsdku4302rdfjdksljfksdl@group.calendar.google.com",
}]`,
  getUserDefaultTimeZone: `Retrieves the user's default timezone. Requires "email" (execution context parameter).`,
} as const;
