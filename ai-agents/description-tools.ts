export const TOOLS_DESCRIPTION = {
  validateUser:
    'Validates whether a user is registered in the system by querying the database. Requires a unique identifier which is the email address. Returns an array of matching user records or an empty array if not found. Does not create, update, or delete any records.',

  insertEvent: `Requires email address and creates a new event in the calendar. Requires JSON payload with event summary, description, start/end time in RFC3339 format, time zone, and optional location. Returns the created event object.
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
    },
    "email": "user@example.com"
  }`,

  updateEvent: `Updates an existing calendar event for a given user. Requires "eventId", "email", and an "updates" object containing the fields to modify. Supports changes to summary, description, start/end time, and location. Returns the updated event object.
  Example:
  {
    "eventId": "abc123def456",
    "email": "user@example.com",
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

  deleteEvent: `Deletes a calendar event permanently for a given user. Requires "eventId" and "email" in the request body. Once deleted, the event cannot be recovered.
  Example:
  {
    "eventId": "abc123def456",
    "email": "user@example.com"
  }`,

  getEvent: `Fetches all calendar events associated with the provided user email. Requires "email" in the request. Returns an array of events from the user’s calendar.
  Example:
  {
    "email": "user@example.com"
  }`,

  getCalendarTypes:
    'Requires the user email address and retrieves an array of all the calendars the user has on Google Calendar API. Example response: ["Family and Friends", "Studies", "Meetings"]',
} as const;
