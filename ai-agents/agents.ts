import { Agent, setDefaultOpenAIKey } from "@openai/agents";

import { AGENT_TOOLS } from "./agents-tools";
import { CONFIG } from "@/config/root-config";
import { CURRENT_MODEL } from "@/types";

setDefaultOpenAIKey(CONFIG.open_ai_api_key!);

export const AGENTS = {
  validateUserAuth: new Agent({
    name: "validate_user_agent",
    model: CURRENT_MODEL,
    instructions: `An agent that sends a request to database and expects in return a response from database that is not error.`,
    tools: [AGENT_TOOLS.validate_user],
  }),
  insertEvent: new Agent({
    name: "insert_event_agent",
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
    name: "get_event_by_name_agent",
    model: CURRENT_MODEL,
    instructions: `An agent that retrieve one or more events from the user's calendar by matching their title or keywords.`,
    tools: [AGENT_TOOLS.get_event],
  }),
  updateEventByIdOrName: new Agent({
    name: "update_event_by_id_agent",
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
    name: "delete_event_by_id_agent",
    model: CURRENT_MODEL,
    instructions: `An agent that delete a calendar event based on the title or other identifying detail.`,
    tools: [AGENT_TOOLS.delete_event],
  }),
  getCalendarList: new Agent({
    name: "calendar_list_agent",
    model: CURRENT_MODEL,
    instructions: `An agent that returns the list of calendars associated with the user's account via google api calendar.`,
    tools: [AGENT_TOOLS.calendar_type],
  }),
  analysesCalendarTypeByEventInformation: new Agent({
    name: "analyse_calendar_type_by_event_agent",
    model: CURRENT_MODEL,
    instructions: `An agent that analyse the event details and return the calendar type that best fits the event.
    If the event is not suitable for any calendar type, return a default calendar type.`,
    tools: [AGENT_TOOLS.event_type],
  }),
  chatWithAgent: new Agent({
    name: "chat_with_agent",
    model: CURRENT_MODEL,
    instructions: `An agent that chat with the user and act as personal calendar assistant.`,
    tools: [AGENT_TOOLS.calendar_type],
  }),
};

const subAgents = Object.values(AGENTS) as Agent[];

export const calendarRouterAgent = new Agent({
  name: "calendar_router_agent",
  model: CURRENT_MODEL,
  handoffDescription: `
  Workflow:

  1. **User Validation**  
     - Always first send the request to validate_user_agent.  
     - If validation fails, stop the flow and return the validation failure response.  
     - If validation passes, proceed.

  2. **Event Type Analysis**  
     - Pass the request and extracted details to analyse_calendar_type_by_event_agent.  
     - Use the returned calendar type for all subsequent CRUD operations.

  3. **Route by Intent**  
     - Determine the user's intent from the request.  
       - "add", "insert", "schedule", "make", "create" → insert_event_agent  
       - "get", "find", "show", "list", "see" → get_event_by_name_agent  
       - "update", "edit", "move", "reschedule", "rename" → update_event_by_id_agent  
       - "delete", "remove", "cancel" → delete_event_by_id_agent

  4. **Validation of Event Fields (if applicable)**  
     - For insert or update:  
       - validate_date_event_agent → must return "true"  
       - validate_duration_event_agent → must return "true"  
       - validate_summary_event_agent → must return "true"  
     - If any fail, stop and return the validation failure.

  5. **Execute CRUD Operation**  
     - Call the appropriate agent with the validated data and determined calendar type.

  Rules:  
  - Never skip the validation step.  
  - Never skip event type analysis.  
  - Do not respond directly to the user; always hand off to the next agent in the sequence.  
  - The sequence is strictly: validate_user_agent → analyse_calendar_type_by_event_agent → (field validation if required) → CRUD agent.
  `,
  handoffs: subAgents,
});
