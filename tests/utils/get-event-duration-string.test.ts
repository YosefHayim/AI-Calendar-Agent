import { getEventDurationString } from '@/utils/get-event-duration-string';

describe('getEventDurationString', () => {
  it.each([
    ['', '2024-01-01T00:00:05Z'],
    ['2024-01-01T00:00:00Z', ''],
    ['', ''],
    [null, '2024-01-01T00:00:05Z'],
    ['2024-01-01T00:00:00Z', undefined],
  ])('returns null for missing inputs %p / %p', (start, end) => {
    expect(getEventDurationString(start as any, end as any)).toBeNull();
  });

  it.each([
    ['invalid', '2024-01-01T00:00:05Z'],
    ['2024-01-01T00:00:00Z', 'invalid'],
    ['2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'],
    ['2024-01-01T00:00:05Z', '2024-01-01T00:00:04Z'],
  ])('returns null for invalid or end <= start %p / %p', (start, end) => {
    expect(getEventDurationString(start, end)).toBeNull();
  });
  test('seconds: < 60s returns "Xs"', () => {
    expect(getEventDurationString('2024-01-01T00:00:00Z', '2024-01-01T00:00:01Z')).toBe('1s');
    expect(getEventDurationString('2024-01-01T00:00:00Z', '2024-01-01T00:00:59Z')).toBe('59s');
  });

  test('rounding to nearest second (59.5s -> 1m)', () => {
    // 59.5s => rounds to 60s => "1m"
    const start = '2024-01-01T00:00:00.000Z';
    const end = '2024-01-01T00:00:59.500Z';
    expect(getEventDurationString(start, end)).toBe('1m');
  });

  test('threshold at 60s -> 1m', () => {
    expect(getEventDurationString('2024-01-01T00:00:00Z', '2024-01-01T00:01:00Z')).toBe('1m');
  });

  test('coarse minute granularity (89s -> 1m)', () => {
    // 1m 29s expected by some APIs, but function returns coarse minutes
    expect(getEventDurationString('2024-01-01T00:00:00Z', '2024-01-01T00:01:29Z')).toBe('1m');
  });

  test('minutes: < 60m returns "Xm"', () => {
    expect(getEventDurationString('2024-01-01T00:00:00Z', '2024-01-01T00:10:00Z')).toBe('10m');
    expect(getEventDurationString('2024-01-01T00:00:00Z', '2024-01-01T00:59:00Z')).toBe('59m');
  });

  test('threshold at 60m -> "1h"', () => {
    expect(getEventDurationString('2024-01-01T00:00:00Z', '2024-01-01T01:00:00Z')).toBe('1h');
  });

  test('exact hours return "Xh"', () => {
    expect(getEventDurationString('2024-01-01T00:00:00Z', '2024-01-01T02:00:00Z')).toBe('2h');
    expect(getEventDurationString('2024-01-01T05:00:00Z', '2024-01-01T05:00:59Z')).toBe('1m'); // rounds to 1m, not an hour
  });

  test('hours and minutes: "Xh Ym"', () => {
    expect(getEventDurationString('2024-01-01T00:00:00Z', '2024-01-01T01:30:00Z')).toBe('1h 30m');
    expect(getEventDurationString('2024-01-01T02:15:00Z', '2024-01-01T05:45:00Z')).toBe('3h 30m');
  });

  test('large durations produce hours > 24', () => {
    expect(getEventDurationString('2024-01-01T00:00:00Z', '2024-01-02T12:00:00Z')).toBe('36h');
    expect(getEventDurationString('2024-01-01T00:00:00Z', '2024-01-03T03:45:00Z')).toBe('51h 45m');
  });

  test('handles millisecond boundaries correctly (rounding up)', () => {
    // 1h 59m 30.4s -> rounds to 1h 60m -> becomes 2h
    const start = '2024-01-01T00:00:00.000Z';
    const end = '2024-01-01T01:59:30.400Z';
    expect(getEventDurationString(start, end)).toBe('2h');
  });
});
