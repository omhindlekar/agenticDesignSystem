import { ContextPackSchema } from './context-pack.js';
import { ScreenSpecSchema } from './screen-spec.js';
import { QAReportSchema } from './qa-report.js';
import { DesignDossierSchema } from './design-dossier.js';

/**
 * Validators for each handoff named in config/pipeline.json (`output`). A new handoff type
 * is a schema plus an entry here; the orchestrator code does not change (NFR-10).
 */
export const HANDOFF_VALIDATORS: Record<string, (value: unknown) => unknown> = {
  'context-pack': (v) => ContextPackSchema.parse(v),
  'design-dossier': (v) => DesignDossierSchema.parse(v),
  'screen-spec': (v) => ScreenSpecSchema.parse(v),
  tsx: (v) => {
    if (typeof v !== 'string') throw new Error(`Builder must return a string, got ${typeof v}`);
    if (!v.trim()) throw new Error('Builder returned an empty string');
    return v;
  },
  'qa-report': (v) => QAReportSchema.parse(v),
};
