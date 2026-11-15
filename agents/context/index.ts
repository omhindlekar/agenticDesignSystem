import { ContextInputSchema } from './schema.js';
import { selectContext } from './tools.js';
import type { DataStore } from './tools.js';
import type { ContextPack } from '../../packages/schemas/src/context-pack.js';

export function runContextAgent(rawInput: unknown, store: DataStore): ContextPack {
  const input = ContextInputSchema.parse(rawInput);
  return selectContext(input, store);
}

export { loadDataStore, detectInstructions } from './tools.js';
export type { DataStore } from './tools.js';
