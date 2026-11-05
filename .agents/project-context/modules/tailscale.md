# tailscale
- Stamp: 2026-11-04 UTC, rev 188677f; modules/tailscale and install.sh change uncommitted.
- [installer](../../../modules/tailscale/install.sh): always writes the official apt keyring and list, installs tailscale if missing, enables tailscaled, `tailscale set --ssh --operator=$USER` (or `up` when logged out).
- User decided: this module is the official Tailscale install; passwordless SSH from tailnet machines. Upgrades come through apt (update-packages).
- Checked: user ran it; RunSSH true, operator set. Upstream keyring and list byte-identical to installed files. check-code passed.
- Manual: tailnet SSH ACL "accept"; Windows `.wslconfig` idle timeouts and logon task keep WSL running.
- T3 Code 0.1.7 (checked 2026-11-04): the Windows desktop app finds the "Tailscale HTTPS" toggle with Windows `tailscale.exe status --json`, not WSL's tailscale. With Tailscale only in WSL the toggle stays hidden. Workaround in WSL: `t3 pair --tailscale` or `tailscale serve --bg --https=443 http://127.0.0.1:3773`.
