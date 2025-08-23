export const TOOLS_DESCRIPTION = {
  validateUser: `Validates whether a user is registered in the system by querying the database. Requires "email" (execution context parameter). Returns an array of matching user records or an empty array if not found.
    Example input:
    {
      "email": "user@example.com"
    }`,

  insertEvent: `Creates a new event in the user’s calendar. Requires "email" (execution context parameter) and a JSON payload with event summary, description, start/end time in RFC3339 format, time zone, and optional location. Returns the created event object.
  Example JSON payload:
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

  updateEvent: `Updates an existing calendar event for a given user. Requires "email" (execution context parameter), "eventId", and an "updates" object containing the fields to modify. Supports changes to summary, description, start/end time, and location. Returns the updated event object.
  Example JSON payload:
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

  deleteEvent: `Deletes a calendar event permanently for a given user. Requires "email" (execution context parameter) and "eventId". Once deleted, the event cannot be recovered.
  Example JSON payload:
  {
    "eventId": "abc123def456"
  }`,

  getEvent: `Fetches all calendar events associated with the provided user. Requires "email" (execution context parameter). Returns an array of events from the user’s calendar.
  Example input:
  {
    // no additional JSON fields required
  }`,

  getCalendarTypes: `Retrieves all calendars linked to the provided user via the Google Calendar API. Requires "email" (execution context parameter). Returns an array of calendar names.
  Example response:
  ["Family and Friends", "Studies", "Meetings"]`,
} as const;
