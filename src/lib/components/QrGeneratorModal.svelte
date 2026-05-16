<script lang="ts">
	import { fade } from 'svelte/transition';

	let {
		open = false,
		product,
		onclose
	}: {
		open?: boolean;
		product: { id: string; name: string } | null;
		onclose: () => void;
	} = $props();

	type Phase = 'form' | 'progress' | 'success' | 'error';

	// Form values
	let fBatchId = $state('');
	let fQuantity = $state(1000);
	let fSerialPrefix = $state('');
	let fFormat = $state<'pdf' | 'zip'>('pdf');

	// Touched tracking (validate on blur after first touch)
	let tBatchId = $state(false);
	let tQuantity = $state(false);
	let tSerialPrefix = $state(false);

	// Errors
	let eBatchId = $state('');
	let eQuantity = $state('');
	let eSerialPrefix = $state('');

	// Phase
	let phase = $state<Phase>('form');

	// Progress
	let progDone = $state(0);
	let progTotal = $state(1000);
	let progStarted = $state(0);
	let progIntervalId: ReturnType<typeof setInterval> | null = null;
	let nowIntervalId: ReturnType<typeof setInterval> | null = null;
	let now = $state(0);

	// Success
	let successData = $state<{
		batchId: string;
		quantity: number;
		serialStart: string;
		serialEnd: string;
		format: 'pdf' | 'zip';
		fileSize: string;
		pages: number | null;
		filename: string;
		generatedAt: string;
	} | null>(null);

	// Error
	let errCode = $state('');
	let errMessage = $state('');

	// Discard confirmation
	let discardOpen = $state(false);

	// ── Derived ────────────────────────────────────────────────────────────────
	const prefix = $derived(fSerialPrefix.toUpperCase().trim() || 'PP');
	const qty = $derived(fQuantity || 0);
	const serialStart = $derived(`${prefix}-000001`);
	const serialEnd = $derived(`${prefix}-${String(qty).padStart(6, '0')}`);
	const qrSeed = $derived(`${serialStart}:${fBatchId || 'BATCH'}`);
	const formPayload = $derived(
		product
			? `https://piipharma.in/q/${serialStart}?b=${fBatchId || 'BATCH-ID'}&p=${product.id.slice(0, 8)}&h=a1f3b9c7`
			: ''
	);
	const progPct = $derived(progTotal > 0 ? Math.round((progDone / progTotal) * 100) : 0);
	const progEta = $derived.by(() => {
		if (progDone <= 0 || progStarted <= 0 || now <= progStarted) return null;
		const elapsed = now - progStarted;
		const rate = progDone / elapsed;
		const remaining = progTotal - progDone;
		if (rate <= 0) return null;
		return Math.max(0, Math.round(remaining / rate / 1000));
	});
	const formValid = $derived.by(() => {
		const bid = fBatchId.trim();
		if (!bid || bid.length > 32 || !/^[A-Z0-9-]+$/.test(bid)) return false;
		const n = fQuantity;
		if (!Number.isInteger(n) || n < 1 || n > 10000) return false;
		const sp = fSerialPrefix.trim();
		if (!sp || sp.length > 8 || !/^[A-Z0-9-]+$/i.test(sp)) return false;
		return true;
	});
	const formDirty = $derived(fBatchId !== '' || fQuantity !== 1000 || fSerialPrefix !== '');
	const modalWidth = $derived(phase === 'form' ? '720px' : phase === 'error' ? '620px' : '560px');

	// ── Sample QR computation ───────────────────────────────────────────────────
	type QrRect = { x: number; y: number; s: number };
	const qrData = $derived.by((): QrRect[] => {
		const seed = qrSeed;
		const N = 25;
		const size = 156;
		const px = size / N;

		let h = 0;
		for (let i = 0; i < seed.length; i++) h = ((h * 31 + seed.charCodeAt(i)) | 0);

		const bit = (r: number, c: number) => {
			let x = ((r * 91 + c * 53 + h) | 0);
			x = (x ^ (x << 13)) | 0;
			x = (x ^ (x >>> 17)) | 0;
			x = (x ^ (x << 5)) | 0;
			return (x & 7) < 3;
		};

		const inBox = (r: number, c: number, rr: number, cc: number) =>
			r >= rr && r < rr + 7 && c >= cc && c < cc + 7;

		const markerDark = (r: number, c: number, rr: number, cc: number) => {
			const lr = r - rr, lc = c - cc;
			return lr === 0 || lr === 6 || lc === 0 || lc === 6 || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
		};

		const rects: QrRect[] = [];
		for (let r = 0; r < N; r++) {
			for (let c = 0; c < N; c++) {
				let dark = false;
				if (inBox(r, c, 0, 0)) dark = markerDark(r, c, 0, 0);
				else if (inBox(r, c, 0, N - 7)) dark = markerDark(r, c, 0, N - 7);
				else if (inBox(r, c, N - 7, 0)) dark = markerDark(r, c, N - 7, 0);
				else dark = bit(r, c);
				if (dark) rects.push({ x: c * px, y: r * px, s: px });
			}
		}
		return rects;
	});

	// ── Validation ─────────────────────────────────────────────────────────────
	function validateBatchId() {
		const bid = fBatchId.trim();
		if (!bid) { eBatchId = 'Batch ID is required'; return false; }
		if (!/^[A-Z0-9-]+$/.test(bid)) { eBatchId = 'Uppercase letters, digits, and hyphens only'; return false; }
		if (bid.length > 32) { eBatchId = 'Max 32 characters'; return false; }
		eBatchId = '';
		return true;
	}

	function validateQuantity() {
		const n = fQuantity;
		if (!n && n !== 0) { eQuantity = 'Quantity is required'; return false; }
		if (!Number.isInteger(n)) { eQuantity = 'Whole numbers only'; return false; }
		if (n < 1) { eQuantity = 'Quantity must be at least 1'; return false; }
		if (n > 10000) { eQuantity = "Quantity can't exceed 10,000 per batch"; return false; }
		eQuantity = '';
		return true;
	}

	function validateSerialPrefix() {
		const sp = fSerialPrefix.trim();
		if (!sp) { eSerialPrefix = 'Serial prefix is required'; return false; }
		if (sp.length > 8) { eSerialPrefix = 'Max 8 characters'; return false; }
		if (!/^[A-Z0-9-]+$/i.test(sp)) { eSerialPrefix = 'Uppercase letters, digits, hyphens only'; return false; }
		eSerialPrefix = '';
		return true;
	}

	// Derive a meaningful, mostly-unique prefix from a medicine name.
	// Strategy: first 3 alpha chars of the primary drug name (salt forms stripped)
	// + dose digits (up to 4) → e.g. "Amoxicillin 500mg" → "AMO500",
	// "Metformin HCl 1000mg" → "MET1000", "Co-Amoxiclav 625mg" → "COA625".
	function derivePrefix(name: string): string {
		const SALTS = /\b(HYDROCHLORIDE|HCL|HBR|HYDROBROMIDE|SODIUM|POTASSIUM|CALCIUM|MAGNESIUM|ZINC|SULPHATE|SULFATE|PHOSPHATE|ACETATE|CITRATE|TARTRATE|MALEATE|FUMARATE|MESYLATE|BESYLATE|TOSYLATE|SUCCINATE|GLUCONATE|LACTATE|TRIHYDRATE|MONOHYDRATE|ANHYDROUS|DIHYDRATE|AXETIL|PROXETIL|PIVOXIL|ESTER)\b/g;

		const upper = name.toUpperCase();

		// Extract dose: number immediately before a recognised unit
		const doseMatch = upper.match(/(\d{1,4})\s*(?:MCG|MG|G\b|IU\b|ML\b|%)/);
		const dose = doseMatch ? doseMatch[1] : (upper.match(/\d{1,4}/) || [''])[0];

		// Drug name = everything before the first digit
		const drugRaw = upper.replace(/\d.*$/, '').trim();

		// Strip salt/form descriptors, collapse separators, take first token
		const drugClean = drugRaw.replace(SALTS, '').replace(/[-\s]+/g, ' ').trim();
		const firstToken = (drugClean.split(' ')[0] || drugRaw).replace(/[^A-Z]/g, '');

		const abbrev = firstToken.slice(0, 3);
		return (abbrev + dose).slice(0, 8);
	}

	// Pre-fill serial prefix and suggested batch label when modal opens
	$effect(() => {
		if (product) {
			fSerialPrefix = derivePrefix(product.name);
		}
	});

	$effect(() => {
		if (open && product) {
			fetch('/admin/qr/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'suggest', product_id: product.id })
			})
				.then(r => r.json())
				.then((d: { suggested_label?: string }) => { if (d.suggested_label) fBatchId = d.suggested_label; })
				.catch(() => {});
		}
	});

	function trySubmit() {
		tBatchId = true; tQuantity = true; tSerialPrefix = true;
		const v1 = validateBatchId();
		const v2 = validateQuantity();
		const v3 = validateSerialPrefix();
		if (!v1 || !v2 || !v3) return;
		startGeneration();
	}

	// ── Real generation ─────────────────────────────────────────────────────────
	const CHUNK_SIZE = 1000;
	const PARALLEL = 3;

	// Accumulated serials+HMACs from all chunk responses (used for rendering)
	let generatedSerials = $state<Array<{ serial: string; hmac: string }>>([]);
	// Download blob URL for triggering the browser download
	let downloadUrl = $state('');
	let downloadName = $state('');
	// Cancellation flag — checked between parallel group rounds
	let cancelled = false;

	async function startGeneration() {
		if (!product) return;
		const total = fQuantity || 1000;
		progDone = 0;
		progTotal = total;
		progStarted = Date.now();
		now = Date.now();
		phase = 'progress';
		cancelled = false;
		generatedSerials = [];
		downloadUrl = '';

		nowIntervalId = setInterval(() => { now = Date.now(); }, 200);

		try {
			// Phase 1: init — create batch row, get batch_id and serial start num
			const initRes = await fetch('/admin/qr/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'init',
					product_id: product.id,
					batch_label: fBatchId,
					prefix: prefix,
					quantity: total
				})
			});

			if (!initRes.ok) {
				const err = await initRes.json().catch(() => ({}));
				throw { code: 'INIT_FAILED', message: (err as { message?: string }).message ?? 'Failed to initialise batch' };
			}

			const { batch_id, start_num, serial_start, serial_end } = await initRes.json() as {
				batch_id: string; start_num: number; serial_start: string; serial_end: string;
			};

			// Phase 2: chunked generation — 3 chunks in parallel
			const numChunks = Math.ceil(total / CHUNK_SIZE);

			for (let groupStart = 0; groupStart < numChunks; groupStart += PARALLEL) {
				if (cancelled) { phase = 'form'; return; }

				const groupEnd = Math.min(groupStart + PARALLEL, numChunks);
				const promises = [];

				for (let ci = groupStart; ci < groupEnd; ci++) {
					const chunkStartNum = start_num + ci * CHUNK_SIZE;
					const count = Math.min(CHUNK_SIZE, total - ci * CHUNK_SIZE);

					promises.push(
						fetch('/admin/qr/generate', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								action: 'chunk',
								batch_id,
								product_id: product.id,
								prefix: prefix,
								start_num: chunkStartNum,
								count
							})
						}).then(async (r) => {
							if (!r.ok) {
								const err = await r.json().catch(() => ({}));
								throw { code: 'CHUNK_FAILED', message: (err as { message?: string }).message ?? 'Chunk failed' };
							}
							const data = await r.json() as { inserted: number; serials: Array<{ serial: string; hmac: string }> };
							generatedSerials = [...generatedSerials, ...data.serials];
							progDone = Math.min(progDone + data.inserted, total);
						})
					);
				}

				await Promise.all(promises);
			}

			if (cancelled) { phase = 'form'; return; }

			// Phase 3: render output (client-side, heavy but avoids server memory)
			progDone = total; // snap to 100%
			const fmt = fFormat;
			const filename = `piipharma_${product.name.toLowerCase().replace(/\s+/g, '-')}_${fBatchId}.${fmt === 'pdf' ? 'pdf' : 'zip'}`;

			const blob = fmt === 'pdf'
				? await renderPdf(generatedSerials, product.id, batch_id)
				: await renderZip(generatedSerials, product.id, batch_id);

			const fileSizeMb = (blob.size / 1024 / 1024).toFixed(1);
			downloadUrl = URL.createObjectURL(blob);
			downloadName = filename;

			// Trigger download automatically
			const a = document.createElement('a');
			a.href = downloadUrl;
			a.download = downloadName;
			a.click();

			successData = {
				batchId: fBatchId,
				quantity: total,
				serialStart: serial_start,
				serialEnd: serial_end,
				format: fmt,
				fileSize: `${fileSizeMb} MB`,
				pages: fmt === 'pdf' ? Math.ceil(total / 35) : null,
				filename,
				generatedAt: new Date().toLocaleString('en-IN', {
					day: 'numeric', month: 'short', year: 'numeric',
					hour: '2-digit', minute: '2-digit', hour12: false
				})
			};
			phase = 'success';

		} catch (e: unknown) {
			const err = e as { code?: string; message?: string };
			errCode = err.code ?? 'UNKNOWN_ERROR';
			errMessage = err.message ?? 'An unexpected error occurred. Please try again.';
			phase = 'error';
		} finally {
			if (nowIntervalId) { clearInterval(nowIntervalId); nowIntervalId = null; }
		}
	}

	// ── PDF rendering ─────────────────────────────────────────────────────────
	// 35 codes per page (5 cols × 7 rows), A4 portrait.
	const COLS = 5, ROWS = 7, PER_PAGE = COLS * ROWS;

	async function renderPdf(
		serials: Array<{ serial: string; hmac: string }>,
		productId: string,
		batchId: string
	): Promise<Blob> {
		const [{ default: jsPDF }, { default: QRCode }] = await Promise.all([
			import('jspdf'),
			import('qrcode')
		]);
		const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
		const pageW = doc.internal.pageSize.getWidth();
		const pageH = doc.internal.pageSize.getHeight();
		const cellW = pageW / COLS;
		const cellH = pageH / ROWS;
		const qrSize = Math.min(cellW, cellH) * 0.72; // QR square within cell
		const margin = (cellW - qrSize) / 2;

		const offscreen = document.createElement('canvas');
		offscreen.width = 200;
		offscreen.height = 200;

		for (let i = 0; i < serials.length; i++) {
			const { serial, hmac } = serials[i];
			const pageIdx = Math.floor(i / PER_PAGE);
			const posInPage = i % PER_PAGE;
			const col = posInPage % COLS;
			const row = Math.floor(posInPage / COLS);

			if (posInPage === 0 && pageIdx > 0) doc.addPage();

			const payload = JSON.stringify({ s: serial, p: productId, b: batchId, h: hmac });
			await QRCode.toCanvas(offscreen, payload, { width: 200, margin: 1, errorCorrectionLevel: 'M' });

			const x = col * cellW + margin;
			const y = row * cellH + margin * 0.5;
			doc.addImage(offscreen.toDataURL('image/png'), 'PNG', x, y, qrSize, qrSize);

			// Serial label below QR
			doc.setFontSize(5.5);
			doc.setTextColor(60, 60, 60);
			doc.text(serial, x + qrSize / 2, y + qrSize + 2.5, { align: 'center' });
		}

		return doc.output('blob');
	}

	// ── PNG sheet rendering ───────────────────────────────────────────────────
	// A4 at 300 DPI = 2480×3508 px, 35 codes per sheet.
	const SHEET_W = 2480, SHEET_H = 3508;

	async function renderZip(
		serials: Array<{ serial: string; hmac: string }>,
		productId: string,
		batchId: string
	): Promise<Blob> {
		const [{ default: JSZip }, { default: QRCode }] = await Promise.all([
			import('jszip'),
			import('qrcode')
		]);
		const zip = new JSZip();
		const numSheets = Math.ceil(serials.length / PER_PAGE);
		const cellW = Math.floor(SHEET_W / COLS);
		const cellH = Math.floor(SHEET_H / ROWS);
		const qrPx = Math.floor(Math.min(cellW, cellH) * 0.78);

		const canvas = document.createElement('canvas');
		canvas.width = SHEET_W;
		canvas.height = SHEET_H;
		const ctx = canvas.getContext('2d')!;

		const offscreen = document.createElement('canvas');
		offscreen.width = qrPx;
		offscreen.height = qrPx;

		for (let sheet = 0; sheet < numSheets; sheet++) {
			ctx.fillStyle = '#ffffff';
			ctx.fillRect(0, 0, SHEET_W, SHEET_H);

			for (let pos = 0; pos < PER_PAGE; pos++) {
				const idx = sheet * PER_PAGE + pos;
				if (idx >= serials.length) break;

				const { serial, hmac } = serials[idx];
				const col = pos % COLS;
				const row = Math.floor(pos / COLS);
				const x = col * cellW + Math.floor((cellW - qrPx) / 2);
				const y = row * cellH + Math.floor((cellH - qrPx) / 2) - 20;

				const payload = JSON.stringify({ s: serial, p: productId, b: batchId, h: hmac });
				await QRCode.toCanvas(offscreen, payload, { width: qrPx, margin: 1, errorCorrectionLevel: 'M' });
				ctx.drawImage(offscreen, x, y);

				// Serial label
				ctx.fillStyle = '#333333';
				ctx.font = `bold ${Math.floor(cellH * 0.07)}px monospace`;
				ctx.textAlign = 'center';
				ctx.fillText(serial, col * cellW + cellW / 2, y + qrPx + Math.floor(cellH * 0.08));
			}

			const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png'));
			zip.file(`sheet_${String(sheet + 1).padStart(4, '0')}.png`, blob);
		}

		return await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
	}

	function cancelGeneration() {
		cancelled = true;
		if (progIntervalId) { clearInterval(progIntervalId); progIntervalId = null; }
		if (nowIntervalId) { clearInterval(nowIntervalId); nowIntervalId = null; }
		phase = 'form';
	}

	function generateAnother() {
		fBatchId = ''; fQuantity = 1000;
		tBatchId = false; tQuantity = false; tSerialPrefix = false;
		eBatchId = ''; eQuantity = ''; eSerialPrefix = '';
		successData = null;
		phase = 'form';
	}

	function resetAndClose() {
		if (progIntervalId) { clearInterval(progIntervalId); progIntervalId = null; }
		if (nowIntervalId) { clearInterval(nowIntervalId); nowIntervalId = null; }
		phase = 'form';
		fBatchId = ''; fQuantity = 1000; fSerialPrefix = ''; fFormat = 'pdf';
		tBatchId = false; tQuantity = false; tSerialPrefix = false;
		eBatchId = ''; eQuantity = ''; eSerialPrefix = '';
		successData = null;
		discardOpen = false;
		onclose();
	}

	function handleClose() {
		if (phase === 'form' && formDirty) { discardOpen = true; return; }
		resetAndClose();
	}

	function handleBackdropClick() { handleClose(); }

	function handleKeydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') handleClose();
		if (e.key === 'Enter' && phase === 'form' && document.activeElement?.tagName !== 'BUTTON') trySubmit();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- Backdrop -->
	<div
		class="modal-backdrop"
		role="presentation"
		onclick={handleBackdropClick}
		transition:fade={{ duration: 180 }}
		style="position:fixed;inset:0;background:rgba(20,31,46,0.42);backdrop-filter:blur(0.5px);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;"
	>
		<!-- Shell — stopPropagation prevents backdrop-close when clicking inside -->
		<div
			class="modal-shell"
			role="dialog"
			aria-modal="true"
			aria-label="Generate QR codes"
			onclick={(e) => e.stopPropagation()}
			style="background:#fff;border-radius:14px;box-shadow:0 24px 60px rgba(0,0,0,0.28),0 4px 12px rgba(0,0,0,0.12);width:100%;max-width:{modalWidth};max-height:85vh;overflow-y:auto;font-family:'Montserrat',sans-serif;animation:qrPopIn 180ms ease both;"
		>

		<!-- ══════════════════ FORM PHASE ══════════════════ -->
		{#if phase === 'form'}
			<!-- Header -->
			<div style="display:flex;align-items:flex-start;gap:12px;padding:18px 24px;border-bottom:1px solid #EAEAEA;">
				<div style="width:36px;height:36px;background:#e8f1fb;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
						<rect x="3" y="3" width="7" height="7" rx="1" stroke="#2372B9" stroke-width="2"/>
						<rect x="14" y="3" width="7" height="7" rx="1" stroke="#2372B9" stroke-width="2"/>
						<rect x="3" y="14" width="7" height="7" rx="1" stroke="#2372B9" stroke-width="2"/>
						<path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 19h2M19 14h2" stroke="#2372B9" stroke-width="2" stroke-linecap="square"/>
					</svg>
				</div>
				<div style="flex:1;">
					<div style="font-size:15px;font-weight:700;color:#474545;line-height:1.2;">Generate QR Codes — {product?.name ?? ''}</div>
					<div style="font-size:11.5px;color:#686868;margin-top:3px;">Each sticker encodes a unique serial + batch + signed HMAC.</div>
				</div>
				<button type="button" onclick={handleClose} style="width:28px;height:28px;border:none;background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:6px;color:#686868;flex-shrink:0;" onmouseenter={(e) => (e.currentTarget.style.background='#F4F6F8')} onmouseleave={(e) => (e.currentTarget.style.background='none')}>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
				</button>
			</div>

			<!-- Body: 2-col -->
			<div class="modal-form-grid" style="display:grid;grid-template-columns:1fr 220px;gap:24px;padding:22px 24px;">
				<!-- Left: form -->
				<div style="display:flex;flex-direction:column;gap:16px;">
					<!-- Product (read-only) -->
					<div>
						<label style="display:block;font-size:12px;font-weight:700;color:#474545;margin-bottom:5px;">Product</label>
						<div style="background:#F4F6F8;border:1.5px solid #EAEAEA;border-radius:7px;padding:9px 12px;font-size:13px;color:#686868;">{product?.name ?? ''}</div>
					</div>

					<!-- Batch ID + Quantity row -->
					<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
						<!-- Batch ID -->
						<div>
							<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5px;">
								<label style="font-size:12px;font-weight:700;color:#474545;">Batch ID <span style="color:#E53E3E;">*</span></label>
								{#if tBatchId && eBatchId}
									<span style="display:flex;align-items:center;gap:3px;font-size:10.5px;color:#E53E3E;"><span style="width:4px;height:4px;border-radius:50%;background:#E53E3E;display:inline-block;"></span>{eBatchId}</span>
								{:else}
									<span style="font-size:10px;color:#686868;">e.g. MAY-2026-A</span>
								{/if}
							</div>
							<input
								type="text"
								placeholder="MAY-2026-A"
								bind:value={fBatchId}
								oninput={() => { fBatchId = fBatchId.toUpperCase(); if (tBatchId) validateBatchId(); }}
								onblur={() => { tBatchId = true; validateBatchId(); }}
								style="width:100%;box-sizing:border-box;border:{tBatchId && eBatchId ? '1.5px solid #E53E3E;box-shadow:0 0 0 3px #fde8e8' : '1.5px solid #EAEAEA'};border-radius:7px;padding:9px 12px;font-family:'Montserrat',sans-serif;font-size:13px;color:#474545;outline:none;height:38px;"
							/>
							<div style="font-size:10px;color:#686868;margin-top:3px;">Used to label this print run</div>
						</div>

						<!-- Quantity -->
						<div>
							<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5px;">
								<label style="font-size:12px;font-weight:700;color:#474545;">Quantity <span style="color:#E53E3E;">*</span></label>
								{#if tQuantity && eQuantity}
									<span style="display:flex;align-items:center;gap:3px;font-size:10.5px;color:#E53E3E;"><span style="width:4px;height:4px;border-radius:50%;background:#E53E3E;display:inline-block;"></span>{eQuantity}</span>
								{:else}
									<span style="font-size:10px;color:#686868;">1 – 10,000</span>
								{/if}
							</div>
							<input
								type="number"
								min="1"
								max="10000"
								placeholder="1000"
								bind:value={fQuantity}
								oninput={() => { if (tQuantity) validateQuantity(); }}
								onblur={() => { tQuantity = true; validateQuantity(); }}
								style="width:100%;box-sizing:border-box;border:{tQuantity && eQuantity ? '1.5px solid #E53E3E;box-shadow:0 0 0 3px #fde8e8' : '1.5px solid #EAEAEA'};border-radius:7px;padding:9px 12px;font-family:'Montserrat',sans-serif;font-size:13px;color:#474545;outline:none;height:38px;"
							/>
						</div>
					</div>

					<!-- Serial prefix -->
					<div>
						<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5px;">
							<label style="font-size:12px;font-weight:700;color:#474545;">Serial prefix <span style="color:#E53E3E;">*</span></label>
							{#if tSerialPrefix && eSerialPrefix}
								<span style="display:flex;align-items:center;gap:3px;font-size:10.5px;color:#E53E3E;"><span style="width:4px;height:4px;border-radius:50%;background:#E53E3E;display:inline-block;"></span>{eSerialPrefix}</span>
							{/if}
						</div>
						<input
							type="text"
							placeholder="e.g. PP"
							bind:value={fSerialPrefix}
							oninput={() => { fSerialPrefix = fSerialPrefix.toUpperCase(); if (tSerialPrefix) validateSerialPrefix(); }}
							onblur={() => { tSerialPrefix = true; validateSerialPrefix(); }}
							style="width:100%;box-sizing:border-box;border:{tSerialPrefix && eSerialPrefix ? '1.5px solid #E53E3E;box-shadow:0 0 0 3px #fde8e8' : '1.5px solid #EAEAEA'};border-radius:7px;padding:9px 12px;font-family:'Montserrat',sans-serif;font-size:13px;color:#474545;outline:none;height:38px;"
						/>
						<div style="font-size:10px;color:#686868;margin-top:3px;">Format: <span style="font-family:monospace;font-weight:600;">{prefix}-XXXXXX</span> — exact range assigned at generation</div>
					</div>

					<!-- Output format -->
					<div>
						<label style="display:block;font-size:12px;font-weight:700;color:#474545;margin-bottom:7px;">Output format <span style="color:#E53E3E;">*</span></label>
						<div style="display:flex;background:#F4F6F8;border:1px solid #EAEAEA;border-radius:8px;padding:3px;gap:2px;">
							{#each [{ v: 'pdf', label: 'PDF sheet' }, { v: 'zip', label: 'ZIP of PNGs' }] as opt}
								<button
									type="button"
									onclick={() => fFormat = opt.v as 'pdf' | 'zip'}
									style="flex:1;padding:7px 14px;font-size:12px;font-weight:{fFormat === opt.v ? 700 : 600};font-family:'Montserrat',sans-serif;border:none;border-radius:6px;cursor:pointer;transition:all 120ms;background:{fFormat === opt.v ? '#fff' : 'transparent'};color:{fFormat === opt.v ? '#2372B9' : '#686868'};box-shadow:{fFormat === opt.v ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'};"
								>{opt.label}</button>
							{/each}
						</div>
						<div style="font-size:10.5px;color:#686868;margin-top:6px;">
							{#if fFormat === 'pdf'}A4 sheet, 35 stickers per page (5 × 7 grid, 38 × 38 mm each). Print-ready.
							{:else}One 600 × 600 px PNG per code, named by serial. ZIP archive.{/if}
						</div>
					</div>
				</div>

				<!-- Right: sample preview -->
				<div style="display:flex;flex-direction:column;gap:10px;">
					<div style="font-size:10px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.08em;">Sample preview</div>
					<div style="background:#F4F6F8;border-radius:10px;border:1px solid #EAEAEA;padding:14px;display:flex;flex-direction:column;align-items:center;gap:10px;">
						<!-- QR tile -->
						<div style="background:#fff;border-radius:8px;border:1px solid #EAEAEA;padding:10px;display:inline-block;">
							<svg width="156" height="156" viewBox="0 0 156 156">
								{#each qrData as cell}
									<rect x={cell.x} y={cell.y} width={cell.s} height={cell.s} fill="#1a1a1a"/>
								{/each}
							</svg>
						</div>
						<div style="font-family:monospace;font-size:11px;font-weight:700;color:#474545;">{serialStart}</div>
					</div>
					<!-- Payload preview -->
					<div style="background:#F4F6F8;border-radius:8px;border:1px solid #EAEAEA;padding:10px;">
						<div style="font-size:9px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:5px;">Encoded payload</div>
						<div style="font-family:monospace;font-size:9.5px;color:#474545;line-height:1.5;word-break:break-all;">{formPayload}</div>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 24px;border-top:1px solid #EAEAEA;background:#fbfbfc;border-radius:0 0 14px 14px;">
				<span style="font-size:11px;color:#686868;">Stickers can be reprinted any time from Batch History.</span>
				<div style="display:flex;gap:8px;">
					<button type="button" onclick={handleClose} style="background:#fff;color:#474545;border:1.5px solid #EAEAEA;border-radius:7px;padding:8px 16px;font-size:12px;font-weight:600;font-family:'Montserrat',sans-serif;cursor:pointer;">Cancel</button>
					<button
						type="button"
						onclick={trySubmit}
						style="display:flex;align-items:center;gap:6px;background:{formValid ? '#2372B9' : '#b0c9e8'};color:#fff;border:none;border-radius:7px;padding:8px 16px;font-size:12px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:{formValid ? 'pointer' : 'not-allowed'};box-shadow:{formValid ? '0 2px 8px rgba(35,114,185,0.3)' : 'none'};"
					>
						<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="#fff" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="#fff" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="#fff" stroke-width="2"/><path d="M14 14h3v3h-3zM18 18h3v3h-3z" fill="#fff"/></svg>
						Generate &amp; Download
					</button>
				</div>
			</div>

		<!-- ══════════════════ PROGRESS PHASE ══════════════════ -->
		{:else if phase === 'progress'}
			<!-- Header -->
			<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:18px 24px;border-bottom:1px solid #EAEAEA;">
				<div>
					<div style="font-size:15px;font-weight:700;color:#474545;">Generating QR codes…</div>
					<div style="font-size:11.5px;color:#686868;margin-top:3px;">{product?.name ?? ''} · Batch {fBatchId}</div>
				</div>
			</div>

			<!-- Body -->
			<div style="padding:30px 36px;display:flex;flex-direction:column;align-items:center;gap:20px;">
				<!-- Pulsing QR -->
				<div style="position:relative;width:140px;height:140px;display:flex;align-items:center;justify-content:center;">
					<div style="position:absolute;inset:-14px;border-radius:16px;border:2px solid rgba(35,114,185,0.08);"></div>
					<div style="position:absolute;inset:-6px;border-radius:12px;border:2px solid rgba(35,114,185,0.18);"></div>
					<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;padding:10px;box-shadow:0 2px 12px rgba(35,114,185,0.15);">
						<svg width="100" height="100" viewBox="0 0 156 156">
							{#each qrData as cell}
								<rect x={cell.x} y={cell.y} width={cell.s} height={cell.s} fill="#1a1a1a"/>
							{/each}
						</svg>
					</div>
				</div>

				<!-- Live count -->
				<div style="text-align:center;">
					<div style="font-size:34px;font-weight:700;color:#474545;font-variant-numeric:tabular-nums;line-height:1;">
						{progDone.toLocaleString('en-IN')} <span style="font-size:18px;color:#686868;">/ {progTotal.toLocaleString('en-IN')}</span>
					</div>
				</div>

				<!-- Progress bar -->
				<div style="width:100%;">
					<div style="height:8px;background:#EAEAEA;border-radius:99px;overflow:hidden;">
						<div style="height:100%;width:{progPct}%;background:linear-gradient(90deg,#2372B9,#24AEB1);border-radius:99px;transition:width 300ms linear;"></div>
					</div>
					<div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
						<div style="display:flex;align-items:center;gap:5px;font-size:11.5px;color:#686868;">
							<span class="prog-dot" style="width:6px;height:6px;border-radius:50%;background:#2372B9;display:inline-block;"></span>
							Signing &amp; rendering codes
						</div>
						<span style="font-size:11.5px;font-weight:700;color:#2372B9;">
							{progPct} %{progEta !== null ? ` · ~${progEta} s left` : ''}
						</span>
					</div>
				</div>

				<p style="font-size:11px;color:#686868;text-align:center;max-width:340px;line-height:1.6;margin:0;">Keep this window open. The file will start downloading automatically when ready.</p>
			</div>

			<!-- Footer -->
			<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 24px;border-top:1px solid #EAEAEA;background:#fbfbfc;border-radius:0 0 14px 14px;">
				<span style="font-size:11px;color:#686868;">Cancelling discards all generated codes.</span>
				<button type="button" onclick={cancelGeneration} style="background:#fff;color:#474545;border:1.5px solid #EAEAEA;border-radius:7px;padding:8px 16px;font-size:12px;font-weight:600;font-family:'Montserrat',sans-serif;cursor:pointer;">Cancel generation</button>
			</div>

		<!-- ══════════════════ SUCCESS PHASE ══════════════════ -->
		{:else if phase === 'success' && successData}
			<!-- Header -->
			<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:18px 24px;border-bottom:1px solid #EAEAEA;">
				<div>
					<div style="font-size:15px;font-weight:700;color:#474545;">Batch ready</div>
					<div style="font-size:11.5px;color:#686868;margin-top:3px;">{successData.quantity.toLocaleString('en-IN')} QR codes generated and signed.</div>
				</div>
				<div style="display:flex;align-items:center;gap:5px;background:#f0f9e6;border:1px solid #93CB52;border-radius:99px;padding:4px 10px;flex-shrink:0;">
					<span style="width:6px;height:6px;border-radius:50%;background:#3d8c1a;display:inline-block;"></span>
					<span style="font-size:10.5px;font-weight:700;color:#3d6e10;">Ready to download</span>
				</div>
			</div>

			<!-- Body -->
			<div style="padding:24px 28px;display:flex;flex-direction:column;gap:18px;">
				<!-- File card -->
				<div style="background:#f0f9e6;border:1px solid #93CB52;border-radius:10px;padding:16px 18px;display:flex;align-items:center;gap:12px;">
					<div style="width:44px;height:44px;border-radius:50%;background:#3d8c1a;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
					</div>
					<div style="flex:1;min-width:0;">
						<div style="font-size:14px;font-weight:700;color:#1a4a0a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{successData.filename}</div>
						<div style="font-size:11px;color:#3d6e10;margin-top:2px;">
							{#if successData.pages}{successData.pages} pages · {/if}{successData.fileSize} · expires in 7 days
						</div>
					</div>
				</div>

				<!-- Summary -->
				<div style="background:#F4F6F8;border-radius:10px;padding:14px 16px;">
					<div style="font-size:10px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:10px;">Summary</div>
					{#each [
						['Product', product?.name ?? ''],
						['Batch ID', successData.batchId],
						['Quantity', successData.quantity.toLocaleString('en-IN') + ' stickers'],
						['Serial range', successData.serialStart + ' → ' + successData.serialEnd],
						['Format', successData.format === 'pdf' ? 'PDF sheet · A4 · 35 per page' : 'ZIP of PNGs · 600×600 px each'],
						['Generated', successData.generatedAt + ' · by Admin'],
					] as [label, value], i}
						<div style="display:flex;justify-content:space-between;gap:12px;padding:5px 0;{i < 5 ? 'border-bottom:1px solid #EAEAEA;' : ''}">
							<span style="font-size:11.5px;color:#686868;">{label}</span>
							<span style="font-size:11.5px;font-weight:600;color:#474545;text-align:right;{['Serial range'].includes(label) ? 'font-family:monospace;' : ''}">{value}</span>
						</div>
					{/each}
				</div>

				<!-- Info note -->
				<div style="display:flex;align-items:center;gap:8px;">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#2372B9" stroke-width="2"/><path d="M12 11v5M12 8h.01" stroke="#2372B9" stroke-width="2.2" stroke-linecap="round"/></svg>
					<span style="font-size:11px;color:#686868;">File downloaded automatically. Click below to save again.</span>
				</div>
			</div>

			<!-- Footer -->
			<div style="display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:14px 24px;border-top:1px solid #EAEAEA;background:#fbfbfc;border-radius:0 0 14px 14px;">
				<button type="button" onclick={generateAnother} style="background:#fff;color:#474545;border:1.5px solid #EAEAEA;border-radius:7px;padding:8px 16px;font-size:12px;font-weight:600;font-family:'Montserrat',sans-serif;cursor:pointer;">Generate another</button>
				<a href={downloadUrl} download={downloadName} style="display:flex;align-items:center;gap:6px;background:#2372B9;color:#fff;border:none;border-radius:7px;padding:8px 16px;font-size:12px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(35,114,185,0.3);text-decoration:none;">
					<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M7 10l5 5 5-5M12 15V3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
					Save {successData.format.toUpperCase()} again
				</a>
				<button type="button" onclick={onclose} style="background:#474545;color:#fff;border:none;border-radius:7px;padding:8px 16px;font-size:12px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;">Close</button>
			</div>

		<!-- ══════════════════ ERROR PHASE ══════════════════ -->
		{:else if phase === 'error'}
			<!-- Header -->
			<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:18px 24px;border-bottom:1px solid #EAEAEA;">
				<div>
					<div style="font-size:15px;font-weight:700;color:#474545;">Couldn't generate batch</div>
					<div style="font-size:11.5px;color:#686868;margin-top:3px;">{product?.name ?? ''} · attempted {fBatchId}</div>
				</div>
				<div style="display:flex;align-items:center;gap:5px;background:#fde8e8;border:1px solid #E53E3E;border-radius:99px;padding:4px 10px;flex-shrink:0;">
					<span style="width:6px;height:6px;border-radius:50%;background:#E53E3E;display:inline-block;"></span>
					<span style="font-size:10.5px;font-weight:700;color:#9b2626;">Generation failed</span>
				</div>
			</div>

			<!-- Body -->
			<div style="padding:22px 24px;display:flex;flex-direction:column;gap:16px;">
				<!-- Error block -->
				<div style="background:#fde8e8;border:1px solid #E53E3E;border-left:4px solid #E53E3E;border-radius:10px;padding:14px 16px;display:flex;gap:14px;">
					<div style="width:32px;height:32px;border-radius:50%;background:#E53E3E;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M10.3 3.7L2.5 17.2A2 2 0 004.2 20.2h15.6a2 2 0 001.7-3l-7.8-13.5a2 2 0 00-3.4 0z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>
					</div>
					<div>
						{#if errCode === 'INIT_FAILED'}
							<div style="font-size:13px;font-weight:700;color:#9b2626;margin-bottom:4px;">Batch label already used</div>
							<div style="font-size:12px;color:#7a1c1c;line-height:1.5;">A batch with label <span style="font-family:monospace;font-weight:700;">{fBatchId}</span> already exists for this product. Choose a different batch label.</div>
						{:else if errCode === 'CHUNK_FAILED'}
							<div style="font-size:13px;font-weight:700;color:#9b2626;margin-bottom:4px;">Serial collision during generation</div>
							<div style="font-size:12px;color:#7a1c1c;line-height:1.5;">One or more serials in the requested range already exist. The batch may be incomplete — delete it from Batch History and retry with a different prefix.</div>
						{:else}
							<div style="font-size:13px;font-weight:700;color:#9b2626;margin-bottom:4px;">Generation failed</div>
							<div style="font-size:12px;color:#7a1c1c;line-height:1.5;">{errMessage}</div>
						{/if}
					</div>
				</div>

				<!-- Trace -->
				<div style="font-family:monospace;font-size:10.5px;color:#686868;">Error code: {errCode}</div>
			</div>

			<!-- Footer -->
			<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 24px;border-top:1px solid #EAEAEA;background:#fbfbfc;border-radius:0 0 14px 14px;">
				<span style="font-size:11px;color:#686868;">No complete batch was generated.</span>
				<button type="button" onclick={() => phase = 'form'} style="background:#fff;color:#474545;border:1.5px solid #EAEAEA;border-radius:7px;padding:8px 16px;font-size:12px;font-weight:600;font-family:'Montserrat',sans-serif;cursor:pointer;">Edit values</button>
			</div>
		{/if}

		</div><!-- /modal-shell -->

		<!-- Discard confirmation overlay -->
		{#if discardOpen}
			<div
				style="position:fixed;inset:0;z-index:210;display:flex;align-items:center;justify-content:center;padding:16px;"
				onclick={() => discardOpen = false}
			>
				<div
					onclick={(e) => e.stopPropagation()}
					style="background:#fff;border-radius:12px;box-shadow:0 8px 40px rgba(0,0,0,0.22);padding:24px 28px;width:100%;max-width:360px;font-family:'Montserrat',sans-serif;"
				>
					<div style="font-size:15px;font-weight:700;color:#474545;margin-bottom:8px;">Discard changes?</div>
					<div style="font-size:13px;color:#686868;line-height:1.6;margin-bottom:20px;">You have unsaved form data. Closing will lose your batch ID, quantity, and format settings.</div>
					<div style="display:flex;gap:8px;justify-content:flex-end;">
						<button
							type="button"
							onclick={() => discardOpen = false}
							style="background:#fff;color:#474545;border:1.5px solid #EAEAEA;border-radius:7px;padding:9px 16px;font-size:12px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;"
						>Keep editing</button>
						<button
							type="button"
							onclick={resetAndClose}
							style="background:#E53E3E;color:#fff;border:none;border-radius:7px;padding:9px 16px;font-size:12px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;"
						>Discard</button>
					</div>
				</div>
			</div>
		{/if}
	</div><!-- /backdrop -->
{/if}

<style>
	@keyframes qrPopIn {
		from { opacity: 0; transform: scale(0.97); }
		to   { opacity: 1; transform: scale(1); }
	}
	@keyframes progPulse {
		0%, 100% { opacity: 1; transform: scale(1); }
		50%       { opacity: 0.4; transform: scale(0.75); }
	}
	:global(.prog-dot) {
		animation: progPulse 1.2s ease-in-out infinite;
	}
	@media (max-width: 640px) {
		.modal-form-grid {
			grid-template-columns: 1fr !important;
		}
	}
</style>
