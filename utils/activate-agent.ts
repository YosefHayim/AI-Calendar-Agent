import { run } from '@openai/agents';
import { AGENTS } from '@/ai-agents/agents';
import type { AGENTS_LIST } from '@/types';
import { asyncHandler } from './async-handlers';

export const activateAgent = asyncHandler(async (agentKey: AGENTS_LIST, prompt: string) => {
  const agent = AGENTS[agentKey];

  if (!agent) {
    return 'The provided agent is not valid.';
  }

  if (!prompt) {
    return `Please provide the prompt for the agent: ${agent.name}`;
  }

  const agentResponse = await run(agent, prompt);

  return agentResponse;
});
