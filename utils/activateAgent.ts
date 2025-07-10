import { Agent, run } from "@openai/agents";

import { asyncHandler } from "./async-handler";

export const activateAgent = asyncHandler(async (agent: Agent, text: string) => {
  if (!agent) return `Please provide an agent in order to activate it.`;

  if (!text) return `Please provide the prompt for the agent: ${agent.name}`;

  const r = await run(agent, text);

  return r.finalOutput;
});
