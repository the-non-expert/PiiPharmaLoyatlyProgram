<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Checkbox state — initialize outside $state to avoid reactive-capture warning
	const initialIds = data.rows.map((r) => r.id);
	let selected = $state(new Set<string>(initialIds));
	const allSelected = $derived(selected.size === data.rows.length && data.rows.length > 0);
	const selectedTotal = $derived(
		data.rows
			.filter((r) => selected.has(r.id))
			.reduce((s, r) => s + r.cashback_amount, 0),
	);
	const selectedCount = $derived(selected.size);

	function toggleAll() {
		if (allSelected) selected = new Set();
		else             selected = new Set(data.rows.map((r) => r.id));
	}

	function toggleRow(id: string) {
		const next = new Set(selected);
		if (next.has(id)) next.delete(id);
		else              next.add(id);
		selected = next;
	}

	function fmt(s: string) {
		return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
	}

	function inr(n: number) {
		return '₹' + n.toLocaleString('en-IN');
	}
</script>

<div style="padding:32px 36px;font-family:'Montserrat',sans-serif;">
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
		<div style="background:#e8f1fb;border:1.5px solid #2372B9;border-radius:10px;padding:13px 18px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;">
			<span style="font-size:13px;font-weight:600;color:#1a5a99;">
				{selectedCount} approved claim{selectedCount === 1 ? '' : 's'} selected for payout — Total:&ensp;<strong style="font-size:16px;">{inr(selectedTotal)}</strong>
			</span>
			<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:99px;background:#f0f9e6;color:#3d6e10;font-size:11px;font-weight:700;">
				<span style="width:5px;height:5px;border-radius:50%;background:#93CB52;flex-shrink:0;"></span>
				Approved
			</span>
		</div>

		<!-- Export button -->
		<div style="margin-bottom:20px;">
			<a
				href="/admin/payouts/export.csv"
				style="display:inline-flex;align-items:center;gap:8px;background:#2372B9;color:#fff;border:none;border-radius:8px;padding:12px 22px;font-size:14px;font-weight:700;font-family:'Montserrat',sans-serif;text-decoration:none;box-shadow:0 4px 16px rgba(35,114,185,0.28);cursor:pointer;"
			>
				<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M7 10l5 5 5-5M12 15V3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
				Export CSV for Cashfree
			</a>
			<div style="font-size:12px;color:#686868;margin-top:8px;">After uploading to Cashfree, claims will be marked as Paid and removed from this list.</div>
		</div>

		<!-- Payout table -->
		<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04);margin-bottom:28px;">
			<table style="width:100%;border-collapse:collapse;">
				<thead>
					<tr>
						<th style="padding:9px 14px;width:40px;border-bottom:2px solid #EAEAEA;background:#fff;">
							<input
								type="checkbox"
								checked={allSelected}
								onchange={toggleAll}
								style="cursor:pointer;width:14px;height:14px;"
							/>
						</th>
						{#each ['Claim ID','Retailer Name','UPI ID','Product','Cashback Amount','Approved On'] as col}
							<th style="padding:9px 14px;text-align:left;font-size:11px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;border-bottom:2px solid #EAEAEA;background:#fff;white-space:nowrap;">{col}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each data.rows as row}
						<tr style="border-bottom:1px solid #EAEAEA;background:#fff;">
							<td style="padding:10px 14px;">
								<input
									type="checkbox"
									checked={selected.has(row.id)}
									onchange={() => toggleRow(row.id)}
									style="cursor:pointer;width:14px;height:14px;"
								/>
							</td>
							<td style="padding:10px 14px;font-size:12px;font-family:monospace;color:#2372B9;font-weight:700;">{row.id.toUpperCase().replace('CLAIM-','CLM-')}</td>
							<td style="padding:10px 14px;font-size:13px;color:#474545;font-weight:600;">{row.retailer_name}</td>
							<td style="padding:10px 14px;font-size:11px;font-family:monospace;color:#686868;">{row.upi_id}</td>
							<td style="padding:10px 14px;font-size:13px;color:#474545;">{row.product_name}</td>
							<td style="padding:10px 14px;font-size:13px;color:#474545;font-weight:700;">{inr(row.cashback_amount)}</td>
							<td style="padding:10px 14px;font-size:12px;color:#686868;">{fmt(row.created_at)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<div style="display:flex;align-items:center;justify-content:space-between;padding:11px 16px;border-top:1px solid #EAEAEA;background:#fff;">
				<span style="font-size:12px;color:#686868;">Showing 1–{data.rows.length} of {data.rows.length} results</span>
			</div>
		</div>
	{:else}
		<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;padding:48px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.04);margin-bottom:28px;">
			<p style="font-size:13px;color:#686868;margin:0;">No approved claims pending payout.</p>
		</div>
	{/if}

	<!-- Payout History -->
	<h2 style="font-size:15px;font-weight:700;color:#474545;margin:0 0 14px;">Payout History</h2>
	<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
		{#if data.history.length === 0}
			<div style="padding:36px;text-align:center;">
				<p style="font-size:13px;color:#686868;margin:0;">No payout history yet.</p>
			</div>
		{:else}
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
		{/if}
	</div>
</div>
