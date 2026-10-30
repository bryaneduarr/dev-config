export const WORKTREE_PARENT_DIRECTORY_NAME = "pi-subagent-worktrees";
export const WORKTREE_BRANCH_PREFIX = "subagent/";
export const WORKTREE_BRANCH_ID_LENGTH = 8;
export const GIT_PROGRAM = "git";
export const WORKTREE_GIT_TIMEOUT_MS = 60_000;
export const GIT_METADATA_ENTRY = ".git";
export const WORKTREE_COMMIT_IDENTITY_ARGS = [
  "-c",
  "user.name=Pi subagent",
  "-c",
  "user.email=pi-subagent@example.invalid",
  "-c",
  "commit.gpgsign=false",
] as const;
export const WORKTREE_COMMIT_MESSAGE_PREFIX = "subagent: ";
export const WORKTREE_ISOLATION_NOTE = [
  "You work in your own git checkout of the current commit, on a private branch.",
  "Your changes are committed to that branch for you when you finish, so do not run git commit, merge, or checkout.",
  "Dependencies are not installed in this checkout, so checks that need them run after the merge.",
].join(" ");
