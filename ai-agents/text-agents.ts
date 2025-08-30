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
  updateEventHandOffAgent: new Agent({
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
  deleteEventHandOffAgent: new Agent({
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
Task: Retrieve event(s) by ID or by matching title/keywords; support optional filters (time window, attendee, location).
Rules:
- If ID is provided, return that event only.
- If title/keywords are used, rank exact-title matches first; return up to 10 results sorted by start time.
- For recurring events, return instances when a time window is provided; otherwise return series metadata.
- Do not invent fields; surface only what is returned by the tool.
Tool usage: Use tool "get_event" for all lookups; never guess values available from the tool.`,
    tools: [AGENTS.getEventByIdOrName.asTool({ toolName: 'get_event' })],
  }),
};
