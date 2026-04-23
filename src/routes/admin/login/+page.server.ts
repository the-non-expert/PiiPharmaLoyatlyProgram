import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { verifyAdmin } from '$lib/server/admin-auth';
import { createAdminSession } from '$lib/server/session';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.adminSession) redirect(303, '/admin');
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data     = await request.formData();
		const email    = String(data.get('email') ?? '').trim();
		const password = String(data.get('password') ?? '');

		if (!email || !password) {
			return fail(400, { error: 'All fields are required.' });
		}

		const admin = await verifyAdmin(email, password);
		if (!admin) {
			return fail(401, { error: 'Invalid credentials.' });
		}

		await createAdminSession(admin.id, cookies);
		redirect(303, '/admin');
	}
};
