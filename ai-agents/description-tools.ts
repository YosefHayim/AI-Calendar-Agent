export const TOOLS_DESCRIPTION = {
  validateUser: `Validate if the user is signed up.`,

  deleteEvent: `Delete a calendar event by its ID. Once deleted, the event is permanently removed. Example request:
{
  "eventId": "abc123def456"
}`,

  eventType: `Returns all the calendars list associated with the users account via API request to google api calendar.`,

  getEvent: `Retrieve details of a calendar event using the event ID. Example request:
{
  "eventId": "abc123def456"
}`,

  insertEvent: `Insert an event into the calendar. Must follow the parameters provided the structure is json format example to a request {
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

  updateEvent: `Update an existing calendar event. Requires the event ID and updated fields in JSON format. Example request:
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
} as const;
