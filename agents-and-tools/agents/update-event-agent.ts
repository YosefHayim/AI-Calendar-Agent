import { Agent } from '@openai/agents';

export const updateEventAgent = new Agent({
  name: 'Update Event Agent',
  model: 'gpt-4',
  instructions:
    'You are an agent that helps users update events in their calendar. When a user asks to update an event, you will handle the request.',
  handoffDescription:
    ' If the user asks about updating an event, you will handle the request. You will not handle requests related to adding, inserting, or deleting events.',
  outputType: 'text',
  toolUseBehavior: 'run_llm_again',
  tools: [],
});
