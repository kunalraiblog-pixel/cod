import { describe, it, expect } from 'vitest';
import { normalizeDomain, isValidDomain, isDomainMatched, isScheduleActive } from '../src/utils/domain';

describe('Domain Normalization and Validation', () => {
  it('normalizes various URL formats and messy inputs', () => {
    expect(normalizeDomain('https://www.youtube.com/watch?v=123')).toBe('youtube.com');
    expect(normalizeDomain('  http://Twitter.com/home  ')).toBe('twitter.com');
    expect(normalizeDomain('HTTPS://INSTAGRAM.COM/')).toBe('instagram.com');
    expect(normalizeDomain('reddit.com:8080/r/all')).toBe('reddit.com');
    expect(normalizeDomain('m.facebook.com')).toBe('m.facebook.com');
  });

  it('validates legitimate hostnames', () => {
    expect(isValidDomain('youtube.com')).toBe(true);
    expect(isValidDomain('sub.domain.co.uk')).toBe(true);
    expect(isValidDomain('my-site.org')).toBe(true);
    expect(isValidDomain('news.ycombinator.com')).toBe(true);
  });

  it('rejects invalid inputs', () => {
    expect(isValidDomain('')).toBe(false);
    expect(isValidDomain('   ')).toBe(false);
    expect(isValidDomain('not a domain')).toBe(false);
    expect(isValidDomain('nodotshere')).toBe(false);
    expect(isValidDomain('-invalid.com')).toBe(false);
    expect(isValidDomain('invalid-.com')).toBe(false);
  });

  it('correctly matches exact domains and subdomains while preventing false positive prefix/suffix overlaps', () => {
    // Exact match
    expect(isDomainMatched('youtube.com', 'youtube.com')).toBe(true);
    expect(isDomainMatched('https://youtube.com', 'youtube.com')).toBe(true);

    // Subdomain matches
    expect(isDomainMatched('m.youtube.com', 'youtube.com')).toBe(true);
    expect(isDomainMatched('music.youtube.com', 'youtube.com')).toBe(true);
    expect(isDomainMatched('deep.sub.youtube.com', 'youtube.com')).toBe(true);

    // Negative tests: false prefix or suffix should NOT match
    expect(isDomainMatched('notyoutube.com', 'youtube.com')).toBe(false);
    expect(isDomainMatched('myoutube.com', 'youtube.com')).toBe(false);
    expect(isDomainMatched('faketwitter.com', 'twitter.com')).toBe(false);
    expect(isDomainMatched('instagram-scam.com', 'instagram.com')).toBe(false);
  });

  it('evaluates schedules accurately', () => {
    // Always active if schedule not enabled
    expect(isScheduleActive({ enabled: false, days: [], startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 })).toBe(true);

    // Specific active window on Monday (day 1)
    const mondayNoon = new Date('2026-10-19T12:00:00'); // Oct 19, 2026 is Monday
    expect(isScheduleActive({
      enabled: true,
      days: [1, 2, 3, 4, 5],
      startHour: 9,
      startMinute: 0,
      endHour: 17,
      endMinute: 0
    }, mondayNoon)).toBe(true);

    // Outside active window (e.g. 8 PM)
    const mondayEvening = new Date('2026-10-19T20:00:00');
    expect(isScheduleActive({
      enabled: true,
      days: [1, 2, 3, 4, 5],
      startHour: 9,
      startMinute: 0,
      endHour: 17,
      endMinute: 0
    }, mondayEvening)).toBe(false);

    // Inactive day (Sunday = 0)
    const sundayNoon = new Date('2026-10-18T12:00:00');
    expect(isScheduleActive({
      enabled: true,
      days: [1, 2, 3, 4, 5],
      startHour: 9,
      startMinute: 0,
      endHour: 17,
      endMinute: 0
    }, sundayNoon)).toBe(false);
  });
});
