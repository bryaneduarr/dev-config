/** Operating system identity read from the os-release file. */
export interface HostRelease {
  /** Lowercase distribution id such as `ubuntu` or `nixos`. */
  readonly id: string;
  /** Human-readable distribution name and version. */
  readonly prettyName: string;
}
