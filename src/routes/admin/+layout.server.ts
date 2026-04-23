import { dev } from '$app/environment';
import type { LayoutServerLoad } from './$types';
import { getServiceClient } from '$lib/server/supabase';

export const load: LayoutServerLoad = async () => {
	if (dev) {
		const { MOCK_CLAIMS } = await import('$lib/server/dev-mock');
		return { pendingCount: MOCK_CLAIMS.filter((c) => c.status === 'pending').length };
	}

	const db = getServiceClient();
	const { count } = await db
		.from('claims')
		.select('*', { count: 'exact', head: true })
		.eq('status', 'pending');

	return { pendingCount: count ?? 0 };
};
