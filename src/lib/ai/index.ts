import "server-only";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { getEnv } from "@/env";

export const openrouter = createOpenRouter({
  apiKey: getEnv().OPENROUTER_API_KEY,
});
