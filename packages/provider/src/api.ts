import Anthropic from '@anthropic-ai/sdk';
import type { ModelProvider, CompleteOptions, CompleteResult, Pricing } from './types.js';

const DEFAULT_PRICING: Pricing = {
  inputPerMTokenUsd: 3.0,
  outputPerMTokenUsd: 15.0,
};

export class ApiProvider implements ModelProvider {
  private readonly client: Anthropic;
  private readonly pricing: Pricing;

  constructor(pricing?: Pricing) {
    this.client = new Anthropic();
    this.pricing = pricing ?? DEFAULT_PRICING;
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
      (inputTokens / 1_000_000) * this.pricing.inputPerMTokenUsd +
      (outputTokens / 1_000_000) * this.pricing.outputPerMTokenUsd;

    return { text: textBlock.text, costUsd };
  }
}
