import { Agent, setDefaultOpenAIKey, setTracingExportApiKey } from '@openai/agents';
import { RECOMMENDED_PROMPT_PREFIX } from '@openai/agents-core/extensions';
import { CONFIG } from '@/config/root-config';
import { CURRENT_MODEL 
  outputType:'text',
} from '@/types';
import { AGENT_TOOLS } from './agents-tools';

setDefaultOpenAIKey(CONFIG.open_ai_api_key || '');
setTracingExportApiKey(CONFIG.open_ai_api_key || '');

export const AGENTS = {
  validateUserAuth: new Agent({
    name: 'validate_user_db_agent',
    instructions:
      'agent validates whether a user is registered in the system by querying the database. It requires a unique identifier, which is the email address. It returns a boolean and optional user metadata if found. It does not create, update, or delete any records.',
    model: CURRENT_MODEL,
    outputType: 'text',
    modelSettings: { toolChoice: 'required' },
    handoffDescription: `${RECOMMENDED_PROMPT_PREFIX} An agent that sends a request to database and expects in return a response from database that is not error.`,
    tools: [AGENT_TOOLS.validate_user_db],
  }),
  validateEventFields: new Agent({
    name: 'validate_event_fields_agent',
    instructions:
      'agent converts free-text event details into a Google Calendar event object. It handles various input formats for summary, date, time, duration, timezone, location, and description. It applies default values if information is missing and ensures the output is a compact JSON matching the specified Google Calendar event object shape. It never asks questions and always proceeds with defaults if parsing fails.',
    model: CURRENT_MODEL,
    outputType: 'text',
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
    instructions:
      'agent inserts a new event into the calendar using provided normalized fields. If any required field is missing, it computes it once using defaults and proceeds. It does not handoff back and returns only the tool’s JSON result.',
    name: 'insert_event_agent',
    model: CURRENT_MODEL,
    outputType: 'text',
    modelSettings: { toolChoice: 'required' },
    handoffDescription: `${RECOMMENDED_PROMPT_PREFIX} An agent Insert the event using provided normalized fields.
  If any required field is missing, compute it ONCE using defaults and proceed.
  Do not handoff back. Return ONLY the tool’s JSON result.`,
    tools: [AGENT_TOOLS.insert_event],
  }),
  getEventByIdOrName: new Agent({
    instructions: "agent retrieves one or more events from the user's calendar by matching their title or keywords.",
    name: 'get_event_by_name_agent',
    model: CURRENT_MODEL,
    outputType: 'text',
    modelSettings: { toolChoice: 'required' },
    handoffDescription: `${RECOMMENDED_PROMPT_PREFIX} An agent that retrieve one or more events from the user's calendar by matching their title or keywords.`,
    tools: [AGENT_TOOLS.get_event],
  }),
  updateEventByIdOrName: new Agent({
    instructions:
      'agent updates an existing calendar event. It handles updates to summary, date, location, and duration. If a field is not specified, it keeps the original value.',
    name: 'update_event_by_id_agent',
    model: CURRENT_MODEL,
    outputType: 'text',
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
    instructions: 'agent deletes a calendar event based on the title or other identifying detail.',
    name: 'delete_event_by_id_agent',
    model: CURRENT_MODEL,
    outputType: 'text',
    modelSettings: { toolChoice: 'required' },
    handoffDescription: `${RECOMMENDED_PROMPT_PREFIX} An agent that delete a calendar event based on the title or other identifying detail.`,
    tools: [AGENT_TOOLS.delete_event],
  }),
  getCalendarList: new Agent({
    instructions: "agent returns the list of calendars associated with the user's account via the Google Calendar API.",
    name: 'calendar_list_agent',
    model: CURRENT_MODEL,
    outputType: 'text',

    modelSettings: { toolChoice: 'required' },
    handoffDescription: `${RECOMMENDED_PROMPT_PREFIX} An agent that returns the list of calendars associated with the user's account via google api calendar.`,
    tools: [AGENT_TOOLS.calendar_type],
  }),
  analysesCalendarTypeByEventInformation: new Agent({
    instructions:
      'agent analyzes event details and returns the calendar type that best fits the event. If the event is not suitable for any calendar type, it returns a default calendar type.',
    name: 'analyses_calendar_type_by_event_agent',
    model: CURRENT_MODEL,
    outputType: 'text',
    modelSettings: { toolChoice: 'required' },
    handoffDescription: `${RECOMMENDED_PROMPT_PREFIX} An agent that analyse the event details and return the calendar type that best fits the event.
    If the event is not suitable for any calendar type, return a default calendar type.`,
    tools: [AGENT_TOOLS.event_type],
  }),
  chatWithAgent: new Agent({
    instructions: 'agent chats with the user and acts as a personal calendar assistant.',
    name: 'chat_with_agent',
    model: CURRENT_MODEL,
    outputType: 'text',
    modelSettings: { toolChoice: 'required' },
    handoffDescription: `${RECOMMENDED_PROMPT_PREFIX} An agent that chat with the user and act as personal calendar assistant.`,
    tools: [AGENT_TOOLS.calendar_type],
  }),
};

const subAgents = Object.values(AGENTS);

export const calendarRouterAgent = new Agent({
  name: 'calendar_router_agent',
  model: CURRENT_MODEL,
  outputType: 'text',
  modelSettings: { toolChoice: 'required' },
  instructions: `${RECOMMENDED_PROMPT_PREFIX}
  You are an autonomous agent responsible for executing the full event-workflow with the user.  
  Follow these steps in strict order, without skipping or merging steps:

  1. Call "validate_user_db_agent" to confirm the user exists in our database.  
     - If validation fails, stop and return an error response.  

  2. Call "analyses_calendar_type_by_event_agent" to determine the correct calendar type from the event details.  

  3. Call "validate_event_fields_agent" to check and correct the event JSON schema.  
     - Always use the updated schema returned from this step.  

  4. Call "insert_event_agent" to insert the validated event into the system.  

  5. Respond back to the user:  
     - If all steps succeed, confirm the workflow was completed successfully.  
     - If any step fails, clearly state which step failed and why.  

  Rules:  
  - Never skip a step.  
  - Do not ask the user to confirm assumptions mid-flow; deduce and proceed.  
  - Be concise and professional in responses.  
  - End only when the workflow is fully resolved or a clear error has been returned.`,
  handoffs: subAgents,
  handoffOutputTypeWarningEnabled: true,
});
