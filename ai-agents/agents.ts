import { Agent, setDefaultOpenAIKey, setTracingExportApiKey } from '@openai/agents';
import { CONFIG } from '@/config/root-config';
import { CURRENT_MODEL } from '@/types';
import { AGENT_HANDOFFS } from './agents-hands-off-description';
import { AGENT_INSTRUCTIONS } from './agents-instructions';
import { AGENT_TOOLS } from './agents-tools';

setDefaultOpenAIKey(CONFIG.open_ai_api_key || '');
setTracingExportApiKey(CONFIG.open_ai_api_key || '');

export const AGENTS = {
  validateUserAuth: new Agent({
    name: 'validate_user_db_agent',
    instructions: AGENT_INSTRUCTIONS.validateUserAuth,
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: 'required' },
    handoffDescription: AGENT_HANDOFFS.validateUserAuth,
    tools: [AGENT_TOOLS.validate_user_db],
  }),
  validateEventFields: new Agent({
    name: 'validate_event_fields_agent',
    instructions: AGENT_INSTRUCTIONS.validateEventFields,
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: 'required' },
    handoffDescription: AGENT_HANDOFFS.validateEventFields,
    tools: [AGENT_TOOLS.validate_event_fields],
  }),
  insertEvent: new Agent({
    name: 'insert_event_agent',
    instructions: AGENT_INSTRUCTIONS.insertEvent,
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: 'required' },
    handoffDescription: AGENT_HANDOFFS.insertEvent,
    tools: [AGENT_TOOLS.insert_event],
  }),
  getEventByIdOrName: new Agent({
    instructions: AGENT_INSTRUCTIONS.getEventByIdOrName,
    name: 'get_event_by_name_agent',
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: 'required' },
    handoffDescription: AGENT_HANDOFFS.getEventByIdOrName,
    tools: [AGENT_TOOLS.get_event],
  }),
  updateEventByIdOrName: new Agent({
    instructions: AGENT_INSTRUCTIONS.updateEventByIdOrName,
    name: 'update_event_by_id_agent',
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: 'required' },
    handoffDescription: AGENT_HANDOFFS.updateEventByIdOrName,
    tools: [AGENT_TOOLS.update_event],
  }),
  deleteEventByIdOrName: new Agent({
    name: 'delete_event_by_id_agent',
    instructions: AGENT_INSTRUCTIONS.deleteEventByIdOrName,
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: 'required' },
    handoffDescription: AGENT_HANDOFFS.deleteEventByIdOrName,
    tools: [AGENT_TOOLS.delete_event],
  }),
  analysesCalendarTypeByEventInformation: new Agent({
    name: 'analyses_calendar_type_by_event_agent',
    instructions: AGENT_INSTRUCTIONS.analysesCalendarTypeByEventInformation,
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: 'required' },
    handoffDescription: AGENT_HANDOFFS.analysesCalendarTypeByEventInformation,
    tools: [AGENT_TOOLS.calendar_type],
  }),
  normalizeEventAgent: new Agent({
    name: 'normalize_event_agent',
    model: CURRENT_MODEL,
    instructions: AGENT_INSTRUCTIONS.normalizeEventAgent,
  }),
  getUserDefaultTimeZone: new Agent({
    name: 'get_user_default_timezone_agent',
    model: CURRENT_MODEL,
    instructions: AGENT_INSTRUCTIONS.getUserDefaultTimeZone,
    tools: [AGENT_TOOLS.get_user_default_timezone],
  }),
};

