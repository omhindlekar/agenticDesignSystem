import Anthropic from '@anthropic-ai/sdk';
import type { ModelProvider, CompleteOptions, CompleteResult } from './types.js';

// Published token prices (USD per million tokens) as of model claude-sonnet-4-6.
// Update here when Anthropic changes pricing — no other file needs to change.
const PRICE_PER_M_INPUT = 3.0;
const PRICE_PER_M_OUTPUT = 15.0;

export class ApiProvider implements ModelProvider {
  private readonly client: Anthropic;

  constructor() {
    this.client = new Anthropic();
  }

  async complete(prompt: string, opts: CompleteOptions): Promise<CompleteResult> {
    const message = await this.client.messages.create({
      model: opts.model,
      max_tokens: opts.maxTokens,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('ApiProvider: model returned no text content');
    }

    const inputTokens = message.usage?.input_tokens ?? 0;
    const outputTokens = message.usage?.output_tokens ?? 0;
    const costUsd =
      (inputTokens / 1_000_000) * PRICE_PER_M_INPUT +
      (outputTokens / 1_000_000) * PRICE_PER_M_OUTPUT;

    return { text: textBlock.text, costUsd };
  }
}
