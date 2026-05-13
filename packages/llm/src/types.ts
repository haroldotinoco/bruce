import type OpenAI from 'openai';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
};

/** Same union as `ChatCompletionCreateParams['response_format']` (json_object | json_schema | text, ...). */
export type ResponseFormat = NonNullable<OpenAI.ChatCompletionCreateParams['response_format']>;

export type ChatRequest = {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  responseFormat?: ResponseFormat;
  tools?: Array<{ type: string; function: Record<string, unknown> }>;
};

/** OpenRouter-compatible usage block (also used for normalized other providers). */
export type ChatUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  cost?: number;
  prompt_tokens_details?: { cached_tokens?: number; [key: string]: unknown };
  completion_tokens_details?: { reasoning_tokens?: number; [key: string]: unknown };
  cost_details?: Record<string, unknown>;
  [key: string]: unknown;
};

export type ChatResponse = {
  choices: Array<{
    message?: {
      role?: string;
      content?: string | null;
      /** Set when using OpenAI `beta.chat.completions.parse` + `zodResponseFormat`. */
      parsed?: unknown;
      tool_calls?: Array<{
        id?: string;
        type?: string;
        function?: { name?: string; arguments?: string };
      }>;
    };
  }>;
  usage?: ChatUsage;
};
