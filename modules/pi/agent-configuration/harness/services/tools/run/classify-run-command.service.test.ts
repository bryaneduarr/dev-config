import { expect, test } from "bun:test";
import { classifyRunCommand } from "./classify-run-command.service.ts";

function verdictOf(command: string): string {
  return classifyRunCommand(command).verdict;
}

test("advises on reading files with cat, head, tail, and sed -n", () => {
  expect(verdictOf("cat src/a.ts")).toBe("advised");
  expect(verdictOf("head -n 20 src/a.ts")).toBe("advised");
  expect(verdictOf("tail -30 build.log")).toBe("advised");
  expect(verdictOf("sed -n '10,40p' src/a.ts")).toBe("advised");
  expect(verdictOf("git status && cat package.json")).toBe("advised");
  expect(verdictOf("FOO=1 cat package.json")).toBe("advised");
});

test("advises on grep and find over files, even inside a bash -c wrapper", () => {
  expect(verdictOf("grep -n needle src/a.ts")).toBe("advised");
  expect(verdictOf("grep -rn needle src")).toBe("advised");
  expect(verdictOf("find . -name '*.ts' -type f")).toBe("advised");
  expect(verdictOf("bash -c 'cd app; grep -n x file.ts'")).toBe("advised");
  expect(verdictOf('bash -lc "ls && find . -name x"')).toBe("advised");
});

test("lets filters, writes, follows, and real tools through", () => {
  expect(verdictOf("git log --oneline | head -20")).toBe("allowed");
  expect(verdictOf("docker logs app 2>&1 | grep error")).toBe("allowed");
  expect(verdictOf("bun test | tail -15")).toBe("allowed");
  expect(verdictOf("tail -f server.log")).toBe("allowed");
  expect(verdictOf("cat > notes.md <<'EOF'\nhello; world\nEOF")).toBe("allowed");
  expect(verdictOf("rg -n needle src && fd -e ts name")).toBe("allowed");
  expect(verdictOf("find . -name '*.tmp' -delete")).toBe("allowed");
  expect(verdictOf("sed -i 's/a/b/' src/a.ts")).toBe("allowed");
  expect(verdictOf("git commit -m 'cat the grep; find sleep 60'")).toBe("allowed");
  expect(verdictOf("ls -la src")).toBe("allowed");
});

test("shell setup such as set -e or export does not make an exploration command count as work", () => {
  expect(verdictOf("set -e; find . -type f | sort; cat rules/*.md")).toBe("advised");
  expect(verdictOf("export LC_ALL=C; grep -rn needle src")).toBe("advised");
  expect(verdictOf("set -e; bun test; cat out.log")).toBe("allowed");
});

test("redirections such as 2>&1 do not split a command", () => {
  expect(verdictOf("ls -la src 2>&1; find . -name x 2>/dev/null | head -5")).toBe("advised");
  expect(verdictOf("docker logs app 2>&1 && cat notes.md")).toBe("allowed");
  expect(verdictOf("bun test &> out.log; cat out.log")).toBe("allowed");
});

test("blocks long sleeps but allows short waits", () => {
  expect(verdictOf("sleep 60; rg -c ok run.log")).toBe("redirected");
  expect(verdictOf("sleep 2m")).toBe("redirected");
  expect(verdictOf("sleep 2 && curl -s localhost:3000")).toBe("allowed");
});

test("the advice names the replacement tool", () => {
  const verdict = classifyRunCommand("cat a.ts");
  expect(verdict.verdict === "advised" && verdict.message.includes("read")).toBe(true);
});
