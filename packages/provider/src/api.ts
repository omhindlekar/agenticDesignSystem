import Anthropic from '@anthropic-ai/sdk';
import type { ModelProvider, CompleteOptions, CompleteResult, Pricing } from './types.js';

const FALLBACK_PRICING: Pricing = {
  inputPerMTokenUsd: 3.0,
  outputPerMTokenUsd: 15.0,
};

export class ApiProvider implements ModelProvider {
  private readonly client: Anthropic;
  private readonly pricingTable: Record<string, Pricing>;

  constructor(pricingTable?: Record<string, Pricing>) {
    this.client = new Anthropic();
    this.pricingTable = pricingTable ?? {};
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

    const pricing = this.pricingTable[opts.model] ?? FALLBACK_PRICING;
    const inputTokens = message.usage?.input_tokens ?? 0;
    const outputTokens = message.usage?.output_tokens ?? 0;
    const costUsd =
      (inputTokens / 1_000_000) * pricing.inputPerMTokenUsd + (outputTokens / 1_000_000) * pricing.outputPerMTokenUsd;

    return { text: textBlock.text, costUsd };
  }
}
