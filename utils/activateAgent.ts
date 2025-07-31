import { Agent, run } from "@openai/agents";

import { AGENTS_LIST } from "../types";
import { asyncHandler } from "./async-handler";

export const activateAgent = asyncHandler(async (agent: AGENTS_LIST[keyof AGENTS_LIST], instructions: string) => {
  if (!(agent instanceof Agent)) {
    return `The provided agent is not valid.`;
  }

  if (!instructions) {
    return `Please provide the instructions for the agent: ${agent.name}`;
  }
  const result = await run(agent, instructions);
  console.log(`Result of the agent: ${agent.name} with instructions: ${instructions} is: ${result.finalOutput}`);
  return result.finalOutput;
});
