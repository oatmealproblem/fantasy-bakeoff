export function safe_timezone(timezone: string) {
	try {
		new Intl.DateTimeFormat('en-US', { timeZone: timezone });
		return timezone;
	} catch {
		return 'UTC';
	}
}

function offset_ms(date: Date, timezone: string) {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone: timezone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hourCycle: 'h23'
	}).formatToParts(date);

	const get = (type: Intl.DateTimeFormatPartTypes) =>
		Number(parts.find((part) => part.type === type)?.value);

	const seconds = date.getTime() - (date.getTime() % 1000);

	return (
		Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second')) -
		seconds
	);
}

export function parse_in_timezone(value: string, timezone: string): Date {
	const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
	if (!match) return new Date(NaN);

	const [, year, month, day, hour, minute] = match.map(Number);
	if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) {
		return new Date(NaN);
	}

	const wall = Date.UTC(year, month - 1, day, hour, minute);
	const tz = safe_timezone(timezone);
	let instant = new Date(wall);
	for (let i = 0; i < 2; i += 1) {
		instant = new Date(wall - offset_ms(instant, tz));
	}
	return instant;
}

export function format_in_timezone(date: Date, timezone: string) {
	return new Intl.DateTimeFormat('en-US', {
		timeZone: safe_timezone(timezone),
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		timeZoneName: 'short'
	}).format(date);
}
