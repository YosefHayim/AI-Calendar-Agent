import { describe, expect, it } from '@jest/globals';
import formatDate from '@/utils/format-date';

describe('formatDate', () => {
  const invalidInputs = [null, undefined, 12_345, 'not-a-date', new Date('invalid')];

  it.each(invalidInputs)('returns "Invalid date" for %p', (input) => {
    expect(formatDate(input as any)).toBe('Invalid date');
  });

  it('formats a valid Date object', () => {
    const date = new Date('2021-07-04T00:00:00Z');
    expect(formatDate(date)).toBe('Sunday, July 4, 2021');
  });

  it('formats a valid date string', () => {
    expect(formatDate('2021-12-25')).toBe('Saturday, December 25, 2021');
  });

  it('handles leap year dates', () => {
    expect(formatDate('2020-02-29')).toBe('Saturday, February 29, 2020');
  });

  it('formats today’s date consistently', () => {
    const today = new Date('2023-08-25T00:00:00Z');
    const expected = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    expect(formatDate(today)).toBe(expected);
  });
});
