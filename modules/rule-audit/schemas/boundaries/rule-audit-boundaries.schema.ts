import { z } from "zod";
import { AUDIT_RULES } from "../../constants/audit/audit-rules.constant.ts";

export const auditRuleSchema = z.enum(AUDIT_RULES);

export const ruleAuditBoundarySchema = z.strictObject({
  /** File path relative to the audited project directory. */
  file: z.string().min(1),
  /** Rule this file is allowed to break. */
  rule: auditRuleSchema,
  /** Why the file must break the rule, such as converting a library value once. */
  reason: z.string().min(1),
});

const exceptionsTableCellsSchema = z
  .tuple([z.string(), z.string(), z.string()])
  .transform(([file, rule, reason]) => ({ file, rule, reason }));

export const ruleAuditBoundariesSchema = z.strictObject({
  /** Files allowed to break one rule each, read from the cells of the exceptions table rows. */
  boundaries: z.array(exceptionsTableCellsSchema.pipe(ruleAuditBoundarySchema)),
});
