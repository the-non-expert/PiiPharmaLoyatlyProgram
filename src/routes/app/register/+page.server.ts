import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { dev } from '$app/environment';
import { getServiceClient } from '$lib/server/supabase';
import { devRetailers } from '$lib/server/dev-store';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.retailerSession) return {};

	if (dev) {
		const retailer = devRetailers.get(locals.retailerSession.retailer_id);
		if (retailer?.name) redirect(303, '/app');
		return {};
	}

	const db = getServiceClient();
	const { data } = await db
		.from('retailers')
		.select('name')
		.eq('id', locals.retailerSession.retailer_id)
		.single();
	if (data?.name) redirect(303, '/app');
	return {};
};

const UPI_REGEX = /^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/;

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const data   = await request.formData();
		const name   = String(data.get('name') ?? '').trim();
		const city   = String(data.get('city') ?? '').trim();
		const state  = String(data.get('state') ?? '').trim();
		const upi_id = String(data.get('upi_id') ?? '').trim();

		if (!name || !city || !state || !upi_id) {
			return fail(400, { name, city, state, upi_id, error: 'All fields are required.' });
		}
		if (!UPI_REGEX.test(upi_id)) {
			return fail(400, { name, city, state, upi_id, error: 'Invalid UPI ID. Format: handle@bank' });
		}

		if (dev) {
			const id = locals.retailerSession!.retailer_id;
			devRetailers.set(id, { id, name, city, state, upi_id });
			redirect(303, '/app');
		}

		const db = getServiceClient();
		const { error } = await db
			.from('retailers')
			.update({ name, city, state, upi_id })
			.eq('id', locals.retailerSession!.retailer_id);

		if (error) return fail(500, { name, city, state, upi_id, error: 'Could not save profile. Please try again.' });

		redirect(303, '/app');
	}
};
