const MS_IN_SEC = 1000;
const SECS_IN_MIN = 60;

export function getEventDurationString(startISO?: string | null, endISO?: string | null): string | null {
  if (!(startISO && endISO)) {
    return null;
  }

  const start = new Date(startISO);
  const end = new Date(endISO);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return null;
  }

  const diffMs = end.getTime() - start.getTime();

  // Round to nearest second
  const totalSeconds = Math.round(diffMs / MS_IN_SEC);

  // Sub-minute durations (<60s) → show seconds
  if (totalSeconds < SECS_IN_MIN) {
    return `${totalSeconds}s`;
  }

  // Round to nearest minute
  const totalMinutes = Math.round(totalSeconds / SECS_IN_MIN);

  if (totalMinutes < SECS_IN_MIN) {
    return `${totalMinutes}m`;
  }
  const hours = Math.floor(totalMinutes / SECS_IN_MIN);
  const minutes = totalMinutes % SECS_IN_MIN;

  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}
