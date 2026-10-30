import type { TaskResult } from "../../../types/subagents/result/task-result.interface.ts";

export function formatTaskResult(taskResult: TaskResult): string {
  const optionalSections = {
    findings: taskResult.findings,
    unresolved_questions: taskResult.unresolvedQuestions,
    checks: taskResult.checks,
    files_changed: taskResult.filesChanged,
    risks: taskResult.risks,
    errors: taskResult.errors,
  };
  const filledSections = Object.entries(optionalSections).filter(([, items]) => items.length > 0);

  const branchSection = taskResult.branch.state === "present" ? { branch: taskResult.branch.value } : {};

  return JSON.stringify({
    id: taskResult.id,
    title: taskResult.title,
    status: taskResult.status,
    summary: taskResult.summary,
    ...branchSection,
    ...Object.fromEntries(filledSections),
  });
}
