import * as z from 'zod';

import { Agent } from '@openai/agents';

const updateEventAgentSchema = {};

export const updateEventAgent = new Agent({
  name: 'Update Event Agent',
  model: 'gpt-4',
  instructions:
    'You are an agent that helps users update events in their calendar. When a user asks to update an event, you will handle the request.',
  outputType: 'text',
  toolUseBehavior: 'run_llm_again',
  tools: [],
});