export const HANDS_OFF_AGENTS = {
  insertEventHandOffAgent: new Agent({
    name: 'insert_event_handoff_agent',
    model: CURRENT_MODEL,
    modelSettings: { parallelToolCalls: true },
    instructions: AGENT_INSTRUCTIONS.calendarRouterAgent,
    tools: [
      AGENTS.normalizeEventAgent.asTool({ toolName: 'normalize_event' }),
      AGENTS.getUserDefaultTimeZone.asTool({ toolName: 'get_user_default_timezone' }),
      AGENTS.validateEventFields.asTool({ toolName: 'validate_event_fields' }),
      AGENTS.analysesCalendarTypeByEventInformation.asTool({ toolName: 'calendar_type_by_event_details' }),
      AGENTS.insertEvent.asTool({ toolName: 'insert_event' }),
    ],
  }),
  updateEventOrEventsHandOffAgent: new Agent({
    name: 'update_event_handoff_agent',
    model: CURRENT_MODEL,
    instructions: `Role: Calendar updater.
Task: Update an existing event by ID (preferred) or by matching title/keywords within an optional time window.
Rules:
- Never create a new event.
- If multiple matches or ambiguity, ask for a single disambiguating detail (ID, exact title, or date range) before proceeding.
- Apply partial updates only; preserve unspecified fields.
- For recurring events, require scope: single occurrence (with date) or entire series.
- Respect provided timezone; otherwise retain the event’s timezone.
Tool usage: Call tool "update_event" only after the target is unambiguous.`,
    tools: [AGENTS.updateEventByIdOrName.asTool({ toolName: 'update_event' })],
  }),
  deleteEventOrEventsHandOffAgent: new Agent({
    name: 'delete_event_handoff_agent',
    model: CURRENT_MODEL,
    instructions: `Role: Calendar deleter.
Task: Delete an event by ID (preferred) or by matching title/keywords within a specified time window.
Rules:
- Do not delete if the match is ambiguous; request one disambiguating detail (ID, exact title, or date range).
- For recurring events, require scope: single occurrence (with date) or entire series.
- No creation or modification of other events.
Tool usage: Call tool "delete_event" only after confirming a single unambiguous target and scope.`,
    tools: [AGENTS.deleteEventByIdOrName.asTool({ toolName: 'delete_event' })],
  }),
  getEventOrEventsHandOffAgent: new Agent({
    name: 'get_event_handoff_agent',
    model: CURRENT_MODEL,
    instructions: `Role: Calendar retriever.

Task: Retrieve event(s) by ID or by matching title/keywords; support optional filters (timeMin, attendee, location).

Rules:
- If ID is provided, return that event only.
- If title/keywords are used, rank exact-title matches first; return up to 10 results sorted by start time.
- For recurring events, return instances when a timeMin is provided; otherwise return series metadata.
- When the user specifies a time reference (e.g., “last week”, “yesterday”, “next month”):
  • Convert it into an explicit ISO 8601 date string for "timeMin".  
  • "timeMin" must represent the inclusive start of that period, anchored to today’s date.  
  • Normalize to YYYY-MM-DD format in UTC unless the tool requires otherwise.
- Do not invent fields;
surface;
only;
what;
is;
returned;
by;
the;
tool.
- Never
expose;
raw;
JSON.Output;
format: -Precede;
the;
list;
with a concise
summary, e.g., “
Here;
are;
your;
X;
events;
since [timeMin].
”
- If no events are found, explicitly
return
: “No events found.”
- Each event must be listed in numbered order and include, in this exact sequence:
  • ID: show only the base event ID (strip recurrence suffixes like '_20250824T050000Z')
if needed, show the
full;
ID in parentheses.
• Title
  • Start: show both full format (“Sunday, August 24, 2025 09:00 (GMT+3)”) and short format (“2025-08-24 09:00”)
  • End: same two formats
  • Location (
if provided, otherwise
“—”)
  • Description (
if provided, otherwise
“—”)

Constraints:
- Respect the event’s timezone
never
alter;
offsets.
- Do
not;
guess;
event;
content;
or;
synthesize;
unavailable;
fields.
- Output
must;
strictly;
follow;
the;
specified;
format.Tool;
usage: -Always;
use;
tool;
('get_event');
for lookups.
- Never guess values that
must;
come;
from;
the;
tool.
- Apply
parsed;
('timeMin');
when;
a;
time;
reference;
is;
given.
`,
    tools: [AGENTS.getEventByIdOrName.asTool({ toolName: 'get_event' })],
  }),
};
