/** Result of resolving the directory a worker runs in. */
export type TaskCwd =
  | { readonly state: "valid"; readonly path: string }
  | { readonly state: "invalid"; readonly message: string };
