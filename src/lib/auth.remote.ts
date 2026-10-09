import { form, getRequestEvent, query } from '$app/server';
import { invalid, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { auth } from '#lib/server/auth.ts';
import { user } from '#lib/server/db/schema.ts';

const email = z.email('Enter a valid email address');

const sign_up_schema = createInsertSchema(user)
	.pick({ name: true, email: true })
	.extend({
		name: z.string().trim().min(1, 'Enter your name'),
		email,
		_password: z.string().min(8, 'Password must be at least 8 characters')
	});

export const sign_up = form(sign_up_schema, async ({ name, email, _password }) => {
	try {
		await auth.api.signUpEmail({ body: { name, email, password: _password } });
	} catch (error) {
		if (error instanceof APIError) invalid(error.message || 'Could not create your account');
		invalid('Could not create your account');
	}

	redirect(303, '/');
});

export const sign_in = form(
	z.object({
		email,
		_password: z.string().min(1, 'Enter your password')
	}),
	async ({ email, _password }) => {
		try {
			await auth.api.signInEmail({ body: { email, password: _password } });
		} catch (error) {
			if (error instanceof APIError) invalid(error.message || 'Could not sign you in');
			invalid('Could not sign you in');
		}

		redirect(303, '/');
	}
);

export const sign_out = form(async () => {
	const { request } = getRequestEvent();
	await auth.api.signOut({ headers: request.headers });
	redirect(303, '/login');
});

export const get_user = query(() => getRequestEvent().locals.user ?? null);
