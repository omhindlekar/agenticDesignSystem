export interface CompleteOptions {
  model: string;
  maxTokens: number;
}

export interface CompleteResult {
  text: string;
  costUsd: number;
}

export interface ModelProvider {
  complete(prompt: string, options: CompleteOptions): Promise<CompleteResult>;
}

export interface Pricing {
  inputPerMTokenUsd: number;
  outputPerMTokenUsd: number;
}

export interface ProviderConfig {
  provider?: string;
  model: string;
  cache?: { enabled: boolean };
  maxCallsPerRun?: number;
  /** Pricing per model name. Key is the model ID; value is per-million-token USD cost. */
  pricing?: Record<string, Pricing>;
}
