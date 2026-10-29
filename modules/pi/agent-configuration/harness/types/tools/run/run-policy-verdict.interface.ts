/** Decision of the run policy for one shell command. */
export type RunPolicyVerdict =
  | {
      /** The command may run. */
      readonly verdict: "allowed";
    }
  | {
      /** The command runs, and a dedicated tool would do the same job in fewer turns. */
      readonly verdict: "advised";
      /** Advice, appended to the command output, that names the tool to use next time and how to call it. */
      readonly message: string;
    }
  | {
      /** The command is refused because running it only wastes time. */
      readonly verdict: "redirected";
      /** Message that says what to do instead. */
      readonly message: string;
    };
