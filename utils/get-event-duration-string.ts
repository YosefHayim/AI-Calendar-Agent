const SECOND = 1000;
const SIXTY_SECONDS = 60;

export function getEventDurationString(startISO: string, endISO: string) {
  if (!(startISO && endISO)) {
    return null;
  }

  const start = new Date(startISO);
  const end = new Date(endISO);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return null;
  }

  const diffMs = end.getTime() - start.getTime();

  const totalSeconds = Math.round(diffMs / SECOND);
  if (totalSeconds < SIXTY_SECONDS) {
    return `${totalSeconds}s`;
  }

  const totalSIXTY_SECONDSs = Math.floor(totalSeconds / SIXTY_SECONDS);
  if (totalSIXTY_SECONDSs < SIXTY_SECONDS) {
    return `${totalSIXTY_SECONDSs}m`;
  }

  const hours = Math.floor(totalSIXTY_SECONDSs / SIXTY_SECONDS);
  const SIXTY_SECONDSs = totalSIXTY_SECONDSs % SIXTY_SECONDS;

  if (SIXTY_SECONDSs === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${SIXTY_SECONDSs}m`;
}
