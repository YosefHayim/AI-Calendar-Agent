import { tool } from '@openai/agents';
import { TOOLS_DESCRIPTION } from './description-tools';
import { EXECUTION_TOOLS } from './execution-tools';
import { getCalendarTypes, PARAMETERS_TOOLS } from './parameters-tools';

export const AGENT_TOOLS = {
  validate_user_db: tool({
    name: 'validate_user',
    description: TOOLS_DESCRIPTION.validateUser,
    parameters: PARAMETERS_TOOLS.validateUserDbParameter,
    execute: EXECUTION_TOOLS.validateUser,
    errorFunction: (_, error) => {
      return `validate_user: ${error}`;
    },
  }),
  validate_event_fields: tool({
    name: 'validate_event_fields',
    description: 'validates free-text into a Google Calendar event object. Pass email through for token lookup.',
    parameters: PARAMETERS_TOOLS.normalizedEventParams,
    execute: EXECUTION_TOOLS.validateEventFields,
    errorFunction: (_, error) => {
      return `validate_event_fields: ${error}`;
    },
  }),
  insert_event: tool({
    name: 'insert_event',
    description: TOOLS_DESCRIPTION.insertEvent,
    parameters: PARAMETERS_TOOLS.insertEventParameters,
    execute: EXECUTION_TOOLS.insertEvent,
    errorFunction: (_, error) => {
      return `insert_event: ${error}`;
    },
  }),
  get_event: tool({
    name: 'get_event',
    description: TOOLS_DESCRIPTION.getEvent,
    parameters: PARAMETERS_TOOLS.getEventParameters,
    execute: EXECUTION_TOOLS.getEvent,
    errorFunction: (_, error) => {
      return `get_event: ${error}`;
    },
  }),
  update_event: tool({
    name: 'update_event',
    description: TOOLS_DESCRIPTION.updateEvent,
    parameters: PARAMETERS_TOOLS.updateEventParameters,
    execute: EXECUTION_TOOLS.updateEvent,
    errorFunction: (_, error) => {
      return `update_event: ${error}`;
    },
  }),
  delete_event: tool({
    name: 'delete_event',
    description: TOOLS_DESCRIPTION.deleteEvent,
    parameters: PARAMETERS_TOOLS.deleteEventParameter,
    execute: EXECUTION_TOOLS.deleteEvent,
    errorFunction: (_, error) => {
      return `delete_event: ${error}`;
    },
  }),
  calendar_type: tool({
    name: 'calendar_type',
    description: TOOLS_DESCRIPTION.getCalendarTypes,
    parameters: getCalendarTypes,
    execute: EXECUTION_TOOLS.getCalendarTypes,
    errorFunction: (_, error) => {
      return `calendar_type: ${error}`;
    },
  } as const),
};
