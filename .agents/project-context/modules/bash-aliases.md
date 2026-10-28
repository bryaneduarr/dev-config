# Bash aliases and rule-audit
- Stamp: 2026-10-28 UTC, rev 2df21a9, many uncommitted changes (code in flux).
- [bash](../../../modules/bash/install.sh): symlinks aliases.sh to ~/.config/bash, appends a source line to ~/.bashrc once. Only alias: c.
- [rule-audit](../../../modules/rule-audit/rule-audit.ts): CLI auditing a TypeScript project, optional exceptions file; exit 1 findings, 2 usage.
- [rule-audit install](../../../modules/rule-audit/install.sh): copies to data dir, links bin.
