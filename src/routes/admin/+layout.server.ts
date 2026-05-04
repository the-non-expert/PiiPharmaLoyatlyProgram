import type { LayoutServerLoad } from './$types';
import { getServiceClient } from '$lib/server/supabase';

export const load: LayoutServerLoad = async () => {
	const db = getServiceClient();
	const { count } = await db
		.from('claims')
		.select('*', { count: 'exact', head: true })
		.eq('status', 'pending');

	return { pendingCount: count ?? 0 };
};
