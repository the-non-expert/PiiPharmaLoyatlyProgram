import { createClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

// Service role client — bypasses RLS, server-side only.
// Never expose SUPABASE_SERVICE_ROLE_KEY to the client.
// Singleton: reused across requests within a warm serverless function instance.
let _client: ReturnType<typeof createClient> | null = null;

export function getServiceClient() {
	if (!_client) {
		_client = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
			auth: { persistSession: false }
		});
	}
	return _client;
}
