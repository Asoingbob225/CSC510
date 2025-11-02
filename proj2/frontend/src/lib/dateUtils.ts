/**
 * Utility functions for date and timezone handling
 */

/**
 * Convert UTC datetime string to local date string (YYYY-MM-DD)
 * @param utcDatetime - ISO8601 datetime string in UTC
 * @returns Local date string in YYYY-MM-DD format
 */
export function utcToLocalDate(utcDatetime: string): string {
  const date = new Date(utcDatetime);
  // Use local date components instead of toISOString() to avoid timezone conversion
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convert UTC datetime string to local datetime
 * @param utcDatetime - ISO8601 datetime string in UTC
 * @returns Local Date object
 */
export function utcToLocalDatetime(utcDatetime: string): Date {
  return new Date(utcDatetime);
}

/**
 * Get current datetime in ISO8601 format with timezone
 * This is what the backend expects for occurred_at fields
 * @returns ISO8601 string with timezone (e.g., "2025-11-01T12:34:56.789Z")
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Format a date object to local date string
 * @param date - Date object
 * @returns Formatted date string (YYYY-MM-DD)
 */
export function formatLocalDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format a UTC datetime string to user-friendly local format
 * @param utcDatetime - ISO8601 datetime string in UTC
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted string in user's locale
 */
export function formatLocalDateTime(
  utcDatetime: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(utcDatetime);
  return date.toLocaleString(undefined, options);
}

/**
 * Check if a UTC datetime is today in user's local timezone
 * @param utcDatetime - ISO8601 datetime string in UTC
 * @returns true if the date is today
 */
export function isToday(utcDatetime: string): boolean {
  const localDate = utcToLocalDate(utcDatetime);
  const today = formatLocalDate(new Date());
  return localDate === today;
}
