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

export interface ProviderConfig {
  provider?: string;
  model: string;
  cache?: { enabled: boolean };
}
