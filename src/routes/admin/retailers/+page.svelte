<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const initialSearch = data.search;
	let searchInput = $state(initialSearch);

	function fmt(s: string) {
		return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
	}

	function handleSearch(e: Event) {
		e.preventDefault();
		const q = searchInput.trim();
		window.location.href = '/admin/retailers' + (q ? '?q=' + encodeURIComponent(q) : '');
	}
</script>

<div style="padding:32px 36px;font-family:'Montserrat',sans-serif;">
	<h1 style="font-size:22px;font-weight:700;color:#474545;margin:0 0 20px;">Retailers</h1>

	<!-- Search -->
	<div style="margin-bottom:16px;">
		<form onsubmit={handleSearch}>
			<div style="display:flex;align-items:center;border:1.5px solid #EAEAEA;border-radius:8px;background:#fff;overflow:hidden;width:340px;">
				<div style="padding:0 12px;display:flex;align-items:center;flex-shrink:0;">
					<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#686868" stroke-width="2"/><path d="M21 21l-4-4" stroke="#686868" stroke-width="2" stroke-linecap="round"/></svg>
				</div>
				<input
					type="text"
					bind:value={searchInput}
					placeholder="Search by name or mobile number"
					style="flex:1;height:34px;border:none;outline:none;font-family:'Montserrat',sans-serif;font-size:13px;color:#474545;background:transparent;"
				/>
				{#if searchInput}
					<button
						type="button"
						onclick={() => { searchInput = ''; window.location.href = '/admin/retailers'; }}
						style="padding:0 10px;background:none;border:none;cursor:pointer;color:#686868;font-size:16px;line-height:1;"
					>×</button>
				{/if}
			</div>
		</form>
	</div>

	<!-- Table -->
	<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
		<table style="width:100%;border-collapse:collapse;">
			<thead>
				<tr>
					{#each ['Name','Mobile','City','State','UPI ID','Registered On','Total Claims','Cashback Earned'] as col}
						<th style="padding:9px 14px;text-align:left;font-size:11px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;border-bottom:2px solid #EAEAEA;background:#fff;white-space:nowrap;">{col}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#if data.retailers.length === 0}
					<tr>
						<td colspan="8" style="padding:48px 14px;text-align:center;font-size:13px;color:#686868;">
							{data.search ? 'No retailers match your search.' : 'No retailers registered yet.'}
						</td>
					</tr>
				{:else}
					{#each data.retailers as r}
						<tr style="border-bottom:1px solid #EAEAEA;background:#fff;">
							<td style="padding:10px 14px;font-size:13px;color:#474545;font-weight:600;">{r.name}</td>
							<td style="padding:10px 14px;font-size:12px;font-family:monospace;color:#686868;">{r.mobile}</td>
							<td style="padding:10px 14px;font-size:13px;color:#474545;">{r.city}</td>
							<td style="padding:10px 14px;font-size:13px;color:#686868;">{r.state}</td>
							<td style="padding:10px 14px;font-size:11px;font-family:monospace;color:#686868;">{r.upi_id}</td>
							<td style="padding:10px 14px;font-size:12px;color:#686868;">{fmt(r.registered_at)}</td>
							<td style="padding:10px 14px;font-size:13px;color:#474545;font-weight:600;text-align:center;">{r.total_claims}</td>
							<td style="padding:10px 14px;font-size:13px;color:#474545;font-weight:700;">₹{r.cashback_earned.toLocaleString('en-IN')}</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>

		{#if data.retailers.length > 0}
			<div style="display:flex;align-items:center;justify-content:space-between;padding:11px 16px;border-top:1px solid #EAEAEA;background:#fff;">
				<span style="font-size:12px;color:#686868;">Showing 1–{data.retailers.length} of {data.retailers.length} retailers</span>
			</div>
		{/if}
	</div>
</div>
