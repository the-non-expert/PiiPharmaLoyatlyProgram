import bcrypt from 'bcryptjs';
import { getServiceClient } from '$lib/server/supabase';

export async function verifyAdmin(
	email: string,
	password: string
): Promise<{ id: string } | null> {
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
