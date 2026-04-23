import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { DEMO_OTP } from '$env/static/private';
import { getServiceClient } from '$lib/server/supabase';

const isDemo = dev || DEMO_OTP === 'true';

export const handle: Handle = async ({ event, resolve }) => {
	const now = new Date().toISOString();
	// Lazy — only instantiated when a non-dev session cookie is present
	const getDb = () => getServiceClient();

	// ── Retailer session ──────────────────────────────────────────────────────
	event.locals.retailerSession = null;
	const retailerSessionId = event.cookies.get('retailer_session');
	if (retailerSessionId) {
		if (isDemo && retailerSessionId.startsWith('dev-session-')) {
			const retailerId = retailerSessionId.slice('dev-session-'.length);
			event.locals.retailerSession = {
				id: retailerSessionId,
				retailer_id: retailerId,
				retailer_mobile: retailerId.replace('dev-', ''),
				expires_at: new Date(Date.now() + 86_400_000).toISOString(),
				created_at: now
			};
		} else {
			const { data } = await getDb()
				.from('retailer_sessions')
				.select('*, retailers(mobile)')
				.eq('id', retailerSessionId)
				.gt('expires_at', now)
				.single();

			if (data) {
				event.locals.retailerSession = {
					...data,
					retailer_mobile: (data.retailers as { mobile: string }).mobile
				};
			} else {
				event.cookies.delete('retailer_session', { path: '/' });
			}
		}
	}

	// ── Admin session ─────────────────────────────────────────────────────────
	event.locals.adminSession = null;
	const adminSessionId = event.cookies.get('admin_session');
	if (adminSessionId) {
		if (isDemo && adminSessionId.startsWith('dev-admin-session-')) {
			event.locals.adminSession = {
				id: adminSessionId,
				admin_id: adminSessionId.slice('dev-admin-session-'.length),
				expires_at: new Date(Date.now() + 86_400_000).toISOString(),
				created_at: now
			};
		} else {
			const { data } = await getDb()
				.from('admin_sessions')
				.select('*')
				.eq('id', adminSessionId)
				.gt('expires_at', now)
				.single();

			if (data) {
				event.locals.adminSession = data;
			} else {
				event.cookies.delete('admin_session', { path: '/' });
			}
		}
	}

	// ── Route protection ──────────────────────────────────────────────────────
	const path = event.url.pathname;

	if (path.startsWith('/admin') && path !== '/admin/login') {
		if (!event.locals.adminSession) redirect(303, '/admin/login');
	}

	if (path.startsWith('/app')) {
		if (!event.locals.retailerSession) redirect(303, '/');
		// /app/register is allowed without a completed profile
	}

	return resolve(event);
};
