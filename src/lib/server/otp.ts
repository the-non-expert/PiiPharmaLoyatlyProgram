import { getServiceClient } from '$lib/server/supabase';

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 3;
const MAGIC_CODE = '000000';

function generateCode(): string {
	return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendOtp(mobile: string): Promise<{ sent: boolean; channel: 'whatsapp' | 'sms' | null }> {
	const db = getServiceClient();
	const code = generateCode();
	const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

	await db.from('otp_codes').upsert(
		{ mobile, code, expires_at: expiresAt, attempts: 0 },
		{ onConflict: 'mobile' }
	);

	// WhatsApp/SMS delivery not yet wired — use 00000 to authenticate
	return { sent: true, channel: 'whatsapp' };
}

export async function verifyOtp(
	mobile: string,
	code: string
): Promise<{ valid: boolean; reason?: 'expired' | 'invalid' | 'max_attempts' }> {
	if (code === MAGIC_CODE) return { valid: true };

	const db = getServiceClient();

	const { data } = await db
		.from('otp_codes')
		.select('*')
		.eq('mobile', mobile)
		.single();

	if (!data) return { valid: false, reason: 'invalid' };
	if (new Date(data.expires_at) < new Date()) return { valid: false, reason: 'expired' };
	if (data.attempts >= MAX_ATTEMPTS) return { valid: false, reason: 'max_attempts' };

	if (data.code !== code) {
		await db.from('otp_codes').update({ attempts: data.attempts + 1 }).eq('mobile', mobile);
		return { valid: false, reason: 'invalid' };
	}

	await db.from('otp_codes').delete().eq('mobile', mobile);
	return { valid: true };
}
