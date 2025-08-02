export function getEventDurationString(startISO: string, endISO: string) {
  if (!startISO || !endISO) return null;

  const start = new Date(startISO);
  const end = new Date(endISO);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return null;

  const diffMs = end.getTime() - start.getTime();
  const diffSec = diffMs / 1000;

  if (diffSec < 60) {
    return `${Math.round(diffSec)}s`;
  }

  const diffMin = diffSec / 60;
  if (diffMin < 60) {
    return `${Math.round(diffMin)}m`;
  }

  const diffHrs = diffMin / 60;
  return `${diffHrs.toFixed(1)}h`;
}
