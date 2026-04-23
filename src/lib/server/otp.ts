import { dev } from '$app/environment';
import { getServiceClient } from '$lib/server/supabase';
import { WHATSAPP_API_TOKEN, WHATSAPP_PHONE_ID, SMS_API_KEY } from '$env/static/private';

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 3;

function generateCode(): string {
	return String(Math.floor(100000 + Math.random() * 900000));
}

// Dev-only in-memory OTP store (persists across requests while dev server is running)
const devCodes = new Map<string, string>();

async function sendWhatsApp(mobile: string, code: string): Promise<boolean> {
	try {
		// WhatsApp Business Cloud API — replace template name with your approved OTP template
		const res = await fetch(
			`https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					messaging_product: 'whatsapp',
					to: `91${mobile}`,
					type: 'template',
					template: {
						name: 'otp_cashback', // configure this template in Meta Business Manager
						language: { code: 'en' },
						components: [{ type: 'body', parameters: [{ type: 'text', text: code }] }]
					}
				})
			}
		);
		return res.ok;
	} catch {
		return false;
	}
}

async function sendSms(mobile: string, code: string): Promise<boolean> {
	try {
		// Fast2SMS — swap for your SMS provider if different
		const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
			method: 'POST',
			headers: { authorization: SMS_API_KEY, 'Content-Type': 'application/json' },
			body: JSON.stringify({
				route: 'otp',
				variables_values: code,
				numbers: mobile
			})
		});
		return res.ok;
	} catch {
		return false;
	}
}

export async function sendOtp(mobile: string): Promise<{ sent: boolean; channel: 'whatsapp' | 'sms' | null }> {
	if (dev) {
		const code = generateCode();
		devCodes.set(mobile, code);
		console.log(`\n🔑 DEV OTP  +91 ${mobile}  →  ${code}\n`);
		return { sent: true, channel: 'whatsapp' };
	}

	const db = getServiceClient();
	const code = generateCode();
	const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

	await db.from('otp_codes').upsert(
		{ mobile, code, expires_at: expiresAt, attempts: 0 },
		{ onConflict: 'mobile' }
	);

	const whatsappOk = await sendWhatsApp(mobile, code);
	if (whatsappOk) return { sent: true, channel: 'whatsapp' };

	const smsOk = await sendSms(mobile, code);
	if (smsOk) return { sent: true, channel: 'sms' };

	return { sent: false, channel: null };
}

export async function verifyOtp(
	mobile: string,
	code: string
): Promise<{ valid: boolean; reason?: 'expired' | 'invalid' | 'max_attempts' }> {
	if (dev) {
		const expected = devCodes.get(mobile);
		if (!expected || expected !== code) return { valid: false, reason: 'invalid' };
		devCodes.delete(mobile);
		return { valid: true };
	}

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
