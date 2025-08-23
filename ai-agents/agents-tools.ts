import { tool } from '@openai/agents';
import { TOOLS_DESCRIPTION } from './description-tools';
import { executionTools } from './execution-tools';
import { eventParameters } from './parameters-tools';

export const AGENT_TOOLS = {
  validate_user_db: tool({
    name: 'validate_user',
    description: TOOLS_DESCRIPTION.validateUser,
    parameters: eventParameters.validateUserDbParameter,
    execute: executionTools.validateUser,
    errorFunction: (_, error) => {
      return `validate_user error: ${error}`;
    },
  }),
  validate_event_fields: tool({
    name: 'validate_event_fields',
    description: 'Normalize free-text into a Google Calendar event object. Pass email through for token lookup.',
    parameters: eventParameters.normalizedEventParams,
    execute: executionTools.validateEventFields,
    errorFunction: (_, error) => {
      return `validate_event_fields error: ${error}`;
    },
  }),
  insert_event: tool({
    name: 'insert_event',
    description: TOOLS_DESCRIPTION.insertEvent,
    parameters: eventParameters.insertEventParameters,
    execute: executionTools.insertEvent,
    errorFunction: (_, error) => {
      return `insert_event error: ${error}`;
    },
  } as const),
  get_event: tool({
    name: 'get_event',
    description: TOOLS_DESCRIPTION.getEvent,
    parameters: eventParameters.getEventParameters,
    execute: executionTools.getEvent,
    errorFunction: (_, error) => {
      return `get_event error: ${error}`;
    },
  } as const),
  update_event: tool({
    name: 'update_event',
    description: TOOLS_DESCRIPTION.updateEvent,
    parameters: eventParameters.updateEventParameters,
    execute: executionTools.updateEvent,
    errorFunction: (_, error) => {
      return `update_event error: ${error}`;
    },
  } as const),
  delete_event: tool({
    name: 'delete_event',
    description: TOOLS_DESCRIPTION.deleteEvent,
    parameters: eventParameters.deleteEventParameter,
    execute: executionTools.deleteEvent,
    errorFunction: (_, error) => {
      return `delete_event error: ${error}`;
    },
  } as const),
  calendar_type: tool({
    name: 'calendar_type',
    description: TOOLS_DESCRIPTION.eventType,
    parameters: eventParameters.getEventParameters,
    errorFunction: (_, error) => {
      return `calendar_type error: ${error}`;
    },
    execute: executionTools.getCalendarTypes,
  } as const),

  event_type: tool({
    name: 'event_type',
    description: TOOLS_DESCRIPTION.eventType,
    parameters: eventParameters.getEventParameters,
    errorFunction: (_, error) => {
      return `event_type error: ${error}`;
    },
    execute: executionTools.getCalendarTypes,
  } as const),
};
