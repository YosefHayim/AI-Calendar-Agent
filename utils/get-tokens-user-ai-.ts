import { execSync } from 'child_process';
import path from 'path';
import { CURRENT_MODEL } from '@/types';

const pythonScript = path.resolve(__dirname, '..', 'utils', 'tokeniser.py');

export const getTokensOfUserAndAI = (messages: any[]) => {
  const payload = JSON.stringify({
    messages,
    role: 'user',
    model: CURRENT_MODEL,
  });
  const userTokens = JSON.parse(
    execSync(`python ${pythonScript}`, { input: payload }).toString().trim()
  ).tokens;

  const payloadAI = JSON.stringify({
    messages,
    role: 'assistant',
    model: CURRENT_MODEL,
  });
  const aiTokens = JSON.parse(
    execSync(`python ${pythonScript}`, { input: payloadAI }).toString().trim()
  ).tokens;
  console.log(`User tokens: ${userTokens}, AI tokens: ${aiTokens}`);
  return { userTokens, aiTokens };
};
