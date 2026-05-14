import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getServiceClient } from '$lib/server/supabase';
import { sendOtp, verifyOtp } from '$lib/server/otp';

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
  updateProfile: async ({ request, locals }) => {
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
  },

  sendUpiOtp: async ({ locals }) => {
    const session = locals.retailerSession;
    if (!session) return fail(401, { error: 'Unauthorized' });

    const db = getServiceClient();
    const { data: retailer } = await db
      .from('retailers')
      .select('mobile')
      .eq('id', session.retailer_id)
      .single();

    if (!retailer) return fail(404, { error: 'Retailer not found.' });

    const { sent } = await sendOtp(retailer.mobile);
    if (!sent) return fail(500, { error: 'Could not send OTP. Please try again.' });

    return { upiOtpSent: true };
  },

  verifyUpiOtp: async ({ request, locals }) => {
    const session = locals.retailerSession;
    if (!session) return fail(401, { error: 'Unauthorized' });

    const formData = await request.formData();
    const code    = (formData.get('code')    as string)?.trim() ?? '';
    const upi_id  = (formData.get('upi_id')  as string)?.trim() ?? '';

    if (!upi_id) return fail(400, { upiOtpSent: true, upiError: 'UPI ID is required.' });
    if (!UPI_REGEX.test(upi_id)) return fail(400, { upiOtpSent: true, upiError: 'Invalid UPI ID. Format: handle@bank' });

    const db = getServiceClient();
    const { data: retailer } = await db
      .from('retailers')
      .select('mobile')
      .eq('id', session.retailer_id)
      .single();

    if (!retailer) return fail(404, { upiOtpSent: true, upiError: 'Retailer not found.' });

    const result = await verifyOtp(retailer.mobile, code);
    if (!result.valid) {
      const messages: Record<string, string> = {
        expired:      'OTP has expired. Please request a new one.',
        max_attempts: 'Too many incorrect attempts. Please request a new OTP.',
        invalid:      'Incorrect OTP. Please try again.'
      };
      return fail(400, { upiOtpSent: true, upiError: messages[result.reason ?? 'invalid'] });
    }

    const { error } = await db
      .from('retailers')
      .update({ upi_id })
      .eq('id', session.retailer_id);

    if (error) return fail(500, { upiOtpSent: true, upiError: 'Failed to update UPI ID. Please try again.' });

    return { success: true };
  }
} satisfies Actions;
