import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getServiceClient } from '$lib/server/supabase';
import { env } from '$env/dynamic/private';
import { padSerial, parseSerialNum, generateChunk } from '$lib/server/qr-gen';

const CHUNK_SIZE = 1000;

// ── Action: init ─────────────────────────────────────────────────────────────
// Creates the qr_batches row and determines the next available serial number
// for the given prefix. Returns batch_id + start_num so the browser can fire
// chunk calls without race conditions.
async function handleInit(
	supabase: ReturnType<typeof getServiceClient>,
	body: Record<string, unknown>
) {
	const productId = String(body.product_id ?? '').trim();
	const batchLabel = String(body.batch_label ?? '').trim().toUpperCase();
	const prefix = String(body.prefix ?? '').trim().toUpperCase();
	const quantity = Number(body.quantity);

	if (!productId || !batchLabel || !prefix) error(400, 'Missing required fields');
	if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) error(400, 'Invalid quantity');
	if (!/^[A-Z0-9-]+$/.test(batchLabel) || batchLabel.length > 32) error(400, 'Invalid batch_label');
	if (!/^[A-Z0-9-]+$/.test(prefix) || prefix.length > 8) error(400, 'Invalid prefix');

	// Verify product exists
	const { data: product } = await supabase
		.from('products')
		.select('id')
		.eq('id', productId)
		.single();
	if (!product) error(404, 'Product not found');

	// Check batch_label uniqueness for this product
	const { data: existing } = await supabase
		.from('qr_batches')
		.select('id')
		.eq('product_id', productId)
		.eq('batch_label', batchLabel)
		.maybeSingle();
	if (existing) error(409, `Batch label "${batchLabel}" already exists for this product`);

	// Find the last serial for this prefix to ensure non-overlapping ranges
	const { data: lastRow } = await supabase
		.from('qr_serials')
		.select('serial')
		.like('serial', `${prefix}-%`)
		.order('serial', { ascending: false })
		.limit(1)
		.maybeSingle();

	const startNum = lastRow ? parseSerialNum((lastRow as unknown as { serial: string }).serial) + 1 : 1;
	const serialStart = padSerial(prefix, startNum);
	const serialEnd = padSerial(prefix, startNum + quantity - 1);

	// Create the batch row
	const batchId = crypto.randomUUID();
	const { error: insertErr } = await supabase.from('qr_batches').insert({
		id: batchId,
		product_id: productId,
		batch_label: batchLabel,
		serial_prefix: prefix,
		quantity,
		serial_start: serialStart,
		serial_end: serialEnd,
		serial_start_num: startNum
	} as never);
	if (insertErr) error(500, 'Failed to create batch');

	return json({ batch_id: batchId, start_num: startNum, serial_start: serialStart, serial_end: serialEnd });
}

// ── Action: chunk ─────────────────────────────────────────────────────────────
// Generates `count` serials starting at `start_num`, signs each with HMAC,
// bulk-inserts into qr_serials, and returns the serials+HMACs for client rendering.
async function handleChunk(
	supabase: ReturnType<typeof getServiceClient>,
	body: Record<string, unknown>,
	hmacSecret: string
) {
	const batchId = String(body.batch_id ?? '').trim();
	const productId = String(body.product_id ?? '').trim();
	const prefix = String(body.prefix ?? '').trim().toUpperCase();
	const startNum = Number(body.start_num);
	const count = Number(body.count);

	if (!batchId || !productId || !prefix) error(400, 'Missing required fields');
	if (!Number.isInteger(startNum) || startNum < 1) error(400, 'Invalid start_num');
	if (!Number.isInteger(count) || count < 1 || count > CHUNK_SIZE) error(400, 'Invalid count');

	const items = generateChunk(hmacSecret, prefix, productId, batchId, startNum, count);

	// Bulk insert — let the UNIQUE constraint on serial reject any collision
	const rows = items.map((item) => ({
		batch_id: batchId,
		serial: item.serial,
		hmac: item.hmac
	}));

	const { error: insertErr } = await supabase.from('qr_serials').insert(rows as never[]);
	if (insertErr) {
		if (insertErr.code === '23505') error(409, 'Serial collision — a serial in this range already exists');
		error(500, 'Failed to insert serials');
	}

	return json({ inserted: count, serials: items });
}

// ── Request handler ───────────────────────────────────────────────────────────
export const POST: RequestHandler = async ({ request, locals }) => {
	// Auth is guaranteed by hooks.server.ts for all /admin/* routes,
	// but we double-check here for the API case.
	if (!locals.adminSession) error(401, 'Unauthorized');

	const hmacSecret = env.HMAC_SECRET;
	if (!hmacSecret) error(500, 'HMAC_SECRET not configured');

	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		error(400, 'Invalid JSON');
	}

	const supabase = getServiceClient();
	const action = String(body.action ?? '');

	if (action === 'init') return await handleInit(supabase, body);
	if (action === 'chunk') return await handleChunk(supabase, body, hmacSecret);

	error(400, 'Unknown action — expected "init" or "chunk"');
};
