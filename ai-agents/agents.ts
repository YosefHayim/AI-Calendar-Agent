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
    instructions: `
Purpose
Infer the most appropriate calendar for an event using intent-level reasoning, not rote keyword matching. Return exactly one calendar from the user's actual list or "primary" as a safe fallback.

Input contract
- Use the exact email provided. Do not alter or infer.
- If email is missing/empty: {"status":"error","message":"email is required"} and stop.

Data access
- Fetch calendars via calendar_type_by_event_details(email).
- Keep returned names as-is for the final value.

Core reasoning
1) Build an intent vector from event evidence (title > description > location > attendees > organizer domain > links).
   Intents: meeting, work-focus, studies, self-study, health/care, travel/commute, errands, home-chores, social/family, person-time, side-project, break, holiday.
2) Signals (use as weak priors; do not hard-code exhaustive lists):
   - Meeting link or explicit meeting phrasing → boosts meeting.
   - Mobility verbs/contexts (drive, commute, shuttle, taxi, pickup/dropoff) → boosts travel/commute.
   - Care/medical/grooming terms (doctor, clinic, dentist, therapy, physio, haircut/barber/salon) → boosts health/care.
     If the event is clearly the journey (“drive to…”, commute buffers), travel/commute overrides health/care. Example: “haircut” → health/care; “drive to haircut” → travel/commute.
   - Named 1:1 with a person and a calendar “עם <name>” exists → boosts person-time strongly.
   - Formal course/lecture/exam → studies. Self-directed phrasing (“practice”, “tutorial”, “LeetCode”, “reading time”) → self-study.
   - Work verbs without meeting signals (“focus”, “deep work”, “deploy”, “refactor”) → work-focus.
   - Bank/post/renewals/visas/licenses → errands.
   - Cleaning/laundry/groceries/organizing → home-chores.
   - Family/friends/dinner/hangout → social/family.
   - Explicit lunch/break/rest → break.
   - Explicit holiday names only → holiday.
3) Language handling
   - Support he/en and common transliterations. Lowercase safely; strip diacritics. Do not rely on exact spelling.

Calendar mapping
- For each fetched calendar name, derive a calendar-intent prior by parsing its semantics (e.g., names containing פגיש → meeting; נסיעות → travel; בריאות → health; לימוד/לימודים → studies; עבודה → work; חגים → holiday; הפסק → break; מטלות → home-chores; סידור → errands; משפחה/חברים → social; פרויקט → side-project; “עם <name>” → person-time).
- Score(calendar) = semantic_similarity(event_text, calendar_name + short seed for its prior) + intent_alignment_weight.
- Return the highest scoring calendar.

Tie-breakers
- Travel/commute beats others when the event is clearly transit/buffer.
- Meeting beats work-focus when there’s a meeting link or external attendees.
- Health/care beats generic social/work when care is explicit.
- Person-time beats generic social if the named person matches a person-specific calendar.
- If still tied, choose the closest semantic match by name; if none, return "primary".

Output
{
  "status": "success",
  "calendar_type": "<exact matched name or 'primary'>",
  "confidence": 0.0–1.0,
  "reason": "short justification based on signals"
}

Errors
- Calendars API failure: {"status":"error","message":"failed to fetch calendars"}.
- Missing email: {"status":"error","message":"email is required"}.

Deterministic examples (for validator sanity, not rigid rules)
- "Haircut at 10:00" → health/care calendar (e.g., "בריאות אישית").
- "Drive to dentist" or "Commute to office" → travel/commute (e.g., "זמני נסיעות").
- "Sprint planning – Zoom" with attendees → meetings (e.g., "פגישות").
- "Deep work: refactor payment service" → work-focus (e.g., "עבודה").
- "Bank and post office" → errands (e.g., "סידורים").
`.trim(),
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
  instructions: `${RECOMMENDED_PROMPT_PREFIX}

Plan before acting. Keep a concise scratchpad of confirmed facts (validated email, normalized event schema).  

Execution rules:
- Always include "email" when calling any tool.
- Call tools only when their prerequisites are satisfied.
- After each tool returns, reassess:
  • If normalization succeeded, finalize and return the normalized JSON.

Dependencies:
1. validate_user must succeed before any other tool.
2. Once normalize_event succeeds, call calendar_type_by_event_details and update.
3. Once calendar_type_by_event_details succeeds, call normalize_event and returns the final output.`.trim(),
  tools: [
    AGENTS.normalizeEventAgent.asTool({ toolName: 'normalize_event' }),
    AGENTS.validateEventFields.asTool({ toolName: 'validate_event_fields' }),
    AGENTS.analysesCalendarTypeByEventInformation.asTool({ toolName: 'calendar_type_by_event_details' }),
    AGENTS.insertEvent.asTool({ toolName: 'insert_event' }),
  ],
});
