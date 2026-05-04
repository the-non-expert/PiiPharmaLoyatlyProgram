<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let showRejectForm = $state(false);
	let rejectReason = $state('');
	let photoState = $state<Record<number, 'loading' | 'loaded' | 'error'>>({});

	function fmt(s: string) {
		return new Date(s).toLocaleDateString('en-IN', {
			day: '2-digit', month: 'short', year: 'numeric',
			hour: '2-digit', minute: '2-digit',
		});
	}

	const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
		pending:  { bg: '#fef3cd', text: '#92640a', dot: '#F59E0B' },
		approved: { bg: '#f0f9e6', text: '#3d6e10', dot: '#93CB52' },
		rejected: { bg: '#fde8e8', text: '#9b2626', dot: '#E53E3E' },
		paid:     { bg: '#e8f1fb', text: '#14407a', dot: '#2372B9' },
	};

	const sc = $derived(statusColors[data.claim.status] ?? { bg:'#F4F6F8', text:'#686868', dot:'#686868' });

	const claimLabel = $derived(data.claim.id.toUpperCase().replace('CLAIM-', 'CLM-'));

	const fields = $derived([
		['Retailer',         data.retailer?.name  ?? '—'],
		['Mobile',           data.retailer?.mobile ?? '—'],
		['City',             data.retailer?.city   ?? '—'],
		['State',            data.retailer?.state  ?? '—'],
		['UPI ID',           data.retailer?.upi_id ?? '—'],
		['Product',          data.product?.name    ?? '—'],
		['Cashback Amount',  '₹' + (data.product?.cashback_amount ?? 0)],
		['Coupons Required', String(data.product?.coupons_required ?? data.coupons.length)],
		['Date Created',     fmt(data.claim.created_at)],
	] as [string, string][]);
</script>

<div style="padding:28px 36px;font-family:'Montserrat',sans-serif;">
	<!-- Back link -->
	<a href="/admin/claims" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:#2372B9;text-decoration:none;margin-bottom:18px;">
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
		Back to Claims
	</a>

	<!-- Title row -->
	<div style="display:flex;align-items:center;gap:14px;margin-bottom:22px;">
		<h1 style="font-size:21px;font-weight:700;color:#474545;margin:0;">Claim #{claimLabel}</h1>
		<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:99px;background:{sc.bg};color:{sc.text};font-size:11px;font-weight:700;white-space:nowrap;">
			<span style="width:5px;height:5px;border-radius:50%;background:{sc.dot};flex-shrink:0;"></span>
			{data.claim.status.charAt(0).toUpperCase() + data.claim.status.slice(1)}
		</span>
	</div>

	{#if (form as any)?.error}
		<div style="background:#fde8e8;color:#9b2626;border-radius:8px;padding:10px 14px;font-size:13px;margin-bottom:16px;">{(form as any).error}</div>
	{/if}

	<!-- Two-column layout -->
	<div style="display:flex;gap:20px;align-items:flex-start;">

		<!-- LEFT: Coupon photos grid -->
		<div style="flex:1.65;">
			<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
				<div style="font-size:13px;font-weight:700;color:#474545;margin-bottom:14px;">
					Coupon Photos&ensp;<span style="font-size:12px;font-weight:500;color:#686868;">{data.coupons.length} of {data.product?.coupons_required ?? data.coupons.length} required</span>
				</div>
				<div style="display:grid;grid-template-columns:repeat({Math.min(data.coupons.length || 1, 5)},1fr);gap:10px;">
					{#each data.coupons as coupon, i}
						<div>
							<a
								href={coupon.photo_signed_url ?? '#'}
								target="_blank"
								rel="noopener"
								style="display:block;aspect-ratio:3/4;border-radius:7px;border:1px solid #EAEAEA;overflow:hidden;position:relative;text-decoration:none;margin-bottom:6px;background:#f7f7f7;"
							>
								{#if coupon.photo_signed_url}
									<!-- Spinner shown while loading -->
									{#if photoState[i] !== 'loaded' && photoState[i] !== 'error'}
										<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;z-index:1;">
											<div class="spin" style="width:24px;height:24px;border:3px solid #e0e0e0;border-top-color:#2372B9;border-radius:50%;"></div>
											<span style="font-size:9px;color:#aaa;font-weight:600;">Loading…</span>
										</div>
									{/if}
									<img
										src={coupon.photo_signed_url}
										alt="Coupon {i + 1}"
										onload={() => photoState[i] = 'loaded'}
										onerror={() => photoState[i] = 'error'}
										style="width:100%;height:100%;object-fit:cover;display:block;opacity:{photoState[i] === 'loaded' ? 1 : 0};transition:opacity 0.25s;"
									/>
									{#if photoState[i] === 'loaded'}
										<div style="position:absolute;bottom:4px;right:4px;background:rgba(35,114,185,0.85);border-radius:4px;padding:2px 6px;font-size:8px;color:#fff;font-weight:600;">View</div>
									{/if}
									{#if photoState[i] === 'error'}
										<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
											<span style="font-size:9px;color:#bbb;text-align:center;line-height:1.5;">Failed<br/>to load</span>
										</div>
									{/if}
								{:else}
									<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
										<span style="font-size:9px;color:#bbb;text-align:center;line-height:1.5;">No<br/>photo</span>
									</div>
								{/if}
							</a>
							<div style="font-size:8px;color:#686868;font-family:monospace;text-align:center;line-height:1.4;word-break:break-all;">{coupon.serial}</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- RIGHT: Details + Actions -->
		<div style="flex:1;display:flex;flex-direction:column;gap:14px;">

			<!-- Details -->
			<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;padding:16px 18px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
				<div style="font-size:13px;font-weight:700;color:#474545;margin-bottom:10px;">Claim Details</div>
				{#each fields as [k, v]}
					<div style="display:flex;justify-content:space-between;align-items:baseline;padding:5px 0;border-bottom:1px solid #EAEAEA;">
						<span style="font-size:11px;color:#686868;flex-shrink:0;">{k}</span>
						<span style="font-size:12px;font-weight:600;color:#474545;text-align:right;margin-left:8px;">{v}</span>
					</div>
				{/each}
			</div>

			<!-- Actions -->
			{#if data.claim.status === 'pending'}
				<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;padding:16px 18px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
					<!-- Approve -->
					<form method="POST" action="?/approve" use:enhance>
						<button
							type="submit"
							style="width:100%;background:#3d8c1a;color:#fff;border:none;border-radius:7px;padding:10px;font-size:13px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;margin-bottom:10px;opacity:{showRejectForm ? 0.35 : 1};transition:opacity 0.15s;"
						>✓ Approve Claim</button>
					</form>

					<!-- Reject toggle / form -->
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
				<!-- Non-pending: show status + rejection reason if any -->
				<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;padding:16px 18px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
					<div style="font-size:13px;font-weight:700;color:#474545;margin-bottom:10px;">Status</div>
					<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:99px;background:{sc.bg};color:{sc.text};font-size:11px;font-weight:700;">
						<span style="width:5px;height:5px;border-radius:50%;background:{sc.dot};flex-shrink:0;"></span>
						{data.claim.status.charAt(0).toUpperCase() + data.claim.status.slice(1)}
					</span>
					{#if data.claim.rejection_reason}
						<p style="font-size:13px;color:#686868;margin-top:10px;line-height:1.5;">{data.claim.rejection_reason}</p>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	.spin { animation: spin 0.8s linear infinite; }
</style>
