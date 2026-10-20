import type { Handle } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import { auth } from '#lib/server/auth.ts';
import { remember_survey } from '#lib/server/recent_surveys.ts';
import { svelteKitHandler } from 'better-auth/svelte-kit';

const handle_better_auth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	const token = event.url.pathname.match(/^\/surveys\/([^/]+)\/?$/)?.[1];
	if (token) remember_survey(event.cookies, token);

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = handle_better_auth;
