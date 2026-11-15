/**
 * The contract every QA check implements. A check is a module listed in
 * checks/registry.json whose default export is a QaCheck; the QA agent runs every
 * registered check, so adding one needs no agent or orchestrator code (NFR-10).
 */
import type { QAFinding } from '../packages/schemas/src/qa-report.js';
import type { ScreenSpec } from '../packages/schemas/src/screen-spec.js';
import type { RenderedScreen } from './render/render.js';

export interface QaCheckContext {
  taskId: string;
  runId: string;
  spec: ScreenSpec;
  tsx: string;
  repoRoot: string;
  /** Golden-set id whose approved baseline the visual check compares against. */
  baselineId?: string | undefined;
  /** Where a check may write evidence files (runs/<runId>/qa/). Undefined: write none. */
  evidenceDir?: string | undefined;
  /** The rendered screen, shared by every check that needs it. */
  render: () => Promise<RenderedScreen>;
}

export interface QaCheckOutcome {
  status: 'pass' | 'fail' | 'skipped';
  /** One line summarising the result. */
  reason?: string;
  findings: Array<Omit<QAFinding, 'checkName'>>;
  evidence?: string[];
}

export interface QaCheck {
  name: string;
  run: (ctx: QaCheckContext) => Promise<QaCheckOutcome>;
}
