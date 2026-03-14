import { DateTime } from 'luxon';

/** Get Monday of the week containing the given date */
export function getWeekStart(date: DateTime = DateTime.now()): string {
  return date.startOf('week').toISODate()!;
}

/** Get an array of 7 DateTime objects for Mon–Sun of a given week */
export function getWeekDays(weekStart: string): DateTime[] {
  const start = DateTime.fromISO(weekStart);
  return Array.from({ length: 7 }, (_, i) => start.plus({ days: i }));
}

/** Format a UTC ISO string in a location's timezone */
export function formatInTimezone(
  isoString: string,
  timezone: string,
  format: string = 'h:mm a',
): string {
  return DateTime.fromISO(isoString, { zone: 'utc' })
    .setZone(timezone)
    .toFormat(format);
}

/** Get the date part of a UTC timestamp in a location's timezone */
export function getDateInTimezone(isoString: string, timezone: string): string {
  return DateTime.fromISO(isoString, { zone: 'utc' })
    .setZone(timezone)
    .toISODate()!;
}

/** Calculate shift duration in hours */
export function shiftDurationHours(startTime: string, endTime: string): number {
  const start = DateTime.fromISO(startTime);
  const end = DateTime.fromISO(endTime);
  return end.diff(start, 'hours').hours;
}

/** Format a date nicely */
export function formatDate(date: DateTime, format: string = 'EEE, MMM d'): string {
  return date.toFormat(format);
}

/** Navigate weeks */
export function prevWeek(weekStart: string): string {
  return DateTime.fromISO(weekStart).minus({ weeks: 1 }).toISODate()!;
}

export function nextWeek(weekStart: string): string {
  return DateTime.fromISO(weekStart).plus({ weeks: 1 }).toISODate()!;
}
