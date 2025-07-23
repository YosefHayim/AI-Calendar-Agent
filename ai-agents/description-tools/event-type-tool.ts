export const eventTypeToolDescription: string = `Determine the appropriate event type or calendar for scheduling. Used for assigning metadata such as color coding, category, or calendar assignment.

If no specific type or calendar is provided in the input, return the full list of available calendars as received in the array. Do not ask follow-up questions or request clarification.

Example input:
{
  "type": "Meeting",
  "description": "Used for internal team meetings."
}

If input is empty or missing the "type" field, return all available calendars.`;
