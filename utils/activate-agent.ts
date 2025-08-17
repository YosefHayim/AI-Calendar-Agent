import { run } from '@openai/agents';
import { AGENTS } from '@/ai-agents/agents';
import type { AGENTS_LIST } from '@/types';
import { asyncHandler } from './async-handlers';

export const activateAgent = asyncHandler(async (agentKey: AGENTS_LIST, prompt: string) => {
  const agent = AGENTS[agentKey];

  if (!agent) {
    throw new Error('The provided agent is not valid.');
  }

  if (!prompt) {
    throw new Error(`Please provide the prompt for the agent: ${agent.name}`);
  }

  return await run(agent, prompt);
});
