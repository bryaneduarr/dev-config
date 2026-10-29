import { isAbsolute, relative } from "node:path";

export function toRelativePath(cwd: string, file: string): string {
  if (!isAbsolute(file)) return file;
  const relativePath = relative(cwd, file);
  return relativePath.startsWith("..") ? file : relativePath;
}
