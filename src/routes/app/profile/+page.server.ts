import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getServiceClient } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ locals }) => {
  const session = locals.retailerSession;
  if (!session) redirect(303, '/');

  const db = getServiceClient();
  const { data: retailer } = await db
    .from('retailers')
    .select('*')
    .eq('id', session.retailer_id)
    .single();

  if (!retailer) redirect(303, '/app/register');

  return { retailer };
};

const UPI_REGEX = /^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/;

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const session = locals.retailerSession;
    if (!session) return fail(401, { error: 'Unauthorized' });

    const formData = await request.formData();
    const name   = (formData.get('name')   as string)?.trim() ?? '';
    const city   = (formData.get('city')   as string)?.trim() ?? '';
    const state  = (formData.get('state')  as string)?.trim() ?? '';
    const upi_id = (formData.get('upi_id') as string)?.trim() ?? '';

    if (!name || !city || !state || !upi_id) {
      return fail(400, { error: 'All fields are required.', name, city, state, upi_id });
    }
    if (!UPI_REGEX.test(upi_id)) {
      return fail(400, { error: 'Invalid UPI ID. Format: handle@bank', name, city, state, upi_id });
    }

    const db = getServiceClient();
    const { error } = await db
      .from('retailers')
      .update({ name, city, state, upi_id })
      .eq('id', session.retailer_id);

    if (error) return fail(500, { error: 'Failed to update profile. Please try again.', name, city, state, upi_id });

    return { success: true };
  }
} satisfies Actions;
