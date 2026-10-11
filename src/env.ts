import { defineEnvVars } from '@sveltejs/kit/env';
import { z } from 'zod';

export const variables = defineEnvVars({
	DATABASE_URL: { description: 'The database connection string.' },
	ORIGIN: {
		description: 'The app origin (base URL), e.g. `http://localhost:5173`.'
	},
	BETTER_AUTH_SECRET: {
		description:
			'Secret used to sign tokens. For production use 32 characters generated with high entropy. See [Better Auth installation](https://www.better-auth.com/docs/installation).'
	},
	TWILIO_ID: {
		schema: z.string().optional()
	},
	TWILIO_SECRET: {
		schema: z.string().optional()
	},
	TWILIO_EMAIL_FROM: {
		description: 'Verified sender address for email notifications, e.g. `bakeoff@example.com`.',
		schema: z.email().optional()
	}
});
