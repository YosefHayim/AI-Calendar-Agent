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
};

export const calendarRouterAgent = new Agent({
  name: 'calendar_router_agent',
  model: CURRENT_MODEL,
  modelSettings: { parallelToolCalls: true },
  instructions: AGENT_INSTRUCTIONS.calendarRouterAgent,

  tools: [
    AGENTS.normalizeEventAgent.asTool({ toolName: 'normalize_event' }),
    AGENTS.validateEventFields.asTool({ toolName: 'validate_event_fields' }),
    AGENTS.analysesCalendarTypeByEventInformation.asTool({ toolName: 'calendar_type_by_event_details' }),
    AGENTS.insertEvent.asTool({ toolName: 'insert_event' }),
  ],
});
