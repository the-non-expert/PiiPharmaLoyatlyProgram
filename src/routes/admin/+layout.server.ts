import type { LayoutServerLoad } from './$types';
import { getServiceClient } from '$lib/server/supabase';

export const load: LayoutServerLoad = async ({ locals }) => {
	const db = getServiceClient();
	const { count } = await db
		.from('claims')
		.select('*', { count: 'exact', head: true })
		.eq('status', 'pending');

	let adminEmail: string | null = null;
	if (locals.adminSession) {
		const { data } = await db
			.from('admins')
			.select('email')
			.eq('id', locals.adminSession.admin_id)
			.single();
		adminEmail = data?.email ?? null;
	}

	return { pendingCount: count ?? 0, adminEmail };
};
