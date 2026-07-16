export const AI_MODELS = {
  free: {
    gemma: {
      id: "google/gemma-4-31b-it",
      name: "Gemma 4 31B",
      provider: "Google",
      strengths: "Razonamiento lógico, código, matemáticas, academico",
      contextWindow: 32000,
    },
    gpt4oMini: {
      id: "openai/gpt-4o-mini",
      name: "GPT-4o Mini",
      provider: "OpenAI",
      strengths: "Generalista, buena comprensión",
      contextWindow: 32000,
    },
    qwen: {
      id: "qwen/qwen3.7-plus",
      name: "Qwen 3.7 Plus",
      provider: "Qwen",
      strengths: "Razonamiento complejo, multilingual",
      contextWindow: 1000000,
    },
    minimax: {
      id: "minimax/minimax-m3",
      name: "Minimax M3",
      provider: "NovitaAI",
      strengths: "Razonamiento largo, academico, finanzas, salud, marketing",
      contextWindow: 1000000,
    },
    deepseek: {
      id: "deepseek/deepseek-v4-pro",
      name: "DeepSeek V4 Pro",
      provider: "DeepSeek",
      strengths: "Razonamiento largo, academico, finanzas, salud, marketing",
      contextWindow: 1005000,
    },
    mimov2: {
      id: "xiaomi/mimo-v2.5-pro",
      name: "Mimo V2.5 Pro",
      provider: "Xiaomi",
      strengths: "Razonamiento largo, academico, finanzas, salud, marketing",
      contextWindow: 1005000,
    },
  },
  paid: {
    claude: {
      id: "anthropic/claude-3.5-sonnet",
      name: "Claude 3.5 Sonnet",
      provider: "Anthropic",
      strengths: "Razonamiento complejo, pedagogía, escritura",
      contextWindow: 200000,
    },
    gpt4o: {
      id: "openai/gpt-4o",
      name: "GPT-4o",
      provider: "OpenAI",
      strengths: "Multimodal, velocidad, creatividad",
      contextWindow: 128000,
    },
  },
} as const;

export type FreeModelId = keyof typeof AI_MODELS.free;
export type PaidModelId = keyof typeof AI_MODELS.paid;
export type ModelId = FreeModelId | PaidModelId;

export const MODEL_PURPOSE = {
  interview: "gemma",
  generation: "gemma",
  expansion: "gemma",
  research: "deepseek",
} as const;

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  strengths: string;
  contextWindow: number;
}

export function getModelForPurpose(purpose: keyof typeof MODEL_PURPOSE): AIModel {
  const modelKey = MODEL_PURPOSE[purpose];
  const model = (AI_MODELS.free as Record<string, AIModel>)[modelKey] || (AI_MODELS.paid as Record<string, AIModel>)[modelKey];
  return model;
}
