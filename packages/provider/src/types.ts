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
  pricing?: Pricing;
}
