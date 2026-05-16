<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	function fmt(s: string) {
		return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
	}

	function inr(n: number) {
		return '₹' + n.toLocaleString('en-IN');
	}
</script>

<div class="pg" style="padding:32px 36px;font-family:'Montserrat',sans-serif;">
	<h1 style="font-size:22px;font-weight:700;color:#474545;margin:0 0 18px;">Payouts</h1>

	{#if (form as any)?.error}
		<div style="background:#fde8e8;color:#9b2626;border-radius:8px;padding:10px 14px;font-size:13px;margin-bottom:16px;">{(form as any).error}</div>
	{/if}
	{#if (form as any)?.markedPaid}
		<div style="background:#f0f9e6;color:#3d6e10;border-radius:8px;padding:10px 14px;font-size:13px;margin-bottom:16px;">
			{(form as any).markedPaid} claim{(form as any).markedPaid === 1 ? '' : 's'} marked as paid.
		</div>
	{/if}

	{#if data.rows.length > 0}
		<!-- Summary bar -->
		<div class="summary-bar" style="background:#e8f1fb;border:1.5px solid #2372B9;border-radius:10px;padding:13px 18px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
			<span style="font-size:13px;font-weight:600;color:#1a5a99;">
				{data.rows.length} retailer{data.rows.length === 1 ? '' : 's'} —
				{data.rows.reduce((s, r) => s + r.claimCount, 0)} pending payout claim{data.rows.reduce((s, r) => s + r.claimCount, 0) === 1 ? '' : 's'} —
				Total: <strong style="font-size:16px;">{inr(data.total)}</strong>
			</span>
			<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:99px;background:#eef5ff;color:#1a5a99;font-size:11px;font-weight:700;">
				<span style="width:5px;height:5px;border-radius:50%;background:#2372B9;flex-shrink:0;"></span>
				Pending Payout
			</span>
		</div>

		<!-- Export button -->
		<div style="margin-bottom:20px;">
			<a
				href="/admin/payouts/export.csv"
				class="export-btn"
				style="display:inline-flex;align-items:center;gap:8px;background:#2372B9;color:#fff;border:none;border-radius:8px;padding:12px 22px;font-size:14px;font-weight:700;font-family:'Montserrat',sans-serif;text-decoration:none;box-shadow:0 4px 16px rgba(35,114,185,0.28);cursor:pointer;"
			>
				<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M7 10l5 5 5-5M12 15V3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
				Export CSV for Cashfree
			</a>
			<div style="font-size:12px;color:#686868;margin-top:8px;">After uploading to Cashfree, claims will be marked as Paid and removed from this list.</div>
		</div>

		<!-- Desktop: payout table -->
		<div class="desktop-only" style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04);margin-bottom:28px;">
			<table style="width:100%;border-collapse:collapse;">
				<thead>
					<tr>
						{#each ['Retailer Name','UPI ID','Products','Claims','Total Cashback'] as col}
							<th style="padding:9px 14px;text-align:left;font-size:11px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;border-bottom:2px solid #EAEAEA;background:#fff;white-space:nowrap;">{col}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each data.rows as row}
						<tr style="border-bottom:1px solid #EAEAEA;background:#fff;">
							<td style="padding:10px 14px;font-size:13px;color:#474545;font-weight:600;">{row.retailer_name}</td>
							<td style="padding:10px 14px;font-size:11px;font-family:monospace;color:#686868;">{row.upi_id}</td>
							<td style="padding:10px 14px;font-size:12px;color:#474545;">{row.products.join(', ')}</td>
							<td style="padding:10px 14px;font-size:13px;color:#686868;text-align:center;">{row.claimCount}</td>
							<td style="padding:10px 14px;font-size:13px;color:#474545;font-weight:700;">{inr(row.totalAmount)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<div style="display:flex;align-items:center;justify-content:space-between;padding:11px 16px;border-top:1px solid #EAEAEA;background:#fff;">
				<span style="font-size:12px;color:#686868;">{data.rows.length} retailer{data.rows.length === 1 ? '' : 's'}</span>
				<span style="font-size:13px;font-weight:700;color:#474545;">Total: {inr(data.total)}</span>
			</div>
		</div>

		<!-- Mobile: payout cards -->
		<div class="mobile-only" style="margin-bottom:28px;">
			<div style="display:flex;flex-direction:column;gap:8px;">
				{#each data.rows as row}
					<div style="background:#fff;border-radius:10px;border:1.5px solid #EAEAEA;padding:14px 16px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
						<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
							<div style="font-size:14px;font-weight:700;color:#474545;">{row.retailer_name}</div>
							<div style="font-size:15px;font-weight:700;color:#474545;flex-shrink:0;margin-left:8px;">{inr(row.totalAmount)}</div>
						</div>
						<div style="font-size:12px;color:#686868;margin-bottom:4px;">{row.products.join(', ')}</div>
						<div style="display:flex;gap:10px;font-size:11px;color:#686868;flex-wrap:wrap;border-top:1px solid #EAEAEA;padding-top:8px;margin-top:4px;">
							<span style="font-family:monospace;">{row.upi_id}</span>
							<span>{row.claimCount} claim{row.claimCount === 1 ? '' : 's'}</span>
						</div>
					</div>
				{/each}
			</div>
			<div style="padding:10px 4px;">
				<span style="font-size:12px;color:#686868;">{data.rows.length} retailer{data.rows.length === 1 ? '' : 's'}</span>
			</div>
		</div>

		<!-- Mark as Paid -->
		<form method="post" action="?/markPaid" use:enhance style="margin-bottom:32px;">
			<input type="hidden" name="confirmed" value="yes" />
			<button
				type="submit"
				style="background:#3d6e10;color:#fff;border:none;border-radius:8px;padding:12px 22px;font-size:14px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;display:inline-flex;align-items:center;gap:8px;"
			>
				<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
				Mark all as Paid
			</button>
			<div style="font-size:12px;color:#686868;margin-top:8px;">Only do this after successfully uploading the CSV to Cashfree.</div>
		</form>
	{:else}
		<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;padding:48px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.04);margin-bottom:28px;">
			<p style="font-size:13px;color:#686868;margin:0;">No claims pending payout.</p>
		</div>
	{/if}

	<!-- Payout History -->
	<h2 style="font-size:15px;font-weight:700;color:#474545;margin:0 0 14px;">Payout History</h2>

	{#if data.history.length === 0}
		<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;padding:36px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
			<p style="font-size:13px;color:#686868;margin:0;">No payout history yet.</p>
		</div>
	{:else}
		<!-- Desktop: history table -->
		<div class="desktop-only" style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
			<table style="width:100%;border-collapse:collapse;">
				<thead>
					<tr>
						{#each ['Export Date','Claims in Batch','Total Amount','Download'] as col}
							<th style="padding:9px 14px;text-align:left;font-size:11px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;border-bottom:2px solid #EAEAEA;background:#fff;white-space:nowrap;">{col}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each data.history as h}
						<tr style="border-bottom:1px solid #EAEAEA;background:#fff;">
							<td style="padding:10px 14px;font-size:13px;color:#474545;font-weight:600;">{fmt(h.exported_at)}</td>
							<td style="padding:10px 14px;font-size:13px;color:#474545;">{h.claims_count}</td>
							<td style="padding:10px 14px;font-size:13px;color:#474545;font-weight:700;">{inr(h.total_amount)}</td>
							<td style="padding:10px 14px;">
								<a
									href="/admin/payouts/export.csv?file={encodeURIComponent(h.filename)}"
									style="display:inline-flex;align-items:center;gap:5px;color:#2372B9;font-weight:600;font-size:12px;font-family:'Montserrat',sans-serif;text-decoration:none;"
								>
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#2372B9" stroke-width="2" stroke-linecap="round"/><path d="M7 10l5 5 5-5M12 15V3" stroke="#2372B9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
									Download CSV
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Mobile: history cards -->
		<div class="mobile-only">
			<div style="display:flex;flex-direction:column;gap:8px;">
				{#each data.history as h}
					<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;padding:14px 16px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
						<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
							<div>
								<div style="font-size:14px;font-weight:700;color:#474545;">{fmt(h.exported_at)}</div>
								<div style="font-size:12px;color:#686868;margin-top:2px;">{h.claims_count} claim{h.claims_count === 1 ? '' : 's'}</div>
							</div>
							<div style="font-size:15px;font-weight:700;color:#474545;">{inr(h.total_amount)}</div>
						</div>
						<div style="border-top:1px solid #EAEAEA;padding-top:8px;">
							<a
								href="/admin/payouts/export.csv?file={encodeURIComponent(h.filename)}"
								style="display:inline-flex;align-items:center;gap:5px;color:#2372B9;font-weight:600;font-size:12px;font-family:'Montserrat',sans-serif;text-decoration:none;"
							>
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#2372B9" stroke-width="2" stroke-linecap="round"/><path d="M7 10l5 5 5-5M12 15V3" stroke="#2372B9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
								Download CSV
							</a>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	@media (max-width: 768px) {
		.pg { padding: 16px 14px !important; }
		.export-btn { width: 100% !important; justify-content: center !important; }
		.desktop-only { display: none !important; }
		.mobile-only { display: block !important; }
	}
	@media (min-width: 769px) {
		.mobile-only { display: none !important; }
	}
</style>
