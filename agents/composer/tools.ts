import { ScreenSpecSchema } from '../../packages/schemas/src/screen-spec.js';
import type { ScreenSpec } from '../../packages/schemas/src/screen-spec.js';
import type { ComposerInput } from './schema.js';

export function buildComposerPrompt(input: ComposerInput): string {
  const componentList = input.contextPack.componentIds.map((c) => `- ${c.id}`).join('\n');
  const tokenList = input.contextPack.tokenIds.map((t) => `- ${t.id}`).join('\n');
  const ruleList = input.contextPack.ruleIds.map((r) => `- ${r.id}`).join('\n') || '(none)';

  return `You are a UI composer for a design system. Given a brief, produce a JSON screen specification.

BRIEF:
${input.brief}

REGISTERED COMPONENTS (use only these component IDs in the tree):
${componentList}

APPROVED TOKENS (reference only these token IDs in tokenRefs):
${tokenList}

ACTIVE RULES:
${ruleList}

OUTPUT REQUIREMENTS:
- Return valid JSON only. No prose before or after. You may wrap it in a \`\`\`json code fence.
- The JSON must match this exact shape:
  {
    "taskId": "${input.taskId}",
    "tree": {
      "component": "<componentId>",
      "props": { ... },
      "tokenRefs": ["<tokenId>", ...],
      "states": ["<stateName>", ...],
      "children": [ ...optional nested nodes... ]
    },
    "statesCovered": ["<stateName>", ...]
  }
- Use ONLY component IDs from the registered list above. Never invent new component names.
- Do NOT hardcode hex colours, rgb(), rgba(), literal px spacing, or any design values.
  Reference token IDs in tokenRefs; do not embed raw values.
- Every node must have at minimum component, props (may be {}), tokenRefs (may be []), and states.`;
}

export function parseComposerResponse(taskId: string, raw: string): ScreenSpec {
  // Strip optional markdown code fence
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    throw new Error(`Composer returned non-JSON: ${stripped.slice(0, 200)}`);
  }

  // Inject taskId if the model omitted it or got it wrong
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    (parsed as Record<string, unknown>)['taskId'] = taskId;
  }

  return ScreenSpecSchema.parse(parsed);
}
