/** Web tools a research call may use (FR-24). Nothing else can be granted. */
export type WebTool = 'WebSearch' | 'WebFetch';
export const WEB_TOOLS: readonly WebTool[] = ['WebSearch', 'WebFetch'];

export interface CompleteOptions {
  model: string;
  maxTokens: number;
  /** Web tools for a research call; omitted for every other call. */
  tools?: WebTool[];
  /** Overrides the provider's default timeout (research runs for minutes). */
  timeoutMs?: number;
}

/** One search or fetch the model made. Fetched text is never kept here. */
export interface ToolEvent {
  tool: WebTool;
  /** The search query or the fetched URL. */
  input: string;
  /** For a fetch: whether the page was actually read. */
  ok: boolean;
  /** HTTP status when the fetch reported one (for example 403). */
  status?: number;
}

export interface CompleteResult {
  text: string;
  costUsd: number;
  /** Searches and fetches, for research calls; cached and replayed. */
  toolLog?: ToolEvent[];
  usage?: { inputTokens: number; outputTokens: number; apiEquivalentUsd?: number };
  /**
   * Text of successfully fetched pages, by URL, for the copy guard. In memory only:
   * caches and fixtures never store it (FR-24).
   */
  fetched?: Record<string, string>;
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
