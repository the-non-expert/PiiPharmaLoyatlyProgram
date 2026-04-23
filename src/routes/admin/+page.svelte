<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	function inr(n: number) {
		return '₹' + n.toLocaleString('en-IN');
	}
</script>

<div style="padding:32px 36px;font-family:'Montserrat',sans-serif;">
	<h1 style="font-size:22px;font-weight:700;color:#474545;margin:0 0 24px;">Dashboard</h1>

	<!-- Stat cards -->
	<div style="display:flex;gap:16px;margin-bottom:28px;">
		{#each [
			{ label:'Pending Claims',      value: String(data.stats.pendingCount),              sub:'Awaiting review',          accent:'#F59E0B' },
			{ label:'Approved This Cycle', value: String(data.stats.approvedCount),             sub:'Since last export',        accent:'#93CB52' },
			{ label:'Total Retailers',     value: String(data.stats.totalRetailers),            sub:'Registered retailers',     accent:'#2372B9' },
			{ label:'Coupon Submissions',  value: data.stats.totalSubmissions.toLocaleString('en-IN'), sub:'All time total',   accent:'#24AEB1' },
			{ label:'Cashback Queued',     value: inr(data.stats.cashbackQueued),               sub:'Ready for payout',        accent:'#E53E3E' },
		] as card}
			<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;padding:18px 20px;flex:1;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
				<div style="font-size:11px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">{card.label}</div>
				<div style="font-size:26px;font-weight:700;color:{card.accent};line-height:1;margin-bottom:6px;">{card.value}</div>
				<div style="font-size:11px;color:#686868;">{card.sub}</div>
			</div>
		{/each}
	</div>

	<!-- By Product table -->
	<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
		<div style="padding:13px 18px;border-bottom:1px solid #EAEAEA;">
			<h2 style="font-size:14px;font-weight:700;color:#474545;margin:0;">By Product</h2>
		</div>
		<table style="width:100%;border-collapse:collapse;">
			<thead>
				<tr>
					{#each ['Product','Coupons Required','Pending Claims','Approved Claims','Total Coupons Submitted'] as col}
						<th style="padding:9px 14px;text-align:left;font-size:11px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;border-bottom:2px solid #EAEAEA;background:#fff;white-space:nowrap;">{col}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each data.byProduct as p}
					<tr style="border-bottom:1px solid #EAEAEA;background:#fff;">
						<td style="padding:10px 14px;font-size:13px;color:#474545;font-weight:600;">{p.name}</td>
						<td style="padding:10px 14px;font-size:13px;color:#474545;">{p.coupons_required}</td>
						<td style="padding:10px 14px;font-size:13px;">
							<span style="color:{p.pending_claims > 10 ? '#F59E0B' : '#474545'};font-weight:{p.pending_claims > 10 ? 700 : 400};">{p.pending_claims}</span>
						</td>
						<td style="padding:10px 14px;font-size:13px;color:#93CB52;font-weight:600;">{p.approved_claims}</td>
						<td style="padding:10px 14px;font-size:13px;color:#474545;">{p.total_submissions.toLocaleString('en-IN')}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
