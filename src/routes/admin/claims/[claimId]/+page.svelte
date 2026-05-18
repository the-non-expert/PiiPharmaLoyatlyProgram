<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let showRejectForm = $state(false);
	let rejectReason = $state('');

	function fmt(s: string) {
		return new Date(s).toLocaleDateString('en-IN', {
			day: '2-digit', month: 'short', year: 'numeric',
			hour: '2-digit', minute: '2-digit',
		});
	}

	const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
		pending:         { bg: '#fef3cd', text: '#92640a', dot: '#F59E0B' },
		pending_payout:  { bg: '#eef5ff', text: '#1a5a99', dot: '#2372B9' },
		approved:        { bg: '#f0f9e6', text: '#3d6e10', dot: '#93CB52' },
		rejected:        { bg: '#fde8e8', text: '#9b2626', dot: '#E53E3E' },
		paid:            { bg: '#e8f1fb', text: '#14407a', dot: '#2372B9' },
	};

	const sc = $derived(statusColors[data.claim.status] ?? { bg:'#F4F6F8', text:'#686868', dot:'#686868' });
</script>

<div class="pg" style="padding:28px 36px;font-family:'Montserrat',sans-serif;">
	<!-- Back link -->
	<a href="/admin/claims" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:#2372B9;text-decoration:none;margin-bottom:18px;">
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
		Back to Claims
	</a>

	{#if (form as any)?.error}
		<div style="background:#fde8e8;color:#9b2626;border-radius:8px;padding:10px 14px;font-size:13px;margin-bottom:16px;">{(form as any).error}</div>
	{/if}

	<!-- Two-column layout -->
	<div class="cols" style="display:flex;gap:16px;align-items:flex-start;">

		<!-- LEFT sidebar: Retailer + Timeline + Actions -->
		<div class="col-left" style="width:320px;flex-shrink:0;display:flex;flex-direction:column;gap:14px;">

			<!-- Retailer card -->
			<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;padding:18px 20px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
				<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
					<div style="font-size:13px;font-weight:700;color:#474545;">Retailer</div>
					<a href="/admin/retailers?q={data.retailer?.mobile}" style="font-size:12px;font-weight:600;color:#2372B9;text-decoration:none;">
						View profile →
					</a>
				</div>
				<div style="font-size:17px;font-weight:700;color:#474545;margin-bottom:2px;">{data.retailer?.name}</div>
				<div style="font-size:12px;color:#686868;margin-bottom:12px;">{data.retailer?.mobile} · {data.retailer?.city}, {data.retailer?.state}</div>
				<div style="font-size:11px;color:#686868;margin-bottom:14px;">UPI: <span style="font-weight:600;color:#474545;">{data.retailer?.upi_id}</span></div>
				<div style="display:flex;gap:0;border-top:1px solid #F0F0F0;padding-top:12px;">
					<div style="flex:1;text-align:center;">
						<div style="font-size:18px;font-weight:700;color:#474545;">{data.retailerStats.total_claims}</div>
						<div style="font-size:9px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.07em;margin-top:3px;">Claims</div>
					</div>
					<div style="flex:1;text-align:center;border-left:1px solid #F0F0F0;">
						<div style="font-size:18px;font-weight:700;color:#474545;">{data.retailerStats.paid_claims}</div>
						<div style="font-size:9px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.07em;margin-top:3px;">Paid</div>
					</div>
					<div style="flex:1;text-align:center;border-left:1px solid #F0F0F0;">
						<div style="font-size:18px;font-weight:700;color:#2372B9;">₹{data.retailerStats.total_cashback}</div>
						<div style="font-size:9px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.07em;margin-top:3px;">Earned</div>
					</div>
				</div>
			</div>

			<!-- Claim timeline -->
			<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;padding:18px 20px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
				<div style="font-size:13px;font-weight:700;color:#474545;margin-bottom:14px;">Timeline</div>
				{#each [
					{ label: 'Submitted',     date: data.claim.created_at,  done: true },
					{ label: 'Auto-approved', date: data.claim.approved_at, done: !!data.claim.approved_at },
					{ label: 'Paid',          date: data.claim.paid_at,     done: !!data.claim.paid_at },
				] as step}
					<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
						<div style="width:10px;height:10px;border-radius:50%;background:{step.done ? '#93CB52' : '#EAEAEA'};flex-shrink:0;margin-top:3px;"></div>
						<div>
							<div style="font-size:12px;font-weight:700;color:{step.done ? '#474545' : '#aaa'};">{step.label}</div>
							<div style="font-size:11px;color:#686868;">{step.date ? fmt(step.date) : '—'}</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Actions -->
			{#if data.claim.status === 'pending_payout'}
				<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;padding:16px 18px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
					<div style="font-size:12px;color:#686868;margin-bottom:12px;line-height:1.5;">This claim was auto-approved on a valid QR scan and is ready for payout export. You can reject it if there is a legitimate dispute.</div>
					{#if !showRejectForm}
						<button
							type="button"
							onclick={() => showRejectForm = true}
							style="width:100%;background:#fff;color:#E53E3E;border:1.5px solid #E53E3E;border-radius:7px;padding:10px;font-size:13px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;"
						>✕ Reject Claim</button>
					{:else}
						<div style="border:2px solid #E53E3E;border-radius:8px;padding:13px;background:#fde8e8;">
							<form method="POST" action="?/reject" use:enhance>
								<div style="font-size:11px;font-weight:700;color:#9b2626;margin-bottom:6px;">Rejection reason (required)</div>
								<textarea
									name="reason"
									bind:value={rejectReason}
									placeholder="Explain why this claim is being rejected..."
									style="width:100%;height:72px;border:1.5px solid #E53E3E;border-radius:6px;padding:8px;font-family:'Montserrat',sans-serif;font-size:12px;color:#474545;resize:none;outline:none;background:#fff;line-height:1.5;box-sizing:border-box;"
									required
								></textarea>
								<div style="display:flex;gap:8px;margin-top:10px;">
									<button
										type="submit"
										disabled={!rejectReason.trim()}
										style="flex:1;background:#E53E3E;color:#fff;border:none;border-radius:6px;padding:8px;font-size:12px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;opacity:{rejectReason.trim() ? 1 : 0.5};"
									>Confirm Rejection</button>
									<button
										type="button"
										onclick={() => { showRejectForm = false; rejectReason = ''; }}
										style="flex:1;background:#fff;color:#474545;border:1.5px solid #EAEAEA;border-radius:6px;padding:8px;font-size:12px;font-weight:600;font-family:'Montserrat',sans-serif;cursor:pointer;"
									>Cancel</button>
								</div>
							</form>
						</div>
					{/if}
				</div>
			{:else}
				<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;padding:16px 18px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
					<div style="font-size:13px;font-weight:700;color:#474545;margin-bottom:10px;">Status</div>
					<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:99px;background:{sc.bg};color:{sc.text};font-size:11px;font-weight:700;">
						<span style="width:5px;height:5px;border-radius:50%;background:{sc.dot};flex-shrink:0;"></span>
						{ data.claim.status === 'pending_payout' ? 'Pending Payout' : data.claim.status.charAt(0).toUpperCase() + data.claim.status.slice(1) }
					</span>
					{#if data.claim.rejection_reason}
						<p style="font-size:13px;color:#686868;margin-top:10px;line-height:1.5;">{data.claim.rejection_reason}</p>
					{/if}
				</div>
			{/if}
		</div>

		<!-- RIGHT main: Plan strip + Serials table -->
		<div class="col-right" style="flex:1;min-width:0;display:flex;flex-direction:column;gap:14px;">

			<!-- Plan info strip -->
			<div style="background:#F4F6F8;border-radius:8px;padding:12px 16px;">
				<div style="display:flex;gap:24px;flex-wrap:wrap;margin-bottom:{data.legs.length > 1 ? '12px' : '0'};">
					<div><span style="font-size:10px;font-weight:700;color:#aaa;text-transform:uppercase;">Plan</span><div style="font-size:13px;font-weight:600;color:#474545;">{data.plan?.name ?? '—'}</div></div>
					<div><span style="font-size:10px;font-weight:700;color:#aaa;text-transform:uppercase;">Cashback</span><div style="font-size:13px;font-weight:700;color:#2372B9;">₹{data.plan?.cashback_amount ?? 0}</div></div>
					<div><span style="font-size:10px;font-weight:700;color:#aaa;text-transform:uppercase;">Coupons</span><div style="font-size:13px;font-weight:600;color:#474545;">{data.coupons.length} scanned</div></div>
				</div>
				{#if data.legs.length > 1}
					<div style="display:flex;gap:8px;flex-wrap:wrap;">
						{#each data.legs as leg}
							<span style="background:#fff;border:1px solid #EAEAEA;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:600;color:#474545;">
								{leg.product_name} <span style="color:#686868;font-weight:400;">× {leg.coupons_required}</span>
							</span>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Serials & scan timeline table -->
			<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
				<div style="padding:14px 18px;border-bottom:1px solid #EAEAEA;font-size:13px;font-weight:700;color:#474545;">
					Scanned coupons
					<span style="font-size:12px;font-weight:500;color:#686868;margin-left:6px;">{data.coupons.length} total</span>
				</div>
				<div style="overflow-x:auto;">
					<table style="width:100%;border-collapse:collapse;">
						<thead>
							<tr>
								<th style="padding:8px 16px;text-align:left;font-size:10px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #EAEAEA;">#</th>
								<th style="padding:8px 16px;text-align:left;font-size:10px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #EAEAEA;">Serial</th>
								{#if data.legs.length > 1}
									<th style="padding:8px 16px;text-align:left;font-size:10px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #EAEAEA;">Product</th>
								{/if}
								<th style="padding:8px 16px;text-align:left;font-size:10px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #EAEAEA;">Batch</th>
								<th style="padding:8px 16px;text-align:left;font-size:10px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #EAEAEA;">Scanned at</th>
							</tr>
						</thead>
						<tbody>
							{#each data.coupons as coupon, i}
								<tr style="border-bottom:1px solid #F4F6F8;">
									<td style="padding:10px 16px;font-size:12px;color:#aaa;">{i + 1}</td>
									<td style="padding:10px 16px;font-family:monospace;font-size:12px;font-weight:700;color:#474545;">{coupon.serial}</td>
									{#if data.legs.length > 1}
										<td style="padding:10px 16px;font-size:12px;color:#474545;">{coupon.product_name ?? '—'}</td>
									{/if}
									<td style="padding:10px 16px;">
										{#if coupon.batch_label}
											<span style="background:#e8f1fb;color:#14407a;border:1px solid #93c5fd;border-radius:99px;padding:2px 8px;font-size:10px;font-weight:700;">{coupon.batch_label}</span>
										{:else}
											<span style="color:#aaa;font-size:11px;">—</span>
										{/if}
									</td>
									<td style="padding:10px 16px;font-size:12px;color:#686868;">{fmt(coupon.scanned_at)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	@media (max-width: 900px) {
		.pg { padding: 16px 14px !important; }
		.cols { flex-direction: column !important; }
		.col-left { width: 100% !important; }
	}
</style>
