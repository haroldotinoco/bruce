import type { ChatRequest, ChatResponse } from '../types.js';
import { AnthropicProvider } from './anthropic.js';
import { OpenAIProvider, type ParseWithZodRequest } from './openai.js';
import { OpenRouterProvider } from './openrouter.js';

export type ChatProvider = {
  chat(options: ChatRequest): Promise<ChatResponse>;
  /** OpenAI only: `beta.chat.completions.parse` + `zodResponseFormat`. */
  parseWithZod?(options: ParseWithZodRequest): Promise<ChatResponse>;
};

export function getLLMProvider(provider: string): ChatProvider {
  switch (provider) {
    case 'openrouter':
      return new OpenRouterProvider();
    case 'anthropic':
      return new AnthropicProvider();
    case 'openai':
      return new OpenAIProvider();
    default:
      throw new Error(`Unknown LLM provider: ${provider}`);
  }
}

export { AnthropicProvider, OpenAIProvider, OpenRouterProvider, type ParseWithZodRequest };
