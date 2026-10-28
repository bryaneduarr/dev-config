# Questions template

`questions.md` sits beside `plan.md`. The verify job in the final test stage answers each question `yes` or `no` with evidence: a command and its result, or `path:line`. Not run counts as `no` unless Allowed skips lists it. Drop questions that do not apply.

```markdown
# <feature> questions

1. Does `git diff main...` cover every plan step and nothing else?
2. "<exact Done when line>": which test or check proves it, and did it pass there?
3. <Repeat question 2 for each Done when line.>
4. Which test covers each new behavior, and does it assert the parsed contract?
5. Do the checks in `testing.md` pass for every affected module?
6. Did every review slice report clean, and does every PR comment have a fix commit or a reason it needs none?
7. Is the PR open against `main` with commit-changes commits, labels, and the author assigned?
8. Did nothing run `install.sh` or `bootstrap.sh`, and does the worktree hold only the planned changes?

Allowed skips: running `install.sh` and `bootstrap.sh`.
```
