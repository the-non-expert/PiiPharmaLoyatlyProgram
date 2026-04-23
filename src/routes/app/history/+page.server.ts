import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { dev } from '$app/environment';
import { getServiceClient } from '$lib/server/supabase';
import { devClaims } from '$lib/server/dev-store';

export const load: PageServerLoad = async ({ locals }) => {
  const session = locals.retailerSession;
  if (!session) redirect(303, '/');

  if (dev) {
    const claims = devClaims.filter(c => c.retailer_id === session.retailer_id);
    return { claims };
  }

  const supabase = getServiceClient();

  const { data: claims } = await supabase
    .from('claims')
    .select(`
      id,
      status,
      rejection_reason,
      created_at,
      products (name),
      serial_numbers (serial)
    `)
    .eq('retailer_id', session.retailer_id)
    .order('created_at', { ascending: false });

  const formattedClaims = (claims || []).map(claim => ({
    id: claim.id,
    product_name: (Array.isArray(claim.products) ? claim.products[0] : claim.products)?.name || 'Unknown Product',
    status: claim.status,
    rejection_reason: claim.rejection_reason,
    created_at: claim.created_at,
    serials: claim.serial_numbers?.map((sn: { serial: string }) => sn.serial) || []
  }));

  return { claims: formattedClaims };
};
