/**
 * Domain normalization and boundary-matching utilities for Urge Zero.
 */

/**
 * Clean and normalize a raw domain or URL string into a bare, canonical hostname.
 * Examples:
 * - "https://www.youtube.com/watch?v=123" -> "youtube.com"
 * - "   HTTP://Twitter.com/   " -> "twitter.com"
 * - "reddit.com" -> "reddit.com"
 * - "m.facebook.com" -> "m.facebook.com"
 */
export function normalizeDomain(input: string): string {
  if (!input) return '';
  let cleaned = input.trim().toLowerCase();

  // Strip protocol if present
  if (cleaned.startsWith('http://')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('https://')) {
    cleaned = cleaned.slice(8);
  }

  // Strip path, query params, hash, and port
  const slashIndex = cleaned.indexOf('/');
  if (slashIndex !== -1) {
    cleaned = cleaned.slice(0, slashIndex);
  }
  const questionIndex = cleaned.indexOf('?');
  if (questionIndex !== -1) {
    cleaned = cleaned.slice(0, questionIndex);
  }
  const hashIndex = cleaned.indexOf('#');
  if (hashIndex !== -1) {
    cleaned = cleaned.slice(0, hashIndex);
  }
  const colonIndex = cleaned.indexOf(':');
  if (colonIndex !== -1) {
    cleaned = cleaned.slice(0, colonIndex);
  }

  // Strip leading "www." for canonical matching
  if (cleaned.startsWith('www.')) {
    cleaned = cleaned.slice(4);
  }

  // Strip trailing dot if any
  if (cleaned.endsWith('.')) {
    cleaned = cleaned.slice(0, -1);
  }

  return cleaned.trim();
}

/**
 * Validate whether a normalized domain is a valid Internet hostname.
 */
export function isValidDomain(domain: string): boolean {
  const normalized = normalizeDomain(domain);
  if (!normalized) return false;

  // Must not contain spaces, slashes, or invalid characters
  if (/[^a-z0-9.-]/.test(normalized)) return false;

  // Must contain at least one dot separating labels (e.g. "example.com", "m.youtube.com")
  const parts = normalized.split('.');
  if (parts.length < 2) return false;

  // Each label must be 1-63 chars, start and end with alphanumeric, no double hyphens at edges
  for (const part of parts) {
    if (part.length === 0 || part.length > 63) return false;
    if (part.startsWith('-') || part.endsWith('-')) return false;
  }

  // Last part (TLD) must have at least 2 alpha characters
  const tld = parts[parts.length - 1];
  if (!/^[a-z]{2,}$/.test(tld)) return false;

  return true;
}

/**
 * Boundary-aware domain matching.
 * Returns true if targetHostname matches ruleDomain either exactly or as a valid subdomain.
 *
 * Example:
 * - isDomainMatched("youtube.com", "youtube.com") -> true
 * - isDomainMatched("m.youtube.com", "youtube.com") -> true
 * - isDomainMatched("music.youtube.com", "youtube.com") -> true
 * - isDomainMatched("notyoutube.com", "youtube.com") -> false
 * - isDomainMatched("faketwitter.com", "twitter.com") -> false
 */
export function isDomainMatched(targetHostname: string, ruleDomain: string): boolean {
  const normTarget = normalizeDomain(targetHostname);
  const normRule = normalizeDomain(ruleDomain);

  if (!normTarget || !normRule) return false;

  // Exact match
  if (normTarget === normRule) {
    return true;
  }

  // Subdomain match (must be preceded by a period boundary)
  if (normTarget.endsWith('.' + normRule)) {
    return true;
  }

  return false;
}

/**
 * Check if a rule's schedule is active at the given date/time.
 */
export function isScheduleActive(schedule: { enabled: boolean; days: number[]; startHour: number; startMinute: number; endHour: number; endMinute: number }, date = new Date()): boolean {
  if (!schedule.enabled) return true; // If schedule not enabled, rule is always active

  const currentDay = date.getDay(); // 0 = Sunday
  if (schedule.days && schedule.days.length > 0 && !schedule.days.includes(currentDay)) {
    return false;
  }

  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const startMinutes = schedule.startHour * 60 + schedule.startMinute;
  const endMinutes = schedule.endHour * 60 + schedule.endMinute;

  if (startMinutes <= endMinutes) {
    // Normal window, e.g. 09:00 to 17:00
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    // Overnight window, e.g. 22:00 to 06:00
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
}
