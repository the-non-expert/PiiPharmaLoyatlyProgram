<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function fmt(s: string) {
		return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
	}

	const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
		pending:  { bg: '#fef3cd', text: '#92640a', dot: '#F59E0B' },
		approved: { bg: '#f0f9e6', text: '#3d6e10', dot: '#93CB52' },
		rejected: { bg: '#fde8e8', text: '#9b2626', dot: '#E53E3E' },
		paid:     { bg: '#e8f1fb', text: '#14407a', dot: '#2372B9' },
	};

	function tabHref(t: string, extra = '') {
		const p = new URLSearchParams();
		p.set('tab', t);
		if (data.productFilter) p.set('product', data.productFilter);
		if (t === 'all' && data.statusFilter) p.set('status', data.statusFilter);
		if (data.sort !== 'newest') p.set('sort', data.sort);
		if (extra) extra.split('&').forEach(kv => { const [k,v] = kv.split('='); if (v) p.set(k, v); });
		return '/admin/claims?' + p.toString();
	}

	function filterHref(key: string, val: string) {
		const p = new URLSearchParams();
		p.set('tab', data.tab);
		if (key === 'product') { if (val) p.set('product', val); }
		else if (data.productFilter) p.set('product', data.productFilter);
		if (key === 'status') { if (val) p.set('status', val); }
		else if (data.statusFilter) p.set('status', data.statusFilter);
		if (key === 'sort') { if (val && val !== 'newest') p.set('sort', val); }
		else if (data.sort !== 'newest') p.set('sort', data.sort);
		return '/admin/claims?' + p.toString();
	}
</script>

