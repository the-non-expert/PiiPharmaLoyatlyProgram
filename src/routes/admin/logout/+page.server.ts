import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { clearAdminSession } from '$lib/server/session';

export const load: PageServerLoad = async ({ cookies }) => {
	await clearAdminSession(cookies);
	redirect(303, '/admin/login');
};
