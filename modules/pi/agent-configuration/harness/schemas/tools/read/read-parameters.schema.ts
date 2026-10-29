import { Type } from "typebox";
import { MAX_READ_FILES } from "../../../constants/tools/read/read-limits.constant.ts";
import { ReadFileEntrySchema } from "./read-file-entry.schema.ts";

export const ReadParamsSchema = Type.Object({
  /** File to read when only one is needed. */
  path: Type.Optional(Type.String({ description: "File to read. Use files to read several in one call." })),
  /** First line to read, one-based. */
  offset: Type.Optional(Type.Integer({ minimum: 1, description: "First line to read (1-based)." })),
  /** Maximum number of lines to return. */
  limit: Type.Optional(Type.Integer({ minimum: 1, description: "Maximum number of lines to return." })),
  /** Name of the symbol whose body is returned. */
  symbol: Type.Optional(Type.String({ description: "Return the body of a named symbol." })),
  /** Several files read in one call. */
  files: Type.Optional(
    Type.Array(Type.Union([Type.String(), ReadFileEntrySchema]), {
      minItems: 1,
      maxItems: MAX_READ_FILES,
      description: `Files to read in one call, up to ${MAX_READ_FILES}: each a path or {path, offset, limit, symbol}.`,
    }),
  ),
});
