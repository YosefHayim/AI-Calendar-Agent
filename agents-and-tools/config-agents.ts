import { CONFIG } from "../config";
import { setDefaultOpenAIKey } from "@openai/agents";

setDefaultOpenAIKey(CONFIG.open_ai_api_key!);
