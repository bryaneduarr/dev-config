# Testing <feature>

The verify job runs these in order, first in the test stage after the tests are written, then again in the final test stage on the committed tree. Every command runs directly in the delivery's worktree on this machine (Ubuntu 26.04 x86_64 under WSL2). Never run `install.sh` or `bootstrap.sh`. Run long commands detached with output in a log file and poll it. A failing command does not stop the next one unless the next one lists it under Needs. A missing check tool makes its row blocked; do not install it.

| Order | Check | Command | Needs |
| --- | --- | --- | --- |
| 1 | Shell syntax | `bash -n <changed .sh files>` | |
| 2 | Shell lint | `shellcheck <changed .sh files>` and `shfmt -d <changed .sh files>` | |
| 3 | TypeScript | `npm run --prefix modules/<module> check`, once per affected module | |
| 4 | Lua | `lua-language-server --check modules/neovim/config --configpath modules/neovim/config/.luarc.json` and `stylua --check modules/neovim/config` | |

Drop rows for languages the delivery does not touch.

## Allowed skips

- Running `install.sh` and `bootstrap.sh`: they change the machine and need an explicit request.
