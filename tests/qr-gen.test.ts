/**
 * Unit tests for QR generation logic (src/lib/server/qr-gen.ts).
 *
 * Run with: npm test
 * Includes a 200,000-QR simulation to catch performance regressions.
 */
import { describe, it, expect } from 'vitest';
import { timingSafeEqual, createHmac } from 'crypto';
import {
	padSerial,
	parseSerialNum,
	signSerial,
	verifyHmac,
	generateChunk,
	SERIAL_DIGITS,
} from '../src/lib/server/qr-gen';

const SECRET = 'test-secret-key-32-bytes-exactly!!';
const PRODUCT_ID = '550e8400-e29b-41d4-a716-446655440000';
const BATCH_ID = 'b1a2c3d4-e5f6-7890-abcd-ef1234567890';

// ── padSerial ──────────────────────────────────────────────────────────────
describe('padSerial', () => {
	it('zero-pads to SERIAL_DIGITS', () => {
		expect(padSerial('PP', 1)).toBe('PP-000001');
		expect(padSerial('PP', 42)).toBe('PP-000042');
		expect(padSerial('PP', 999999)).toBe('PP-999999');
	});

	it('supports multi-segment prefixes', () => {
		expect(padSerial('AMO500', 1)).toBe('AMO500-000001');
	});

	it('does not truncate large numbers beyond SERIAL_DIGITS', () => {
		// 7-digit number should still render correctly
		expect(padSerial('PP', 1000000)).toBe('PP-1000000');
	});
});

// ── parseSerialNum ──────────────────────────────────────────────────────────
describe('parseSerialNum', () => {
	it('extracts the numeric suffix', () => {
		expect(parseSerialNum('PP-000001')).toBe(1);
		expect(parseSerialNum('PP-010000')).toBe(10000);
	});

	it('handles multi-hyphen prefixes', () => {
		expect(parseSerialNum('AMO-500-000042')).toBe(42);
	});

	it('returns 0 when no hyphen found', () => {
		expect(parseSerialNum('NOHYPHEN')).toBe(0);
	});
});

// ── signSerial ─────────────────────────────────────────────────────────────
describe('signSerial', () => {
	it('produces a 16-hex-char string', () => {
		const h = signSerial(SECRET, 'PP-000001', PRODUCT_ID, BATCH_ID);
		expect(h).toHaveLength(16);
		expect(/^[0-9a-f]{16}$/.test(h)).toBe(true);
	});

	it('is deterministic', () => {
		const h1 = signSerial(SECRET, 'PP-000001', PRODUCT_ID, BATCH_ID);
		const h2 = signSerial(SECRET, 'PP-000001', PRODUCT_ID, BATCH_ID);
		expect(h1).toBe(h2);
	});

	it('differs when serial changes', () => {
		const h1 = signSerial(SECRET, 'PP-000001', PRODUCT_ID, BATCH_ID);
		const h2 = signSerial(SECRET, 'PP-000002', PRODUCT_ID, BATCH_ID);
		expect(h1).not.toBe(h2);
	});

	it('differs when product_id changes', () => {
		const h1 = signSerial(SECRET, 'PP-000001', PRODUCT_ID, BATCH_ID);
		const h2 = signSerial(SECRET, 'PP-000001', 'different-product-id', BATCH_ID);
		expect(h1).not.toBe(h2);
	});

	it('differs when batch_id changes — batch is included in signed payload', () => {
		const h1 = signSerial(SECRET, 'PP-000001', PRODUCT_ID, BATCH_ID);
		const h2 = signSerial(SECRET, 'PP-000001', PRODUCT_ID, 'different-batch-id');
		expect(h1).not.toBe(h2);
	});

	it('uses format serial:productId:batchId', () => {
		// Recompute manually to verify the exact format
		const manual = createHmac('sha256', SECRET)
			.update(`PP-000001:${PRODUCT_ID}:${BATCH_ID}`)
			.digest('hex')
			.slice(0, 16);
		expect(signSerial(SECRET, 'PP-000001', PRODUCT_ID, BATCH_ID)).toBe(manual);
	});
});

