import type { Static } from "typebox";
import type { ReadFileEntrySchema } from "../../../schemas/tools/read/read-file-entry.schema.ts";

/** One file of a read call as sent by the model; optional fields get defaults at the boundary. */
export type ReadEntry = Static<typeof ReadFileEntrySchema>;
