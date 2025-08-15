import { Agent, setDefaultOpenAIKey } from '@openai/agents';
import { CONFIG } from '@/config/root-config';
import { CURRENT_MODEL } from '@/types';
import { AGENT_TOOLS } from './agents-tools';

setDefaultOpenAIKey(CONFIG.open_ai_api_key!);

export const AGENTS = {
  validateUserAuth: new Agent({
    name: 'validate_user_db_agent',
    model: CURRENT_MODEL,
    instructions:
      'An agent that sends a request to database and expects in return a response from database that is not error.',
    tools: [AGENT_TOOLS.validate_user_db],
  }),
  validateEventFields: new Agent({
    name: 'validate_event_fields_agent',
    model: CURRENT_MODEL,
    instructions: `Validate and normalize summary, start/end, and duration. 
Return RFC3339 datetimes and duration minutes. Default summary "Untitled Event"; default start=now; default duration=60m.`,
    tools: [AGENT_TOOLS.validate_event_fields],
  }),
  insertEvent: new Agent({
    name: 'insert_event_agent',
    model: CURRENT_MODEL,
    instructions: `An agent that insert a new event into the user's calendar.
    If any required detail is missing, use:
    - Default Summary title: "Untitled Event"
    - Date : todays date formatted according to RFC3339.
    - Default duration: current time + 1 hour.
    - Omit location if missing.`,
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
    instructions:
      'An agent that delete a calendar event based on the title or other identifying detail.',
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
    instructions:
      'An agent that chat with the user and act as personal calendar assistant.',
    tools: [AGENT_TOOLS.calendar_type],
  }),
};

const subAgents = Object.values(AGENTS) as Agent[];

export const calendarRouterAgent = new Agent({
  name: 'calendar_router_agent',
  model: CURRENT_MODEL,
  handoffDescription: `
  Router for Google Calendar ops.
  
  Sequence:
  validate_user_agent → analyse_calendar_type_by_event_agent → route by intent → execute.
  If user not in DB → return "not authorized, please sign up".
  If calendar not authorized → return reauth callback URL.
  Pass calendar type to all CRUD calls. Insert/Update may normalize fields (RFC3339 dates).
  
  Intent → agent:
  - create/add/insert/schedule/make → insert_event_agent
  - get/find/show/list/see → get_event_by_name_agent
  - update/edit/move/reschedule/rename → update_event_by_id_agent
  - delete/remove/cancel → delete_event_by_id_agent
  - calendars/list calendars/which calendar → calendar_list_agent
  - general chat/help → chat_with_agent
  
  Update/Delete resolution:
  If no event ID, first call get_event_by_name_agent to resolve an ID (prefer exact title+time match), then call the mapped agent.
  
  Rules:
  Never skip validation or calendar-type analysis. No direct user replies; always hand off in the above order.
  `,
  handoffs: subAgents,
});
