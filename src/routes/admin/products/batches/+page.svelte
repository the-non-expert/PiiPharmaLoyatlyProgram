<script lang="ts">
	import type { PageData } from './$types';
	import { slugify } from '$lib/utils/slug';

	let { data }: { data: PageData } = $props();

	let search = $state('');

	const filtered = $derived(
		search.trim()
			? data.products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
			: data.products
	);

	function formatDay(iso: string) {
		return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
	}
</script>

<div style="padding:32px 36px;font-family:'Montserrat',sans-serif;">

	<!-- Breadcrumb -->
	<div style="display:flex;align-items:center;gap:6px;font-size:12px;margin-bottom:16px;">
		<a href="/admin/products" style="color:#2372B9;text-decoration:none;font-weight:600;">Products</a>
		<span style="color:#EAEAEA;">/</span>
		<span style="color:#474545;">All Batches</span>
	</div>

	<!-- Header -->
	<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;gap:12px;flex-wrap:wrap;">
		<h1 style="font-size:22px;font-weight:700;color:#474545;margin:0;">All Batches</h1>
		<div style="position:relative;">
			<svg style="position:absolute;left:10px;top:50%;transform:translateY(-50%);pointer-events:none;" width="13" height="13" viewBox="0 0 24 24" fill="none">
				<circle cx="11" cy="11" r="7" stroke="#686868" stroke-width="2"/>
				<path d="M20 20l-3-3" stroke="#686868" stroke-width="2" stroke-linecap="round"/>
			</svg>
			<input
				type="search"
				placeholder="Search products"
				bind:value={search}
				style="border:1.5px solid #EAEAEA;border-radius:7px;padding:7px 10px 7px 32px;font-size:12px;font-family:'Montserrat',sans-serif;color:#474545;outline:none;width:220px;height:34px;box-sizing:border-box;"
			/>
		</div>
	</div>
	<div style="font-size:12px;color:#686868;margin-bottom:20px;">{data.products.length} products</div>

	<!-- Table -->
	<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
		<table style="width:100%;border-collapse:collapse;">
			<thead>
				<tr style="border-bottom:2px solid #EAEAEA;">
					{#each ['Product', 'Status', 'Batches', 'Total stickers', 'Last batch', ''] as col}
						<th style="padding:10px 16px;font-size:11px;font-weight:700;color:#686868;text-align:left;white-space:nowrap;text-transform:uppercase;letter-spacing:0.05em;">{col}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#if filtered.length === 0}
					<tr>
						<td colspan="6" style="padding:40px;text-align:center;color:#686868;font-size:13px;">
							{search.trim() ? 'No products match your search.' : 'No products found.'}
						</td>
					</tr>
				{:else}
					{#each filtered as p}
						<tr style="border-bottom:1px solid #EAEAEA;" class="batch-row">
							<td style="padding:12px 16px;">
								<span style="font-size:13px;font-weight:700;color:#474545;">{p.name}</span>
							</td>
							<td style="padding:12px 16px;">
								{#if p.active}
									<span style="display:inline-flex;align-items:center;gap:4px;background:#f0f9e6;color:#3d6e10;border-radius:99px;padding:3px 9px;font-size:10px;font-weight:700;">
										<span style="width:5px;height:5px;border-radius:50%;background:#3d8c1a;display:inline-block;"></span>
										Active
									</span>
								{:else}
									<span style="display:inline-flex;align-items:center;gap:4px;background:#F4F6F8;color:#686868;border-radius:99px;padding:3px 9px;font-size:10px;font-weight:700;">
										<span style="width:5px;height:5px;border-radius:50%;background:#686868;display:inline-block;"></span>
										Inactive
									</span>
								{/if}
							</td>
							<td style="padding:12px 16px;font-size:13px;font-weight:600;color:#474545;">{p.batch_count}</td>
							<td style="padding:12px 16px;font-size:13px;color:#474545;">{p.total_printed.toLocaleString('en-IN')}</td>
							<td style="padding:12px 16px;font-size:12px;color:#686868;">
								{p.last_batch_at ? formatDay(p.last_batch_at) : '—'}
							</td>
							<td style="padding:12px 16px;">
								<a
									href="/admin/products/{slugify(p.name)}/batches"
									style="display:inline-flex;align-items:center;gap:5px;background:#e8f1fb;color:#2372B9;border:1.5px solid #2372B9;border-radius:6px;padding:5px 11px;font-size:11px;font-weight:700;font-family:'Montserrat',sans-serif;text-decoration:none;white-space:nowrap;"
								>
									<svg width="11" height="11" viewBox="0 0 24 24" fill="none">
										<rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
										<rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
										<rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
										<path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 19h2M19 14h2" stroke="currentColor" stroke-width="2" stroke-linecap="square"/>
									</svg>
									View batches
								</a>
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>

<style>
	@media (max-width: 768px) {
		div[style*="padding:32px"] { padding: 16px 14px !important; }
	}
	.batch-row:last-child { border-bottom: none !important; }
	.batch-row:hover { background: #FAFBFC; }
</style>
