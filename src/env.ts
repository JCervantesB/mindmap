import { z } from "zod";

export const envSchema = z.object({
  // OpenRouter (AI)
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_BASE_URL: z
    .string()
    .default("https://openrouter.ai/api/v1"),

  // Exa (Research)
  EXA_API_KEY: z.string().optional(),
  EXA_BASE_URL: z.string().default("https://api.exa.ai"),

  // AI Models (Free tier - OpenRouter)
  DEFAULT_MODEL: z
    .string()
    .default("google/gemma-4-31b-it:free"),
  MODEL_GENERATION: z
    .string()
    .default("google/gemma-4-31b-it:free"),
  MODEL_INTERVIEW: z.string().default("google/gemma-4-31b-it:free"),
  MODEL_EXPANSION: z
    .string()
    .default("google/gemma-4-31b-it:free"),
  MODEL_RESEARCH: z.string().default("google/gemma-4-31b-it:free"),

  // Exa Limits
  MAX_RESULTS_PER_SEARCH: z.coerce.number().default(10),
  MAX_TOKENS_PER_RESULT: z.coerce.number().default(500),
  SEARCH_TIMEOUT_MS: z.coerce.number().default(15000),

  // App
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

let env: Env | null = null;

export function getEnv(): Env {
  if (env) return env;

  try {
    env = envSchema.parse({
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL,
      EXA_API_KEY: process.env.EXA_API_KEY,
      EXA_BASE_URL: process.env.EXA_BASE_URL,
      DEFAULT_MODEL: process.env.DEFAULT_MODEL,
      MODEL_GENERATION: process.env.MODEL_GENERATION,
      MODEL_INTERVIEW: process.env.MODEL_INTERVIEW,
      MODEL_EXPANSION: process.env.MODEL_EXPANSION,
      MODEL_RESEARCH: process.env.MODEL_RESEARCH,
      MAX_RESULTS_PER_SEARCH: process.env.MAX_RESULTS_PER_SEARCH,
      MAX_TOKENS_PER_RESULT: process.env.MAX_TOKENS_PER_RESULT,
      SEARCH_TIMEOUT_MS: process.env.SEARCH_TIMEOUT_MS,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    });
  } catch (error) {
    console.error("Invalid environment variables:", error);
    throw new Error("Invalid environment variables");
  }

  return env;
}
