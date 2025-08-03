import { Agent, run } from "@openai/agents";

import { AGENTS_LIST } from "@/types";
import { asyncHandler } from "./async-handler";

export const activateAgent = asyncHandler(async (agent: AGENTS_LIST[keyof AGENTS_LIST], instructions: string) => {
  if (!(agent instanceof Agent)) {
    return `The provided agent is not valid.`;
  }

  if (!instructions) {
    return `Please provide the instructions for the agent: ${agent.name}`;
  }
  const { finalOutput } = await run(agent, instructions);

  if (!finalOutput) {
    return `The agent did not return any output. Please check the agent's implementation.`;
  }

  console.log(`Result of the agent: ${agent.name}\n with instructions: ${instructions}\n is: ${finalOutput}`);
  return finalOutput;
});
