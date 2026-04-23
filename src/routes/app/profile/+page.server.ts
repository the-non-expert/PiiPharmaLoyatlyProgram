import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { dev } from '$app/environment';
import { getServiceClient } from '$lib/server/supabase';
import { devRetailers } from '$lib/server/dev-store';

export const load: PageServerLoad = async ({ locals }) => {
  const session = locals.retailerSession;
  if (!session) redirect(303, '/');

  if (dev) {
    const retailer = devRetailers.get(session.retailer_id) ?? { id: session.retailer_id, name: null };
    return { retailer };
  }

  const supabase = getServiceClient();
  const { data: retailer } = await supabase
    .from('retailers')
    .select('*')
    .eq('id', session.retailer_id)
    .single();

  if (!retailer) redirect(303, '/app/register');

  return { retailer };
};

const UPI_REGEX = /^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/;

export const actions = {
  default: async ({ request, locals }) => {
    const session = locals.retailerSession;
    if (!session) return fail(401, { error: 'Unauthorized' });

    const formData = await request.formData();
    const upi_id = (formData.get('upi_id') as string)?.trim() || '';

    if (!upi_id || !UPI_REGEX.test(upi_id)) {
      return fail(400, { error: 'Invalid UPI ID. Format: handle@bank', upi_id });
    }

    if (dev) {
      const existing = devRetailers.get(session.retailer_id);
      if (existing) devRetailers.set(session.retailer_id, { ...existing, upi_id });
      return { success: true, upi_id };
    }

    const supabase = getServiceClient();
    const { error } = await supabase
      .from('retailers')
      .update({ upi_id })
      .eq('id', session.retailer_id);

    if (error) return fail(500, { error: 'Failed to update UPI ID. Please try again.', upi_id });

    return { success: true, upi_id };
  }
} satisfies Actions;
