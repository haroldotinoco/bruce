import Anthropic from '@anthropic-ai/sdk';
import type { ChatRequest, ChatResponse } from '../types.js';

function toAnthropicMessages(messages: ChatRequest['messages']): Anthropic.MessageParam[] {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
}

export class AnthropicProvider {
  private client: Anthropic;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY || '';
    if (!key) {
      throw new Error('ANTHROPIC_API_KEY not set');
    }
    this.client = new Anthropic({ apiKey: key });
  }

  async chat(options: ChatRequest): Promise<ChatResponse> {
    const system = options.messages.find((m) => m.role === 'system')?.content ?? '';
    const messages = toAnthropicMessages(options.messages);

    const msg = await this.client.messages.create({
      model: options.model,
      max_tokens: options.maxTokens ?? 2048,
      temperature: options.temperature ?? 0.7,
      ...(system ? { system } : {}),
      messages,
    });

    const text = msg.content.find((b) => b.type === 'text');
    const content = text && text.type === 'text' ? text.text : '';

    const out: ChatResponse = {
      choices: [{ message: { role: 'assistant', content } }],
    };
    return out;
  }
}
