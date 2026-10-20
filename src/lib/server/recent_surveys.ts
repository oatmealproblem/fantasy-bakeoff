import type { Cookies } from '@sveltejs/kit';
import { z } from 'zod';

export const recent_surveys_cookie = 'recent_surveys';
const max_recent_surveys = 5;

const recent_surveys_codec = z.codec(z.string(), z.array(z.string()), {
	decode: (json_string, ctx) => {
		try {
			return JSON.parse(json_string);
		} catch (err) {
			ctx.issues.push({
				code: 'invalid_format',
				format: 'json',
				input: json_string,
				message: err instanceof Error ? err.message : 'Invalid JSON'
			});
			return z.NEVER;
		}
	},
	encode: (tokens) => JSON.stringify(tokens)
});

export function parse_recent_surveys(value: string | undefined): string[] {
	if (!value) return [];
	const result = recent_surveys_codec.safeDecode(value);
	return result.success ? result.data.slice(0, max_recent_surveys) : [];
}

export function remember_survey(cookies: Cookies, token: string) {
	const tokens = [
		token,
		...parse_recent_surveys(cookies.get(recent_surveys_cookie)).filter((t) => t !== token)
	];
	cookies.set(
		recent_surveys_cookie,
		recent_surveys_codec.encode(tokens.slice(0, max_recent_surveys)),
		{
			path: '/',
			maxAge: 60 * 60 * 24 * 365,
			httpOnly: true,
			sameSite: 'lax'
		}
	);
}
