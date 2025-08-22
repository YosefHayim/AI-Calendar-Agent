import { Agent, setDefaultOpenAIKey } from '@openai/agents';
import { CONFIG } from '@/config/root-config';
import { CURRENT_MODEL } from '@/types';
import { AGENT_TOOLS } from './agents-tools';

setDefaultOpenAIKey(CONFIG.open_ai_api_key || '');

export const AGENTS = {
  validateUserAuth: new Agent({
    name: 'validate_user_db_agent',
    model: CURRENT_MODEL,
    instructions: 'An agent that sends a request to database and expects in return a response from database that is not error.',
    tools: [AGENT_TOOLS.validate_user_db],
  }),
  validateEventFields: new Agent({
    name: 'validate_event_fields_agent',
    model: CURRENT_MODEL,
    instructions: `You convert free-text event details into a Google Calendar event object.

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
- timezone default: "Asia/Jerusalem".
- If user gives a time range in any field (e.g., "9 PM to 10 PM"), treat as start/end.
- If only date + duration: pick start=09:00 local and compute end = start + duration.
- If only date: create all-day event (start.date = YYYY-MM-DD, end.date = YYYY-MM-DD + 1).
- If both start and end given: ensure end > start; if end ≤ start, add 1 day to end.
- Use RFC3339 for dateTime (e.g., "2025-08-22T21:00:00+03:00" is OK), AND include timeZone on start/end objects.
- Never ask questions. If something is missing, apply defaults.
- Summary default: "Untitled Event".
- Output ONLY compact JSON matching this exact shape (no extra keys, no commentary):
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
    model: CURRENT_MODEL,
    instructions: `Insert the event using provided normalized fields.
  If any required field is missing, compute it ONCE using defaults and proceed.
  Do not handoff back. Return ONLY the tool’s JSON result.`,
    tools: [AGENT_TOOLS.insert_event],
  }),
  getEventByIdOrName: new Agent({
    name: 'get_event_by_name_agent',
    model: CURRENT_MODEL,
    instructions: `An agent that retrieve one or more events from the user's calendar by matching their title or keywords.`,
    tools: [AGENT_TOOLS.get_event],
  }),
  updateEventByIdOrName: new Agent({
    name: 'update_event_by_id_agent',
    model: CURRENT_MODEL,
    instructions: `An agent that update an existing calendar event.
  
    Handle updates to:
    - Summary
    - Date
    - Location
    - Duration 
  
  If a field is not specified, keep the original value.`,
    tools: [AGENT_TOOLS.update_event],
  }),
  deleteEventByIdOrName: new Agent({
    name: 'delete_event_by_id_agent',
    model: CURRENT_MODEL,
    instructions: 'An agent that delete a calendar event based on the title or other identifying detail.',
    tools: [AGENT_TOOLS.delete_event],
  }),
  getCalendarList: new Agent({
    name: 'calendar_list_agent',
    model: CURRENT_MODEL,
    instructions: `An agent that returns the list of calendars associated with the user's account via google api calendar.`,
    tools: [AGENT_TOOLS.calendar_type],
  }),
  analysesCalendarTypeByEventInformation: new Agent({
    name: 'analyse_calendar_type_by_event_agent',
    model: CURRENT_MODEL,
    instructions: `An agent that analyse the event details and return the calendar type that best fits the event.
    If the event is not suitable for any calendar type, return a default calendar type.`,
    tools: [AGENT_TOOLS.event_type],
  }),
  chatWithAgent: new Agent({
    name: 'chat_with_agent',
    model: CURRENT_MODEL,
    instructions: 'An agent that chat with the user and act as personal calendar assistant.',
    tools: [AGENT_TOOLS.calendar_type],
  }),
};

const subAgents = Object.values(AGENTS) as Agent[];

export const calendarRouterAgent = new Agent({
  name: 'calendar_router_agent',
  model: CURRENT_MODEL,
  instructions: `TOOLS-ONLY CONTROLLER. Never address the user.
Sequence (always):
1) validate_user_db_agent
2) validate_event_fields_agent        // convert free text → RFC3339 start/end + minutes
3) analyse_calendar_type_by_event_agent
4) Route by intent → EXACTLY ONE of:
   insert_event_agent | get_event_by_name_agent | update_event_by_id_agent | delete_event_by_id_agent | calendar_list_agent
Then STOP.

Never ask for confirmation or more details.
If parsing fails, apply defaults and continue.
Defaults: timezone=Asia/Jerusalem, summary="Untitled Event", start=now, duration=60m.
If only date_text+duration_text → compute start/end.

Output: return ONLY the final tool JSON.`,

  handoffs: subAgents,
  outputType: 'text',
  outputGuardrails: [
    {
      name: 'no_questions',
      execute: async ({ agentOutput }) => {
        const NO_QUESTIONS_REGEX = /\bplease provide\b|\bconfirm\b|\bwould you like\b|\?$/i;
        const isBad = NO_QUESTIONS_REGEX.test(agentOutput.toString().trim());

        return { tripwireTriggered: isBad, outputInfo: { message: 'No user-facing questions allowed.' } };
      },
    },
  ],
  handoffOutputTypeWarningEnabled: true,
});
