import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { clearRetailerSession } from '$lib/server/session';

export const load: PageServerLoad = async ({ cookies }) => {
	await clearRetailerSession(cookies);
	redirect(303, '/');
};
