import { Agent, tool } from '@openai/agents';
import { calendar, requestConfigBase } from '../../config/root-config';

import { GaxiosPromise } from 'googleapis/build/src/apis/abusiveexperiencereport';
import { calendar_v3 } from 'googleapis';
import { calenderRequestSchema } from '../parameters-storage';

const updateEvent = tool({
  name: 'update_event',
  description: 'Update an existing event in the calendar.',
  parameters: calenderRequestSchema,
  execute: async (input: unknown): GaxiosPromise<calendar_v3.Schema$Event> => {
    const eventData = input as calendar_v3.Params$Resource$Events$Update;
    let r;
    try {
      r = await calendar.events.update({ ...requestConfigBase, ...eventData });
    } catch (error) {
      console.error('Error updating event:', error);
      throw new Error(`Failed to update event: ${error}`);
    } finally {
      if (!r) throw new Error('Failed to update event by agent.');
      return r;
    }
  },
});
export const updateEventAgent = new Agent({
  name: 'Update Event Agent',
  model: 'gpt-4',
  instructions:
    'You are an agent that helps users update events in their calendar. When a user asks to update an event, you will handle the request.',
  handoffDescription:
    ' If the user asks about updating an event, you will handle the request. You will not handle requests related to adding, inserting, or deleting events.',
  outputType: 'text',
  toolUseBehavior: 'run_llm_again',
  tools: [updateEvent],
});
