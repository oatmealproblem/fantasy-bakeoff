import { ORIGIN, SENDGRID_API_KEY, EMAIL_FROM } from '$app/env/private';

const base_url = ORIGIN.replace(/\/+$/, '');

export const survey_url = (token: string) => `${base_url}/surveys/${token}`;
export const results_url = (token: string) => `${survey_url(token)}/results`;

export async function send_email(to: string, subject: string, text: string, html: string) {
	if (!SENDGRID_API_KEY || !EMAIL_FROM) {
		console.warn(`[notify] SendGrid is not configured, skipping email to ${to}`);
		return;
	}

	try {
		const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${SENDGRID_API_KEY}`
			},
			body: JSON.stringify({
				personalizations: [{ to: [{ email: to }] }],
				from: { email: EMAIL_FROM, name: 'Fantasy Bakeoff' },
				subject,
				content: [
					{ type: 'text/plain', value: text },
					{ type: 'text/html', value: html }
				],
				tracking_settings: {
					click_tracking: { enable: false, enable_text: false },
					open_tracking: { enable: false }
				}
			})
		});

		if (!response.ok) {
			console.error(`[notify] email to ${to} failed (${response.status})`, await response.text());
		}
	} catch (error) {
		console.error(`[notify] email to ${to} failed`, error);
	}
}
