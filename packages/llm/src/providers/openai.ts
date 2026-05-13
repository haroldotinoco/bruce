import type { z } from 'zod';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import type { ChatRequest, ChatResponse } from '../types.js';

export type ParseWithZodRequest = {
  model: string;
  messages: ChatRequest['messages'];
  temperature: number;
  maxTokens: number;
  topP: number;
  zod: z.ZodTypeAny;
  schemaName: string;
};

export class OpenAIProvider {
  private client: OpenAI;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY || '';
    if (!key) {
      throw new Error('OPENAI_API_KEY not set');
    }
    this.client = new OpenAI({ apiKey: key });
  }

  /**
   * Uses `beta.chat.completions.parse` with `zodResponseFormat` so the assistant message
   * includes `parsed` when the model and schema are supported.
   */
  async parseWithZod(options: ParseWithZodRequest): Promise<ChatResponse> {
    const res = await this.client.beta.chat.completions.parse({
      model: options.model,
      messages: options.messages as OpenAI.ChatCompletionMessageParam[],
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      top_p: options.topP,
      response_format: zodResponseFormat(options.zod, options.schemaName),
    });
    const choice0 = res.choices[0];
    const msg = choice0?.message;
    if (!msg) {
      return { choices: [], usage: res.usage as ChatResponse['usage'] };
    }
    const parsed = 'parsed' in msg && msg.parsed != null ? msg.parsed : undefined;
    return {
      choices: [
        {
          message: {
            role: msg.role,
            content: msg.content,
            parsed,
          },
        },
      ],
      usage: res.usage as ChatResponse['usage'],
    };
  }

  async chat(options: ChatRequest): Promise<ChatResponse> {
    const res = await this.client.chat.completions.create({
      model: options.model,
      messages: options.messages as OpenAI.ChatCompletionMessageParam[],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
      top_p: options.topP ?? 1,
      response_format: options.responseFormat as OpenAI.ChatCompletionCreateParams['response_format'],
      tools: options.tools as OpenAI.ChatCompletionCreateParams['tools'],
    });

    return res as unknown as ChatResponse;
  }
}