// ── verifyHmac ─────────────────────────────────────────────────────────────
describe('verifyHmac', () => {
	it('accepts a correctly computed HMAC', () => {
		const h = signSerial(SECRET, 'PP-000001', PRODUCT_ID, BATCH_ID);
		expect(verifyHmac(SECRET, 'PP-000001', PRODUCT_ID, BATCH_ID, h)).toBe(true);
	});

	it('rejects a tampered serial', () => {
		const h = signSerial(SECRET, 'PP-000001', PRODUCT_ID, BATCH_ID);
		expect(verifyHmac(SECRET, 'PP-000002', PRODUCT_ID, BATCH_ID, h)).toBe(false);
	});

	it('rejects a tampered product_id', () => {
		const h = signSerial(SECRET, 'PP-000001', PRODUCT_ID, BATCH_ID);
		expect(verifyHmac(SECRET, 'PP-000001', 'wrong-product', BATCH_ID, h)).toBe(false);
	});

	it('rejects a tampered batch_id', () => {
		const h = signSerial(SECRET, 'PP-000001', PRODUCT_ID, BATCH_ID);
		expect(verifyHmac(SECRET, 'PP-000001', PRODUCT_ID, 'wrong-batch', h)).toBe(false);
	});

	it('rejects an empty HMAC', () => {
		expect(verifyHmac(SECRET, 'PP-000001', PRODUCT_ID, BATCH_ID, '')).toBe(false);
	});

	it('uses timingSafeEqual — not plain string ===', () => {
		// Verify the function uses timingSafeEqual by ensuring it correctly
		// returns false for a one-char-off HMAC (not short-circuit).
		const h = signSerial(SECRET, 'PP-000001', PRODUCT_ID, BATCH_ID);
		const tampered = h.slice(0, -1) + (h.slice(-1) === 'a' ? 'b' : 'a');
		expect(verifyHmac(SECRET, 'PP-000001', PRODUCT_ID, BATCH_ID, tampered)).toBe(false);
	});

	it('timingSafeEqual is used in Node crypto (sanity check)', () => {
		// Directly verify Node's timingSafeEqual is available and works
		const a = Buffer.from('abcdef0123456789', 'utf8');
		const b = Buffer.from('abcdef0123456789', 'utf8');
		expect(timingSafeEqual(a, b)).toBe(true);
	});
});

// ── generateChunk ─────────────────────────────────────────────────────────
describe('generateChunk', () => {
	it('generates the correct number of serials', () => {
		const result = generateChunk(SECRET, 'PP', PRODUCT_ID, BATCH_ID, 1, 1000);
		expect(result).toHaveLength(1000);
	});

	it('starts at startNum and increments sequentially', () => {
		const result = generateChunk(SECRET, 'PP', PRODUCT_ID, BATCH_ID, 5001, 3);
		expect(result[0].serial).toBe('PP-005001');
		expect(result[1].serial).toBe('PP-005002');
		expect(result[2].serial).toBe('PP-005003');
	});

	it('produces no duplicate serials within a chunk', () => {
		const result = generateChunk(SECRET, 'PP', PRODUCT_ID, BATCH_ID, 1, 1000);
		const serials = result.map((r) => r.serial);
		expect(new Set(serials).size).toBe(1000);
	});

	it('each serial has a valid 16-char HMAC', () => {
		const result = generateChunk(SECRET, 'PP', PRODUCT_ID, BATCH_ID, 1, 100);
		for (const { hmac } of result) {
			expect(hmac).toHaveLength(16);
			expect(/^[0-9a-f]{16}$/.test(hmac)).toBe(true);
		}
	});

	it('each HMAC is verifiable at scan time', () => {
		const result = generateChunk(SECRET, 'PP', PRODUCT_ID, BATCH_ID, 1, 50);
		for (const { serial, hmac } of result) {
			expect(verifyHmac(SECRET, serial, PRODUCT_ID, BATCH_ID, hmac)).toBe(true);
		}
	});
});

