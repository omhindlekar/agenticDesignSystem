import { z } from 'zod';
import { ScreenSpecSchema } from '../../packages/schemas/src/screen-spec.js';

/** What the QA agent checks: the Builder's TSX and the spec it was built from. */
export const QAInputSchema = z.object({
  taskId: z.string().min(1),
  runId: z.string().min(1),
  spec: ScreenSpecSchema,
  tsx: z.string().min(1),
  /** Golden-set id, for the visual baseline. */
  baselineId: z.string().optional(),
});

export type QAInput = z.infer<typeof QAInputSchema>;
export { QAReportSchema as QAOutputSchema } from '../../packages/schemas/src/qa-report.js';
