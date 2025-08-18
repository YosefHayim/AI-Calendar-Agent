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
    instructions: `Normalize free-text event fields to a strict schema without asking for more info.
  
  Input may contain: summary?, date_text?, start_text?, end_text?, duration_text?, timezone?
  Rules:
  - timezone: default "Asia/Jerusalem"
  - Parse to RFC3339. If only date_text + duration_text → compute start/end (start=parsed date/time or now).
  - duration_minutes must be integer.
  - If summary missing → "Untitled Event"
  
  Output ONLY compact JSON:
  {"summary": "...", "start": "RFC3339", "end": "RFC3339", "duration_minutes": 60, "timezone":"..."}
  
  Never handoff. Never ask questions.`,
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
  toolUseBehavior: 'stop_on_first_tool',
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
