/**
 * Token data for the Foundations pages. Values are read from tokens/*.json at build
 * time, so the pages never contain a colour or size literal of their own.
 */
import primitivesFile from '../../tokens/primitives.json';
import semanticFile from '../../tokens/semantic.json';

export interface RawToken {
  name: string;
  tier: string;
  value?: string;
  reference?: string;
  description: string;
  deprecated?: boolean;
}

export const primitives = (primitivesFile as { tokens: RawToken[] }).tokens;
export const semantic = (semanticFile as { tokens: RawToken[] }).tokens;

const primitiveValue = new Map(primitives.map((t) => [t.name, t.value ?? '']));

/** Semantic token name → resolved value. */
export const resolved = new Map(semantic.map((t) => [t.name, primitiveValue.get(t.reference ?? '') ?? '']));

export const RAMPS = ['blue', 'light-blue', 'lime', 'neutral', 'red', 'amber'] as const;
export const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

export function primitive(name: string): string {
  return primitiveValue.get(name) ?? '';
}

export const TYPE_ROLES = [
  'display',
  'h1',
  'h2',
  'h3',
  'h4',
  'subtitle',
  'body1',
  'body2',
  'button',
  'label',
  'caption',
  'overline',
] as const;
