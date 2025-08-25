import formatDate from '@/utils/format-date';

describe('formatDate', () => {
  test('returns formatted string for valid Date object', () => {
    const d = new Date('2023-01-15T12:00:00Z');
    const result = formatDate(d);
    expect(result).toMatch('Sunday, January 15, 2023');
  });

  test('returns formatted string for valid date string', () => {
    const result = formatDate('2020-05-20T00:00:00Z');
    expect(result).toMatch('Wednesday, May 20, 2020');
  });

  test('returns "Invalid date" for null', () => {
    expect(formatDate(null)).toBe('Invalid date');
  });

  test('returns "Invalid date" for undefined', () => {
    expect(formatDate(undefined)).toBe('Invalid date');
  });

  test('returns "Invalid date" for non-Date, non-string', () => {
    expect(formatDate(123 as unknown as Date)).toBe('Invalid date');
    expect(formatDate({} as unknown as Date)).toBe('Invalid date');
    expect(formatDate([] as unknown as Date)).toBe('Invalid date');
  });

  test('returns "Invalid date" for unparsable string', () => {
    expect(formatDate('not-a-date')).toBe('Invalid date');
  });

  test('formats leap year date correctly', () => {
    const result = formatDate('2020-02-29T12:00:00Z');
    expect(result).toMatch('Saturday, February 29, 2020');
  });

  test('handles edge case: epoch time', () => {
    const result = formatDate(new Date(0));
    expect(result).toMatch('Thursday, January 1, 1970');
  });

  test('handles edge case: far future date', () => {
    const result = formatDate(new Date('2999-12-31T23:59:59Z'));
    expect(result).toMatch('Friday, December 31, 2999');
  });
});
