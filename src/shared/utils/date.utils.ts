export function getStartOfCurrentDay(): Date {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
}

export function calculateDurationInSeconds(startedAt: string | Date, endedAt: string | Date): number {
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();
  return Math.max(0, Math.floor((end - start) / 1000));
}