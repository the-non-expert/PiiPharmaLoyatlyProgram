import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
import { getServiceClient } from '$lib/server/supabase';

export const handle: Handle = async ({ event, resolve }) => {
	const now = new Date().toISOString();
	const getDb = () => getServiceClient();

	// ── Retailer session ──────────────────────────────────────────────────────
	event.locals.retailerSession = null;
	const retailerSessionId = event.cookies.get('retailer_session');
	if (retailerSessionId) {
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

	// ── Admin session ─────────────────────────────────────────────────────────
	event.locals.adminSession = null;
	const adminSessionId = event.cookies.get('admin_session');
	if (adminSessionId) {
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

	// ── Route protection ──────────────────────────────────────────────────────
	const path = event.url.pathname;

	if (path.startsWith('/admin') && path !== '/admin/login') {
		if (!event.locals.adminSession) redirect(303, '/admin/login');
	}

	if (path.startsWith('/app')) {
		if (!event.locals.retailerSession) redirect(303, '/');
	}

	return resolve(event);
};
