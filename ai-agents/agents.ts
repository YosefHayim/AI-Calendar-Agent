import { Agent, setDefaultOpenAIKey, setTracingExportApiKey } from "@openai/agents";
import { CONFIG } from "@/config/root-config";
import { CURRENT_MODEL } from "@/types";
import { AGENT_HANDOFFS } from "./agents-hands-off-description";
import { AGENT_INSTRUCTIONS } from "./agents-instructions";
import { AGENT_TOOLS } from "./agents-tools";

setDefaultOpenAIKey(CONFIG.open_ai_api_key || "");
setTracingExportApiKey(CONFIG.open_ai_api_key || "");

export const AGENTS = {
  generateUserCbGoogleUrl: new Agent({
    name: "generate_user_cb_google_url_agent",
    instructions: AGENT_INSTRUCTIONS.generateUserCbGoogleUrl,
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: AGENT_HANDOFFS.generateUserCbGoogleUrl,
    tools: [AGENT_TOOLS.generate_user_cb_google_url],
  }),
  registerUserViaDb: new Agent({
    name: "register_user_via_db_agent",
    instructions: AGENT_INSTRUCTIONS.registerUserViaDb,
    modelSettings: { toolChoice: "required" },
    handoffDescription: AGENT_HANDOFFS.registerUserViaDb,
    tools: [AGENT_TOOLS.register_user_via_db],
  }),
  validateUserAuth: new Agent({
    name: "validate_user_db_agent",
    instructions: AGENT_INSTRUCTIONS.validateUserAuth,
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: AGENT_HANDOFFS.validateUserAuth,
    tools: [AGENT_TOOLS.validate_user_db],
  }),
  validateEventFields: new Agent({
    name: "validate_event_fields_agent",
    instructions: AGENT_INSTRUCTIONS.validateEventFields,
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: AGENT_HANDOFFS.validateEventFields,
    tools: [AGENT_TOOLS.validate_event_fields],
  }),
  insertEvent: new Agent({
    name: "insert_event_agent",
    instructions: AGENT_INSTRUCTIONS.insertEvent,
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: AGENT_HANDOFFS.insertEvent,
    tools: [AGENT_TOOLS.insert_event],
  }),
  getEventByIdOrName: new Agent({
    instructions: AGENT_INSTRUCTIONS.getEventByIdOrName,
    name: "get_event_by_name_agent",
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: AGENT_HANDOFFS.getEventByIdOrName,
    tools: [AGENT_TOOLS.get_event],
  }),
  updateEventByIdOrName: new Agent({
    instructions: AGENT_INSTRUCTIONS.updateEventByIdOrName,
    name: "update_event_by_id_agent",
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: AGENT_HANDOFFS.updateEventByIdOrName,
    tools: [AGENT_TOOLS.update_event],
  }),
  deleteEventByIdOrName: new Agent({
    name: "delete_event_by_id_agent",
    instructions: AGENT_INSTRUCTIONS.deleteEventByIdOrName,
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: AGENT_HANDOFFS.deleteEventByIdOrName,
    tools: [AGENT_TOOLS.delete_event],
  }),
  analysesCalendarTypeByEventInformation: new Agent({
    name: "analyses_calendar_type_by_event_agent",
    instructions: AGENT_INSTRUCTIONS.analysesCalendarTypeByEventInformation,
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: AGENT_HANDOFFS.analysesCalendarTypeByEventInformation,
    tools: [AGENT_TOOLS.calendar_type],
  }),
  normalizeEventAgent: new Agent({
    name: "normalize_event_agent",
    model: CURRENT_MODEL,
    instructions: AGENT_INSTRUCTIONS.normalizeEventAgent,
  }),
  getUserDefaultTimeZone: new Agent({
    name: "get_user_default_timezone_agent",
    model: CURRENT_MODEL,
    instructions: AGENT_INSTRUCTIONS.getUserDefaultTimeZone,
    tools: [AGENT_TOOLS.get_user_default_timezone],
  }),
};

export const HANDS_OFF_AGENTS = {
  insertEventHandOffAgent: new Agent({
    name: "insert_event_handoff_agent",
    model: CURRENT_MODEL,

    modelSettings: { parallelToolCalls: true },
    instructions: AGENT_INSTRUCTIONS.insertEventHandOffAgent,
    tools: [
      AGENTS.normalizeEventAgent.asTool({ toolName: "normalize_event" }),
      AGENTS.getUserDefaultTimeZone.asTool({ toolName: "get_user_default_timezone" }),
      AGENTS.validateEventFields.asTool({ toolName: "validate_event_fields" }),
      AGENTS.analysesCalendarTypeByEventInformation.asTool({ toolName: "calendar_type_by_event_details" }),
      AGENTS.insertEvent.asTool({ toolName: "insert_event" }),
    ],
  }),
  updateEventOrEventsHandOffAgent: new Agent({
    name: "update_event_handoff_agent",
    model: CURRENT_MODEL,
    instructions: AGENT_INSTRUCTIONS.updateEventByIdOrNameHandOffAgent,
    modelSettings: { toolChoice: "required" },
    tools: [AGENTS.getEventByIdOrName.asTool({ toolName: "get_event" }), AGENTS.updateEventByIdOrName.asTool({ toolName: "update_event" })],
  }),
  deleteEventOrEventsHandOffAgent: new Agent({
    name: "delete_event_handoff_agent",
    model: CURRENT_MODEL,
    instructions: AGENT_INSTRUCTIONS.deleteEventByIdOrNameHandOffAgent,

    tools: [AGENTS.getEventByIdOrName.asTool({ toolName: "get_event" }), AGENTS.deleteEventByIdOrName.asTool({ toolName: "delete_event" })],
  }),
  getEventOrEventsHandOffAgent: new Agent({
    name: "get_event_handoff_agent",
    model: CURRENT_MODEL,
    instructions: AGENT_INSTRUCTIONS.getEventOrEventsHandOffAgent,
    tools: [AGENTS.getEventByIdOrName.asTool({ toolName: "get_event" })],
  }),
  registerUserHandOffAgent: new Agent({
    name: "register_user_handoff_agent",
    model: CURRENT_MODEL,
    instructions: AGENT_INSTRUCTIONS.registerUserHandOffAgent,
    tools: [AGENTS.validateUserAuth.asTool({ toolName: "register_user_via_db" })],
  }),
};

export const ORCHESTRATOR_AGENT = new Agent({
  name: "calendar_orchestrator_agent",
  model: CURRENT_MODEL,
  modelSettings: { parallelToolCalls: true },
  instructions: AGENT_INSTRUCTIONS.orchestratorAgent,
  tools: [
    HANDS_OFF_AGENTS.insertEventHandOffAgent.asTool({ toolName: "insert_event_handoff_agent" }),
    HANDS_OFF_AGENTS.getEventOrEventsHandOffAgent.asTool({ toolName: "get_event_handoff_agent" }),
    HANDS_OFF_AGENTS.updateEventOrEventsHandOffAgent.asTool({ toolName: "update_event_handoff_agent" }),
    HANDS_OFF_AGENTS.deleteEventOrEventsHandOffAgent.asTool({ toolName: "delete_event_handoff_agent" }),
    HANDS_OFF_AGENTS.registerUserHandOffAgent.asTool({ toolName: "register_user_handoff_agent" }),
    AGENTS.generateUserCbGoogleUrl.asTool({ toolName: "generate_user_cb_google_url" }),
  ],
});
