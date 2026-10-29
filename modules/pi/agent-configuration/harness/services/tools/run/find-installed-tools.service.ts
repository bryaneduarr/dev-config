import { accessSync, constants } from "node:fs";
import { delimiter, join } from "node:path";

function isExecutable(path: string): boolean {
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

export function findInstalledTools(names: readonly string[], pathValue: string): readonly string[] {
  const directories = pathValue.split(delimiter).filter((directory) => directory !== "");
  return names.filter((name) => directories.some((directory) => isExecutable(join(directory, name))));
}
