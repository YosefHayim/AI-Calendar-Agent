import { Agent, setDefaultOpenAIKey, setTracingExportApiKey } from '@openai/agents';
import { RECOMMENDED_PROMPT_PREFIX } from '@openai/agents-core/extensions';
import { CONFIG } from '@/config/root-config';
import { CURRENT_MODEL } from '@/types';
import { AGENT_TOOLS } from './agents-tools';

setDefaultOpenAIKey(CONFIG.open_ai_api_key || '');
setTracingExportApiKey(CONFIG.open_ai_api_key || '');

export const AGENTS = {
  validateUserAuth: new Agent({
    name: 'validate_user_db_agent',
    instructions:
      'agent validates whether a user is registered in the system by querying the database. It requires a unique identifier, which is the email address. It returns a boolean and optional user metadata if found. It does not create, update, or delete any records.'.trim(),
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: 'required' },
    handoffDescription: `${RECOMMENDED_PROMPT_PREFIX} An agent that sends a request to database and expects in return a response from database that is not error.`,
    tools: [AGENT_TOOLS.validate_user_db],
  }),
  validateEventFields: new Agent({
    name: 'validate_event_fields_agent',
    instructions:
      'agent converts free-text event details into a Google Calendar event object. It handles various input formats for summary, date, time, duration, timezone, location, and description. It applies default values if information is missing and ensures the output is a compact JSON matching the specified Google Calendar event object shape. It never asks questions and always proceeds with defaults if parsing fails.'.trim(),
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: 'required' },
    handoffDescription: `${RECOMMENDED_PROMPT_PREFIX} An agent convert free-text event details into a Google Calendar event object.

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
- Use RFC3339 for dateTime (e.g., "2025-08-22T21:00:00+03:00" is OK), AND include timeZone on start/end objects.
- Never ask questions. If something is missing, apply defaults.
- Summary default: "Untitled Event".
- Output ONLY compact JSON matching exact shape (no extra keys, no commentary):
{
  "summary": "string",
  "description": "string | omit if none",
  "location": "string | omit if none",
  "start": { "dateTime": "RFC3339" , "timeZone": "IANA" } | { "date": "YYYY-MM-DD" },
  "end":   { "dateTime": "RFC3339" , "timeZone": "IANA" } | { "date": "YYYY-MM-DD" },
  "attendees": [ { "email": "user@example.com" } ] | omit,
  "recurrence": ["RRULE:..."] | omit,
  "reminders": { "useDefault": true } | omit
}

Parsing guidance
- Accept times like "21:00", "9 PM", "9pm".
- Accept dates like "2025-08-22", "Aug 22, 2025", "today", "tomorrow".
- Duration accepts "90", "90m", "1h30m", "1h".
- If both start_text and duration are present but no end, compute end.

Examples

Input:
Summary: Test
Date: 2025-08-22
Duration: 9 PM to 10 PM
Timezone: Asia/Jerusalem

Output:
{"summary":"Test","start":{"dateTime":"2025-08-22T21:00:00+03:00","timeZone":"Asia/Jerusalem"},"end":{"dateTime":"2025-08-22T22:00:00+03:00","timeZone":"Asia/Jerusalem"}}

Input:
Date: 2025-08-22
Duration: 60

Output:
{"summary":"Untitled Event","start":{"dateTime":"2025-08-22T09:00:00+03:00","timeZone":"Asia/Jerusalem"},"end":{"dateTime":"2025-08-22T10:00:00+03:00","timeZone":"Asia/Jerusalem"}}

Input:
Summary: Offsite
Date: 2025-08-22

Output:
{"summary":"Offsite","start":{"date":"2025-08-22"},"end":{"date":"2025-08-23"}}
`,
    tools: [AGENT_TOOLS.validate_event_fields],
  }),
  insertEvent: new Agent({
    name: 'insert_event_agent',
    instructions:
      'agent inserts a new event into the calendar using provided normalized fields. If any required field is missing, it computes it once using defaults and proceeds. It does not handoff back and returns only the tool’s JSON result.'.trim(),
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: 'required' },
    handoffDescription: `${RECOMMENDED_PROMPT_PREFIX} An agent Insert the event using provided normalized fields.
  If any required field is missing, compute it ONCE using defaults and proceed.
  Do not handoff back. Return ONLY the tool’s JSON result.`,
    tools: [AGENT_TOOLS.insert_event],
  }),
  getEventByIdOrName: new Agent({
    instructions: `agent retrieves one or more events from the user's calendar by matching their title or keywords.`.trim(),
    name: 'get_event_by_name_agent',
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: 'required' },
    handoffDescription: `${RECOMMENDED_PROMPT_PREFIX} An agent that retrieve one or more events from the user's calendar by matching their title or keywords.`,
    tools: [AGENT_TOOLS.get_event],
  }),
  updateEventByIdOrName: new Agent({
    instructions:
      'agent updates an existing calendar event. It handles updates to summary, date, location, and duration. If a field is not specified, it keeps the original value.'.trim(),
    name: 'update_event_by_id_agent',
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: 'required' },
    handoffDescription: `${RECOMMENDED_PROMPT_PREFIX} An agent that update an existing calendar event.

    Handle updates to:
    - Summary
    - Date
    - Location
    - Duration

  If a field is not specified, keep the original value.`,
    tools: [AGENT_TOOLS.update_event],
  }),
  deleteEventByIdOrName: new Agent({
    instructions: 'agent deletes a calendar event based on the title or other identifying detail.'.trim(),
    name: 'delete_event_by_id_agent',
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: 'required' },
    handoffDescription: `${RECOMMENDED_PROMPT_PREFIX} An agent that delete a calendar event based on the title or other identifying detail.`,
    tools: [AGENT_TOOLS.delete_event],
  }),
  analysesCalendarTypeByEventInformation: new Agent({
    name: 'analyses_calendar_type_by_event_agent',
    instructions:
      `agent analyzes event details and choose the calendar type that best fits the event from the calendars he retrieves. If the event is not suitable for any calendar type, it returns a default calendar type which is "primary".`.trim(),
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: 'required' },
    handoffDescription: `${RECOMMENDED_PROMPT_PREFIX} An agent that analysis the event details and return the calendar type that best fits the event.
    If the event is not suitable for any calendar type, return a default calendar type. default calendar is identified by the special keyword "primary"`.trim(),
    tools: [AGENT_TOOLS.calendar_type],
  }),
  normalizeEventAgent: new Agent({
    name: 'normalize_event_agent',
    model: CURRENT_MODEL,
    instructions: `
You convert messy, free-text event details into a compact Google Calendar-style JSON object.

Follow these rules:
- Default timezone: "Asia/Jerusalem" unless a different IANA TZ is explicitly given.
- If text contains a time range (e.g., "1am-3am", "1 am to 3 am"), use it as start/end.
- If only one time is present, set duration to 60 minutes.
- If only date + duration are present, set start=09:00 local and compute end=start+duration.
- If only a date is present, create an all-day event (start.date=YYYY-MM-DD, end.date=YYYY-MM-DD+1).
- If end ≤ start, add 1 day to end.
- Summary default: "Untitled Event" or make sure you write in uppercase first letters.
- Output ONLY valid JSON matching the schema; no extra keys, no commentary.

Examples:

Input:
"ai project calendar; Aug 23, 2025; 1am-3am; tz Asia/Jerusalem"

Output:
{"summary":"ai project calendar","start":{"dateTime":"2025-08-23T01:00:00+03:00","timeZone":"Asia/Jerusalem"},"end":{"dateTime":"2025-08-23T03:00:00+03:00","timeZone":"Asia/Jerusalem"}}

Input:
"Offsite; 2025-08-22"

Output:
{"summary":"Offsite","start":{"date":"2025-08-22"},"end":{"date":"2025-08-23"}}
`.trim(),
  }),
};

