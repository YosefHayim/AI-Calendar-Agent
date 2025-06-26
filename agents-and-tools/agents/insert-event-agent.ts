import { Agent, tool } from '@openai/agents';
import { calendar, requestConfigBase } from '../../config/root-config';

import { GaxiosPromise } from 'googleapis/build/src/apis/abusiveexperiencereport';
import { calendar_v3 } from 'googleapis';
import { calenderRequestSchema } from '../parameters-storage';

const insertEvent = tool({
  name: 'insertEvent',
  description: ' Insert an event into the calendar using the provided event data.',
  parameters: calenderRequestSchema,
  execute: async (input: unknown): GaxiosPromise<calendar_v3.Schema$Event> => {
    const eventData = input as calendar_v3.Params$Resource$Events$Insert;
    let r;

    try {
      r = await calendar.events.insert({ ...requestConfigBase, ...eventData });
    } catch (error) {
      console.log('Failed to insert event by agent.:', error);
      throw new Error('Failed to insert event by agent.');
    } finally {
    }
    if (!r) throw new Error('Failed to insert event by agent.');

    return r;
  },
});

export const insertEventAgent = new Agent({
  name: 'Insert Event Agent',
  model: 'gpt-4',
  instructions:
    ' You are an agent that helps users insert events into their calendar. When a user asks to add, insert, or schedule an event, you will handle the request.',
  handoffDescription:
    ' If the user asks about adding, inserting, or scheduling an event, you will handle the request. You will not handle requests related to updating or deleting events.',
  outputType: 'text',
  toolUseBehavior: 'run_llm_again',
  tools: [insertEvent],
});
