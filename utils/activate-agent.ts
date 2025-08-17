import { type Agent, run } from '@openai/agents';
import { AGENTS } from '@/ai-agents/agents';
import type { AGENTS_LIST } from '@/types';
import { asyncHandler } from './async-handlers';

export const activateAgent = asyncHandler(async (agentKey: AGENTS_LIST | Agent, prompt: string) => {
  let agent: Agent;

  if (typeof agentKey === 'string') {
    agent = AGENTS[agentKey];
  } else {
    agent = agentKey;
  }

  if (!agent) {
    throw new Error('The provided agent is not valid.');
  }

  if (!prompt) {
    throw new Error(`Please provide the prompt for the agent: ${agent.name}`);
  }

  return await run(agent, prompt);
});
