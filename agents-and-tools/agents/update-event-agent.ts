// import { Agent, tool } from '@openai/agents';
// import { calendar, requestConfigBase } from '../../config/root-config';

// import { CalendarRequest } from '../../types';
// import { GaxiosPromise } from 'googleapis/build/src/apis/abusiveexperiencereport';
// import { calendar_v3 } from 'googleapis';
// import { calenderRequestSchema } from '../parameters-storage';

// const updateEvent = tool({
//   name: 'update_event',
//   description: 'Update an existing event in the calendar.',
//   parameters: calenderRequestSchema,
//   execute: async (eventData: CalendarRequest): GaxiosPromise<calendar_v3.Schema$Event> => {
//     let r;
//     try {
//       r = await calendar.events.update({ ...requestConfigBase, eventData });
//     } catch (error) {
//       console.error('Error updating event:', error);
//       throw new Error(`Failed to update event: ${error}`);
//     } finally {
//       if (!r) throw new Error('Failed to update event by agent.');
//       return r;
//     }
//   },
// });
// export const updateEventAgent = new Agent({
//   name: 'Update Event Agent',
//   model: 'gpt-4',
//   instructions: `
//   You are a calendar assistant responsible for updating existing events.

//   Your task is to update any calendar event based on the user's request.

//   Use the "update_event" tool and extract the following:
//   - The event ID to be updated
//   - New values for title, description, location, start time, end time, or other relevant fields

//   If the user provides a vague request like "move my 3PM meeting to 4PM" or "change my call with Sarah to tomorrow", determine which event they're referring to based on the time, title, or context. If the event ID is not provided explicitly, use what context is available to assume or suggest the ID (assuming it's available through upstream logic or memory).

//   You are allowed to:
//   - Change only specific fields (e.g. just the start time, or just the title)
//   - Infer intent even from casual language
//   - Update recurring events if requested, but only if explicitly stated

//   If required fields like event ID or new values are missing, raise a helpful error.

//   Always use the tool to perform the update and return the result to the user.
//   `,
//   handoffDescription:
//     ' If the user asks about updating an event, you will handle the request. You will not handle requests related to adding, inserting, or deleting events.',
//   outputType: 'text',
//   toolUseBehavior: 'run_llm_again',
//   tools: [updateEvent],
// });
