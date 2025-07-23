export const updateEventToolDescription: string = `Update an existing calendar event. Requires the event ID and updated fields in JSON format. Example request:
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
}`;
