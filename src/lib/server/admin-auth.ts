import bcrypt from 'bcryptjs';
import { dev } from '$app/environment';
import { getServiceClient } from '$lib/server/supabase';

const DEV_ADMIN_EMAIL = 'admin@piipharma.com';
const DEV_ADMIN_PASSWORD = 'admin123';
const DEV_ADMIN_ID = 'dev-admin-00000000-0000-0000-0000-000000000001';

export async function verifyAdmin(
	email: string,
	password: string
): Promise<{ id: string } | null> {
	if (dev && email === DEV_ADMIN_EMAIL && password === DEV_ADMIN_PASSWORD) {
		return { id: DEV_ADMIN_ID };
	}

	const db = getServiceClient();

	const { data } = await db
		.from('admins')
		.select('id, password_hash')
		.eq('email', email)
		.single();

	if (!data) return null;

	const match = await bcrypt.compare(password, data.password_hash);
	return match ? { id: data.id } : null;
}