export const calendarRouterAgent = new Agent({
  name: 'calendar_router_agent',
  model: CURRENT_MODEL,
  modelSettings: { parallelToolCalls: true },
  instructions: `Plan before acting. Keep a concise scratchpad of confirmed facts (e.g., validated email, calendar types, normalized schema).

Execution rules:
- Always include "email" when calling any tool.
- If multiple tools can run independently, call them in parallel.
- After each tool returns, reassess the plan:
  • If sufficient data is available, proceed to the next dependent tool.
  • If required fields are missing, request them from the user.
  • If all goals are met, finalize the answer.

Dependencies:
1. validate_user must succeed before any other tool.
2. calendar_type may provide input for validate_event_fields, but if user input already suffices, run both in parallel.
3. validate_event_fields must use the {schema} output from normalize_event.
4. insert_event should be called only if validate_event_fields returns { valid: true }. If invalid, summarize errors and stop.
`.trim(),
  tools: [
    AGENTS.validateUserAuth.asTool({ toolName: 'validate_user' }),
    AGENTS.analysesCalendarTypeByEventInformation.asTool({ toolName: 'calendar_type_by_event_details' }),
    AGENTS.normalizeEventAgent.asTool({ toolName: 'normalize_event' }),
    // AGENTS.validateEventFields.asTool({ toolName: 'validate_event_fields' }),
    AGENTS.insertEvent.asTool({ toolName: 'insert_event' }),
  ],
});
