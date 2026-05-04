import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { sendOtp, verifyOtp } from '$lib/server/otp';
import { getServiceClient } from '$lib/server/supabase';
import { createRetailerSession } from '$lib/server/session';

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

		const db = getServiceClient();

		let { data: retailer } = await db
			.from('retailers')
			.select('id, name')
			.eq('mobile', mobile)
			.single();

		if (!retailer) {
			const { data: created } = await db
				.from('retailers')
				.insert({ mobile })
				.select('id, name')
				.single();
			retailer = created;
		}

		if (!retailer) return fail(500, { mobile, otpSent: true, error: 'Account error. Please try again.' });

		await createRetailerSession(retailer.id, cookies);

		if (!retailer.name) redirect(303, '/app/register');
		redirect(303, '/app');
	}
};
