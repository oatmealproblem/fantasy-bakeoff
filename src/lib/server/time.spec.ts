import { expect, test } from 'vitest';
import { format_in_timezone, parse_in_timezone } from './time.ts';

test('parses wall time in the given timezone', () => {
	expect(parse_in_timezone('2026-07-15T18:00', 'America/New_York').toISOString()).toBe(
		'2026-07-15T22:00:00.000Z'
	);
	expect(parse_in_timezone('2026-01-15T18:00', 'America/New_York').toISOString()).toBe(
		'2026-01-15T23:00:00.000Z'
	);
	expect(parse_in_timezone('2026-07-15T18:00', 'Asia/Kolkata').toISOString()).toBe(
		'2026-07-15T12:30:00.000Z'
	);
	expect(parse_in_timezone('2026-07-15T00:00', 'America/New_York').toISOString()).toBe(
		'2026-07-15T04:00:00.000Z'
	);
});

test('falls back to UTC for missing or invalid timezones', () => {
	expect(parse_in_timezone('2026-07-15T18:00', 'nonsense').toISOString()).toBe(
		'2026-07-15T18:00:00.000Z'
	);
	expect(parse_in_timezone('2026-07-15T18:00', '').toISOString()).toBe('2026-07-15T18:00:00.000Z');
	expect(parse_in_timezone('not a date', 'UTC').getTime()).toBeNaN();
});

test('formats in the given timezone with a zone label', () => {
	const deadline = new Date('2026-07-15T22:00:00Z');
	expect(format_in_timezone(deadline, 'America/New_York')).toBe(
		'Wednesday, July 15, 2026 at 6:00 PM EDT'
	);
	expect(format_in_timezone(deadline, 'nonsense')).toBe('Wednesday, July 15, 2026 at 10:00 PM UTC');
});
