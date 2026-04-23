import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { dev } from '$app/environment';
import { sendOtp, verifyOtp } from '$lib/server/otp';
import { getServiceClient } from '$lib/server/supabase';
import { createRetailerSession } from '$lib/server/session';
import { devRetailers } from '$lib/server/dev-store';

export const actions: Actions = {
	sendOtp: async ({ request }) => {
		const data = await request.formData();
		const mobile = String(data.get('mobile') ?? '').trim();

		if (!/^\d{10}$/.test(mobile)) {
			return fail(400, { mobile, error: 'Enter a valid 10-digit mobile number.' });
		}

		const { sent } = await sendOtp(mobile);
		if (!sent) {
			return fail(500, { mobile, error: 'Could not send OTP. Please try again.' });
		}

		return { otpSent: true, mobile };
	},

	verifyOtp: async ({ request, cookies }) => {
		const data = await request.formData();
		const mobile = String(data.get('mobile') ?? '').trim();
		const code   = String(data.get('code') ?? '').trim();

		const result = await verifyOtp(mobile, code);

		if (!result.valid) {
			const messages: Record<string, string> = {
				expired:      'OTP has expired. Please request a new one.',
				max_attempts: 'Too many incorrect attempts. Please request a new OTP.',
				invalid:      'Incorrect OTP. Please try again.'
			};
			return fail(400, { mobile, otpSent: true, error: messages[result.reason ?? 'invalid'] });
		}

		let retailer: { id: string; name: string | null } | null = null;

		if (dev) {
			if (!devRetailers.has(mobile)) {
				devRetailers.set(mobile, { id: `dev-${mobile}`, name: null });
			}
			retailer = devRetailers.get(mobile)!;
		} else {
			const db = getServiceClient();

			// Find or create retailer row (mobile is the identity)
			let { data } = await db
				.from('retailers')
				.select('id, name')
				.eq('mobile', mobile)
				.single();

			if (!data) {
				const { data: created } = await db
					.from('retailers')
					.insert({ mobile })
					.select('id, name')
					.single();
				data = created;
			}

			retailer = data;
		}

		if (!retailer) return fail(500, { mobile, otpSent: true, error: 'Account error. Please try again.' });

		await createRetailerSession(retailer.id, cookies);

		// First-time user (no name yet) → registration
		if (!retailer.name) redirect(303, '/app/register');
		redirect(303, '/app');
	}
};
