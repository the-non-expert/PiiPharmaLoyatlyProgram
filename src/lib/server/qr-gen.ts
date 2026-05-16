import { createHmac, timingSafeEqual } from 'crypto';

export const SERIAL_DIGITS = 6;

/** Build a zero-padded serial string, e.g. padSerial('PP', 42) → 'PP-000042' */
export function padSerial(prefix: string, num: number): string {
	return `${prefix}-${String(num).padStart(SERIAL_DIGITS, '0')}`;
}

/** Parse the numeric suffix from a serial, e.g. parseSerialNum('PP-000042') → 42 */
export function parseSerialNum(serial: string): number {
	const idx = serial.lastIndexOf('-');
	if (idx === -1) return 0;
	return parseInt(serial.slice(idx + 1), 10) || 0;
}

/**
 * Compute the 16-hex-char HMAC-SHA256 truncated signature for one sticker.
 * Format: HMAC-SHA256(secret, "{serial}:{productId}:{batchId}")
 */
export function signSerial(secret: string, serial: string, productId: string, batchId: string): string {
	return createHmac('sha256', secret)
		.update(`${serial}:${productId}:${batchId}`)
		.digest('hex')
		.slice(0, 16);
}

/**
 * Constant-time HMAC comparison. Returns true if the supplied hmac matches
 * the recomputed value. Always use this — never plain string ===.
 */
export function verifyHmac(secret: string, serial: string, productId: string, batchId: string, supplied: string): boolean {
	const expected = signSerial(secret, serial, productId, batchId);
	// timingSafeEqual requires equal-length Buffers
	const a = Buffer.from(expected, 'utf8');
	const b = Buffer.from(supplied.padEnd(expected.length).slice(0, expected.length), 'utf8');
	return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Generate `count` serials starting at `startNum` for the given prefix and batchId,
 * signing each with the provided secret.
 * Returns an array of { serial, hmac } objects ready for bulk insert.
 */
export function generateChunk(
	secret: string,
	prefix: string,
	productId: string,
	batchId: string,
	startNum: number,
	count: number
): Array<{ serial: string; hmac: string }> {
	const results: Array<{ serial: string; hmac: string }> = [];
	for (let i = 0; i < count; i++) {
		const serial = padSerial(prefix, startNum + i);
		const hmac = signSerial(secret, serial, productId, batchId);
		results.push({ serial, hmac });
	}
	return results;
}
