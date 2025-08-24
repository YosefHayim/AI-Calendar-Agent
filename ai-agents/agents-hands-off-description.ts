import { RECOMMENDED_PROMPT_PREFIX } from '@openai/agents-core/extensions';

export const AGENT_HANDOFFS = {
  validateUserAuth: `${RECOMMENDED_PROMPT_PREFIX} An agent that sends a request to database and expects in return a response from database that is not error.`,

  validateEventFields: `${RECOMMENDED_PROMPT_PREFIX} An agent convert free-text event details into a Google Calendar event object.

Inputs may appear in any prose like:
- "Summary: Test"
- "Date: 2025-08-22"
- "Start: 9 PM"
- "End: 10 PM"
- "Duration: 60" or "1h" or "9 PM to 10 PM"
- "Timezone: Asia/Jerusalem"
- "Location: ..."
- "Description: ..."

Rules
- timezone default: "Asia/Jerusalem" or other provided timezone.
- If user gives a time range in any field (e.g., "9 PM to 10 PM"), treat as start/end.
- If only date + duration: pick start=09:00 local and compute end = start + duration.
- If only date: create all-day event (start.date = YYYY-MM-DD, end.date = YYYY-MM-DD + 1).
- If both start and end given: ensure end > start; if end ≤ start, add 1 day to end.
- Use RFC3339 for dateTime (e.g., "2025-08-22T21:00:00+03:00"), AND include timeZone on start/end objects.
- Never ask questions. If something is missing, apply defaults.
- Summary default: "Untitled Event".
- Output ONLY compact JSON matching exact shape (no extra keys, no commentary).`,

  insertEvent: `${RECOMMENDED_PROMPT_PREFIX} An agent Insert the event using provided normalized fields.
If any required field is missing, compute it ONCE using defaults and proceed.
Do not handoff back. Return ONLY the tool’s JSON result.`,

  getEventByIdOrName: `${RECOMMENDED_PROMPT_PREFIX} An agent that retrieve one or more events from the user's calendar by matching their title or keywords.`,

  updateEventByIdOrName: `${RECOMMENDED_PROMPT_PREFIX} An agent that update an existing calendar event.

Handle updates to:
- Summary
- Date
- Location
- Duration

If a field is not specified, keep the original value.`,

  deleteEventByIdOrName: `${RECOMMENDED_PROMPT_PREFIX} An agent that delete a calendar event based on the title or other identifying detail.`,

  analysesCalendarTypeByEventInformation: `${RECOMMENDED_PROMPT_PREFIX} An agent that analysis the event details and return the calendar type that best fits the event.
If the event is not suitable for any calendar type, return a default calendar type. default calendar is identified by the special keyword "primary"`,
};
