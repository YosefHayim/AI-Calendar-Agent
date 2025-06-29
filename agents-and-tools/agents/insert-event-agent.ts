import { Agent, tool } from '@openai/agents';
import { calendar, requestConfigBase } from '../../config/root-config';

import { CalenderRequestInsertSchema } from '../parameters-storage';
import { calendar_v3 } from 'googleapis';
import errorFn from '../../utils/error-template';

const insertEvent = tool({
  name: 'insert_event',
  description: 'Insert event into the calendar.',
  strict: true,
  needsApproval: true,
  parameters: CalenderRequestInsertSchema,

  execute: async (data): Promise<calendar_v3.Schema$Event> => {
    const event = CalenderRequestInsertSchema.parse(data);

    const response = await calendar.events.insert({
      ...requestConfigBase,
      requestBody: event,
    });

    if (!response) {
      errorFn('No response received from calendar API.', 500);
    }

    return response?.data;
  },
});

export const insertEventAgent = new Agent({
  name: 'Insert Event Agent',
  model: 'o4-mini-2025-04-16',
  instructions: `
  You are a smart calendar assistant.
  
  Your job is to schedule events based on what the user asks — no matter how the request is phrased.
  
  Always use the "insertEvent" tool to create the event.
  
  Extract the following from the user's message:
  - Title or subject of the event
  - Start time and date
  - End time and date (or infer a reasonable duration)
  - Optional: description or location if mentioned
  
  If the user is vague about timing (e.g., "in 2 hours", "tomorrow morning"), interpret it into a proper datetime in ISO format using the current system time as reference.
  
  Assume defaults if needed:
  - If the user doesn't provide a duration, default to 1 hour.
  - If the user doesn't give a title, use "Untitled Event".
  
  Never ignore a request to schedule — always try to insert something.
  
  Only rpond with the final output after the event is successfully inserted.
  `,
  outputType: CalenderRequestInsertSchema,

  toolUseBehavior: 'run_llm_again',
  tools: [insertEvent],
});