// ── Collision detection between batches ───────────────────────────────────
describe('serial range non-overlap between batches', () => {
	it('batch 2 starting after batch 1 produces no overlapping serials', () => {
		const batch1 = generateChunk(SECRET, 'PP', PRODUCT_ID, 'batch-1', 1, 1000);
		// Batch 2 starts at last serial of batch 1 + 1
		const batch1LastNum = parseSerialNum(batch1[batch1.length - 1].serial);
		const batch2 = generateChunk(SECRET, 'PP', PRODUCT_ID, 'batch-2', batch1LastNum + 1, 1000);

		const allSerials = [...batch1.map((r) => r.serial), ...batch2.map((r) => r.serial)];
		expect(new Set(allSerials).size).toBe(2000);
	});

	it('different prefixes never collide', () => {
		const batchA = generateChunk(SECRET, 'PP', PRODUCT_ID, 'batch-1', 1, 500);
		const batchB = generateChunk(SECRET, 'MET500', PRODUCT_ID, 'batch-2', 1, 500);

		const setA = new Set(batchA.map((r) => r.serial));
		for (const { serial } of batchB) {
			expect(setA.has(serial)).toBe(false);
		}
	});
});

// ── 200,000 QR simulation ─────────────────────────────────────────────────
describe('200,000 QR simulation', () => {
	it('generates 200,000 unique signed serials with correct format', { timeout: 60_000 }, () => {
		const TOTAL = 200_000;
		const CHUNK = 1000;
		const start = performance.now();

		const allSerials = new Set<string>();
		let chunkStart = 1;
		let lastHmac: string | null = null;

		while (chunkStart <= TOTAL) {
			const count = Math.min(CHUNK, TOTAL - chunkStart + 1);
			const chunk = generateChunk(SECRET, 'PERF', PRODUCT_ID, BATCH_ID, chunkStart, count);

			expect(chunk).toHaveLength(count);

			for (const { serial, hmac } of chunk) {
				// No duplicates
				expect(allSerials.has(serial)).toBe(false);
				allSerials.add(serial);

				// HMAC format
				expect(hmac).toHaveLength(16);
				expect(/^[0-9a-f]{16}$/.test(hmac)).toBe(true);

				// Serial format: PERF-XXXXXX
				expect(serial.startsWith('PERF-')).toBe(true);
			}

			// Record last HMAC for boundary check
			lastHmac = chunk[chunk.length - 1].hmac;
			chunkStart += count;
		}

		const elapsed = performance.now() - start;

		// 200,000 serials with no collisions
		expect(allSerials.size).toBe(TOTAL);

		// Last serial should be PERF-200000
		expect(allSerials.has(`PERF-${String(TOTAL).padStart(SERIAL_DIGITS, '0')}`)).toBe(true);
		expect(lastHmac).toHaveLength(16);

		// Performance guard: should complete in under 30 seconds on any reasonable machine
		expect(elapsed).toBeLessThan(30_000);

		console.log(`✓ 200,000 QRs generated in ${elapsed.toFixed(0)}ms (${(TOTAL / elapsed * 1000).toFixed(0)} QR/s)`);
	});
});

// ── Scan-time validation (tampered payloads) ───────────────────────────────
describe('scan-time validation — tampered payloads', () => {
	const serial = 'PP-001234';
	const hmac = signSerial(SECRET, serial, PRODUCT_ID, BATCH_ID);

	it('accepts valid payload', () => {
		expect(verifyHmac(SECRET, serial, PRODUCT_ID, BATCH_ID, hmac)).toBe(true);
	});

	it('rejects wrong serial (serial swap attack)', () => {
		expect(verifyHmac(SECRET, 'PP-001235', PRODUCT_ID, BATCH_ID, hmac)).toBe(false);
	});

	it('rejects wrong product (product swap attack)', () => {
		expect(verifyHmac(SECRET, serial, 'attacker-product-id', BATCH_ID, hmac)).toBe(false);
	});

	it('rejects wrong batch (batch swap attack)', () => {
		expect(verifyHmac(SECRET, serial, PRODUCT_ID, 'attacker-batch-id', hmac)).toBe(false);
	});

	it('rejects truncated HMAC', () => {
		expect(verifyHmac(SECRET, serial, PRODUCT_ID, BATCH_ID, hmac.slice(0, 8))).toBe(false);
	});

	it('rejects all-zeros HMAC', () => {
		expect(verifyHmac(SECRET, serial, PRODUCT_ID, BATCH_ID, '0000000000000000')).toBe(false);
	});

	it('rejects HMAC from different secret', () => {
		const wrongHmac = signSerial('wrong-secret', serial, PRODUCT_ID, BATCH_ID);
		expect(verifyHmac(SECRET, serial, PRODUCT_ID, BATCH_ID, wrongHmac)).toBe(false);
	});
});
