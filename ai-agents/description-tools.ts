export const TOOLS_DESCRIPTION = {
  validateUser:
    'Validates whether a user is registered in the system by querying the database. Requires a unique identifier which is the email address. Returns a boolean and optional user metadata if found. Does not create, update, or delete any records.',

  deleteEvent: `Deletes a calendar event permanently using its ID. Requires "eventId" in the request body. Once deleted, the event cannot be recovered.
  Example:
  {
    "eventId": "abc123def456"
  }`,

  eventType: `Retrieves the list of all calendars associated with the authenticated user's account via the Google Calendar API. No input parameters required unless filtering is implemented.`,

  getEvent: `Fetches details of a specific calendar event using its ID. Requires "eventId" in the request.
  Example:
  {
    "eventId": "abc123def456"
  }`,

  insertEvent: `Creates a new event in the calendar. Requires JSON payload with event summary, description, start/end time in RFC3339 format, time zone, and optional location. Returns the created event object.
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

  updateEvent: `Updates details of an existing calendar event. Requires "eventId" and an "updates" object containing the fields to modify. Supports changes to summary, description, start/end time, and location. Returns the updated event object.
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
  getCalendarTypes: 'Get array of all the calendars the user has on google calendar api.',
} as const;
