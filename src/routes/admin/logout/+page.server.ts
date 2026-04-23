import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { clearAdminSession } from '$lib/server/session';

export const actions: Actions = {
	default: async ({ cookies }) => {
		await clearAdminSession(cookies);
		redirect(303, '/admin/login');
	}
};
