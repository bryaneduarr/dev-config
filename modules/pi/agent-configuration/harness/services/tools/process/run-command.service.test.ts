import { expect, test } from "bun:test";
import { runCommand } from "./run-command.service.ts";

const request = {
  cwd: "/tmp",
  timeoutMs: 10_000,
  cancellation: { kind: "uncancellable" },
} as const;

test("shell lines run in bash, so bash-only syntax works without a bash -c wrapper", async () => {
  const result = await runCommand({
    ...request,
    command: { form: "shell", shellLine: 'set -o pipefail; [[ "a" == "a" ]] && echo ok; cat <<< "here-string"' },
  });
  expect(result.code).toBe(0);
  expect(result.stdout).toBe("ok\nhere-string\n");
});

test("shell lines keep backticks and heredocs intact", async () => {
  const result = await runCommand({
    ...request,
    command: { form: "shell", shellLine: "cat <<'EOF'\nsay `date`; $HOME\nEOF" },
  });
  expect(result.stdout).toBe("say `date`; $HOME\n");
});

test("argv commands still run without a shell", async () => {
  const result = await runCommand({ ...request, command: { form: "argv", argv: ["echo", "$HOME"] } });
  expect(result.stdout).toBe("$HOME\n");
});
