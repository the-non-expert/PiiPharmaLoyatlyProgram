import type { Cookies } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { DEMO_OTP } from '$env/static/private';
import { getServiceClient } from '$lib/server/supabase';

const isDemo = dev || DEMO_OTP === 'true';

const RETAILER_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const ADMIN_TTL_MS    = 8 * 60 * 60 * 1000;        // 8 hours

const COOKIE_OPTS = {
	path:     '/',
	httpOnly: true,
	secure:   true,
	sameSite: 'lax'
} as const;

export async function createRetailerSession(retailerId: string, cookies: Cookies) {
	const expiresAt = new Date(Date.now() + RETAILER_TTL_MS);

	if (isDemo) {
		const sessionId = `dev-session-${retailerId}`;
		cookies.set('retailer_session', sessionId, { ...COOKIE_OPTS, secure: !dev, expires: expiresAt });
		return sessionId;
	}

	const db = getServiceClient();

	const { data, error } = await db
		.from('retailer_sessions')
		.insert({ retailer_id: retailerId, expires_at: expiresAt.toISOString() })
		.select('id')
		.single();

	if (error || !data) throw new Error('Failed to create retailer session');

	cookies.set('retailer_session', data.id, { ...COOKIE_OPTS, expires: expiresAt });
	return data.id;
}

export async function createAdminSession(adminId: string, cookies: Cookies) {
	const expiresAt = new Date(Date.now() + ADMIN_TTL_MS);

	if (isDemo) {
		const sessionId = `dev-admin-session-${adminId}`;
		cookies.set('admin_session', sessionId, { ...COOKIE_OPTS, secure: !dev, expires: expiresAt });
		return sessionId;
	}

	const db = getServiceClient();

	const { data, error } = await db
		.from('admin_sessions')
		.insert({ admin_id: adminId, expires_at: expiresAt.toISOString() })
		.select('id')
		.single();

	if (error || !data) throw new Error('Failed to create admin session');

	cookies.set('admin_session', data.id, { ...COOKIE_OPTS, expires: expiresAt });
	return data.id;
}

export async function clearRetailerSession(cookies: Cookies) {
	const id = cookies.get('retailer_session');
	if (!id) return;
	const db = getServiceClient();
	await db.from('retailer_sessions').delete().eq('id', id);
	cookies.delete('retailer_session', { path: '/' });
}

export async function clearAdminSession(cookies: Cookies) {
	const id = cookies.get('admin_session');
	if (!id) return;
	const db = getServiceClient();
	await db.from('admin_sessions').delete().eq('id', id);
	cookies.delete('admin_session', { path: '/' });
}
