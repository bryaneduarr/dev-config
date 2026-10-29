import type { ReadRequest } from "../../../types/tools/read/read-request.interface.ts";
import { stripAtPrefix } from "../path/strip-at-prefix.service.ts";
import { joinReadSections } from "./join-read-sections.service.ts";
import { readSource } from "./read-source.service.ts";

const NO_FILE_MESSAGE = "read needs a path, or files with at least one path.";

export async function readFiles(requests: readonly ReadRequest[]): Promise<string> {
  const [only] = requests;
  if (only === undefined) return NO_FILE_MESSAGE;
  if (requests.length === 1) return readSource(only);

  const sections = await Promise.all(requests.map((request) => readSource(request)));
  return joinReadSections(
    requests.map((request) => stripAtPrefix(request.path)),
    sections,
  );
}
