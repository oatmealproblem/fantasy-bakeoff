import { ORIGIN, TWILIO_ID, TWILIO_SECRET, TWILIO_EMAIL_FROM } from '$app/env/private';

const base_url = ORIGIN.replace(/\/+$/, '');

export const survey_url = (token: string) => `${base_url}/surveys/${token}`;
export const results_url = (token: string) => `${survey_url(token)}/results`;

export async function send_email(to: string, subject: string, text: string, html: string) {
	if (!TWILIO_ID || !TWILIO_SECRET || !TWILIO_EMAIL_FROM) {
		console.warn(`[notify] Twilio is not configured, skipping email to ${to}`);
		return;
	}

	try {
		const response = await fetch('https://comms.twilio.com/v1/Emails', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${Buffer.from(`${TWILIO_ID}:${TWILIO_SECRET}`).toString('base64')}`
			},
			body: JSON.stringify({
				from: { address: TWILIO_EMAIL_FROM, name: 'Fantasy Bakeoff' },
				to: [{ address: to }],
				content: { subject, text, html }
			})
		});

		if (!response.ok) {
			console.error(`[notify] email to ${to} failed (${response.status})`, await response.text());
		}
	} catch (error) {
		console.error(`[notify] email to ${to} failed`, error);
	}
}