<div style="padding:32px 36px;font-family:'Montserrat',sans-serif;">
	<h1 style="font-size:22px;font-weight:700;color:#474545;margin:0 0 16px;">Claims</h1>

	<!-- Tab bar -->
	<div style="display:flex;border-bottom:2px solid #EAEAEA;margin-bottom:18px;">
		{#each [
			{ id:'pending', label:'Pending', badge: data.pendingCount },
			{ id:'all',     label:'All Claims' },
		] as t}
			{@const on = data.tab === t.id}
			<a
				href={tabHref(t.id)}
				style="padding:8px 20px;font-size:13px;font-weight:{on?700:500};color:{on?'#2372B9':'#686868'};border-bottom:{on?'2px solid #2372B9':'2px solid transparent'};margin-bottom:-2px;text-decoration:none;display:flex;align-items:center;gap:7px;"
			>
				{t.label}
				{#if t.badge}
					<span style="background:#fef3cd;color:#92640a;border-radius:99px;padding:1px 7px;font-size:11px;font-weight:700;">{t.badge}</span>
				{/if}
			</a>
		{/each}
	</div>

	<!-- Filters -->
	<div style="display:flex;gap:8px;margin-bottom:16px;align-items:center;flex-wrap:wrap;">
		<!-- Product filter -->
		<select
			onchange={(e) => { window.location.href = filterHref('product', (e.currentTarget as HTMLSelectElement).value); }}
			style="height:32px;border:1.5px solid #EAEAEA;border-radius:7px;padding:0 10px;font-family:'Montserrat',sans-serif;font-size:13px;color:#474545;background:#fff;cursor:pointer;width:180px;outline:none;"
		>
			<option value="">All Products</option>
			{#each data.products as p}
				<option value={p.id} selected={data.productFilter === p.id}>{p.name}</option>
			{/each}
		</select>

		{#if data.tab === 'all'}
			<!-- Status filter -->
			<select
				onchange={(e) => { window.location.href = filterHref('status', (e.currentTarget as HTMLSelectElement).value); }}
				style="height:32px;border:1.5px solid #EAEAEA;border-radius:7px;padding:0 10px;font-family:'Montserrat',sans-serif;font-size:13px;color:#474545;background:#fff;cursor:pointer;width:150px;outline:none;"
			>
				<option value="">All Statuses</option>
				<option value="pending"  selected={data.statusFilter === 'pending'}>Pending</option>
				<option value="approved" selected={data.statusFilter === 'approved'}>Approved</option>
				<option value="rejected" selected={data.statusFilter === 'rejected'}>Rejected</option>
				<option value="paid"     selected={data.statusFilter === 'paid'}>Paid</option>
			</select>
		{/if}

		<!-- Sort -->
		<select
			onchange={(e) => { window.location.href = filterHref('sort', (e.currentTarget as HTMLSelectElement).value); }}
			style="height:32px;border:1.5px solid #EAEAEA;border-radius:7px;padding:0 10px;font-family:'Montserrat',sans-serif;font-size:13px;color:#474545;background:#fff;cursor:pointer;width:160px;outline:none;"
		>
			<option value="newest" selected={data.sort !== 'oldest'}>Newest First</option>
			<option value="oldest" selected={data.sort === 'oldest'}>Oldest First</option>
		</select>

		<div style="flex:1;"></div>
		<span style="font-size:12px;color:#686868;">{data.claims.length} {data.tab === 'pending' ? 'pending' : 'total'} claims</span>
	</div>

	<!-- Table -->
	<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
		<table style="width:100%;border-collapse:collapse;">
			<thead>
				<tr>
					<th style="padding:9px 14px;text-align:left;font-size:11px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;border-bottom:2px solid #EAEAEA;background:#fff;white-space:nowrap;">Claim ID</th>
					<th style="padding:9px 14px;text-align:left;font-size:11px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;border-bottom:2px solid #EAEAEA;background:#fff;white-space:nowrap;">Retailer Name</th>
					<th style="padding:9px 14px;text-align:left;font-size:11px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;border-bottom:2px solid #EAEAEA;background:#fff;white-space:nowrap;">Mobile</th>
					<th style="padding:9px 14px;text-align:left;font-size:11px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;border-bottom:2px solid #EAEAEA;background:#fff;white-space:nowrap;">Product</th>
					<th style="padding:9px 14px;text-align:left;font-size:11px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;border-bottom:2px solid #EAEAEA;background:#fff;white-space:nowrap;">Date Created</th>
					<th style="padding:9px 14px;text-align:left;font-size:11px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;border-bottom:2px solid #EAEAEA;background:#fff;white-space:nowrap;">Cashback</th>
					{#if data.tab === 'all'}
						<th style="padding:9px 14px;text-align:left;font-size:11px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;border-bottom:2px solid #EAEAEA;background:#fff;white-space:nowrap;">Status</th>
					{/if}
					<th style="padding:9px 14px;text-align:left;font-size:11px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;border-bottom:2px solid #EAEAEA;background:#fff;white-space:nowrap;">Action</th>
				</tr>
			</thead>
			<tbody>
				{#if data.claims.length === 0}
					<tr>
						<td colspan="8" style="padding:48px 14px;text-align:center;font-size:13px;color:#686868;">No claims found.</td>
					</tr>
				{:else}
					{#each data.claims as claim}
						{@const sc = statusColors[claim.status] ?? { bg:'#F4F6F8', text:'#686868', dot:'#686868' }}
						<tr
							onclick={() => window.location.href = `/admin/claims/${claim.id}`}
							style="border-bottom:1px solid #EAEAEA;background:#fff;cursor:pointer;transition:background 0.12s;"
							onmouseenter={(e) => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
							onmouseleave={(e) => (e.currentTarget as HTMLElement).style.background = '#fff'}
						>
							<td style="padding:10px 14px;font-size:12px;font-family:monospace;color:#2372B9;font-weight:700;">{claim.id.toUpperCase().replace('CLAIM-','CLM-')}</td>
							<td style="padding:10px 14px;font-size:13px;color:#474545;font-weight:600;">{claim.retailer_name}</td>
							<td style="padding:10px 14px;font-size:12px;font-family:monospace;color:#686868;">{claim.mobile}</td>
							<td style="padding:10px 14px;font-size:13px;color:#474545;">{claim.product_name}</td>
							<td style="padding:10px 14px;font-size:12px;color:#686868;">{fmt(claim.created_at)}</td>
							<td style="padding:10px 14px;font-size:13px;color:#474545;font-weight:700;">₹{claim.cashback_amount}</td>
							{#if data.tab === 'all'}
								<td style="padding:10px 14px;">
									<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:99px;background:{sc.bg};color:{sc.text};font-size:11px;font-weight:700;white-space:nowrap;">
										<span style="width:5px;height:5px;border-radius:50%;background:{sc.dot};flex-shrink:0;"></span>
										{claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
									</span>
								</td>
							{/if}
							<td style="padding:10px 14px;">
								<span style="display:inline-flex;align-items:center;gap:4px;color:#2372B9;font-size:11px;font-weight:700;white-space:nowrap;">
									{claim.status === 'pending' ? 'Review' : 'View'}
									<svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
								</span>
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>

		<!-- Pagination footer -->
		{#if data.claims.length > 0}
			<div style="display:flex;align-items:center;justify-content:space-between;padding:11px 16px;border-top:1px solid #EAEAEA;background:#fff;">
				<span style="font-size:12px;color:#686868;">Showing 1–{data.claims.length} of {data.claims.length} results</span>
			</div>
		{/if}
	</div>
</div>
