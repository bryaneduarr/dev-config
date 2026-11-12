import { DURATION_MILLISECOND_DIGITS, DURATION_PART_WIDTH } from "../../constants/time/duration-format.constant.ts";
import {
  MILLISECONDS_PER_MINUTE,
  MILLISECONDS_PER_SECOND,
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
} from "../../constants/time/time-unit.constant.ts";

function padPart(part: number): string {
  return String(part).padStart(DURATION_PART_WIDTH, "0");
}

export function formatDuration(ms: number): string {
  const wholeMilliseconds = Math.max(0, Math.floor(ms));
  if (wholeMilliseconds < MILLISECONDS_PER_MINUTE) {
    return `${(wholeMilliseconds / MILLISECONDS_PER_SECOND).toFixed(DURATION_MILLISECOND_DIGITS)}s`;
  }

  const wholeSeconds = Math.floor(wholeMilliseconds / MILLISECONDS_PER_SECOND);
  const hours = Math.floor(wholeSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((wholeSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const remainingSeconds = padPart(wholeSeconds % SECONDS_PER_MINUTE);
  if (hours === 0) return `${minutes}m ${remainingSeconds}s`;
  return `${hours}h ${padPart(minutes)}m ${remainingSeconds}s`;
}
