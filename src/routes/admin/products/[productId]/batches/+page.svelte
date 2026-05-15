<script lang="ts">
	import type { PageData } from './$types';
	import QrGeneratorModal from '$lib/components/QrGeneratorModal.svelte';

	let { data }: { data: PageData } = $props();

	let search      = $state('');
	let modalOpen   = $state(false);
	let activeTab   = $state<'overview' | 'batches' | 'settings'>('batches');
	let openMenuId  = $state<string | null>(null);

	const filtered = $derived(
		search.trim()
			? data.batches.filter(b => b.id.toLowerCase().includes(search.toLowerCase()))
			: data.batches
	);

	function formatDate(iso: string) {
		return new Date(iso).toLocaleString('en-IN', {
			day: 'numeric', month: 'short', year: 'numeric',
			hour: '2-digit', minute: '2-digit', hour12: false
		});
	}

	function formatDay(iso: string) {
		return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
	}

	function toggleMenu(id: string) {
		openMenuId = openMenuId === id ? null : id;
	}

	function handleDocClick() { openMenuId = null; }
</script>

<svelte:document onclick={handleDocClick} />

<div class="pg" style="padding:28px 36px;font-family:'Montserrat',sans-serif;">

	<!-- Breadcrumb -->
	<div style="display:flex;align-items:center;gap:6px;font-size:12px;margin-bottom:16px;">
		<a href="/admin/products" style="color:#2372B9;text-decoration:none;font-weight:600;">Products</a>
		<span style="color:#EAEAEA;">/</span>
		<span style="color:#474545;">{data.product.name}</span>
	</div>

	<!-- Title row -->
	<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;gap:12px;flex-wrap:wrap;">
		<h1 style="font-size:22px;font-weight:700;color:#474545;margin:0;">{data.product.name}</h1>
		<button
			type="button"
			onclick={() => modalOpen = true}
			style="display:inline-flex;align-items:center;gap:6px;background:#2372B9;color:#fff;border:none;border-radius:7px;padding:9px 16px;font-size:13px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(35,114,185,0.3);"
		>
			<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="#fff" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="#fff" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="#fff" stroke-width="2"/><path d="M14 14h3v3h-3zM18 18h3v3h-3z" fill="#fff"/></svg>
			Generate new batch
		</button>
	</div>

	<!-- Subtitle -->
	<div style="font-size:12px;color:#686868;margin-bottom:18px;">
		{data.product.coupons_required} coupons required · ₹{data.product.cashback_amount} cashback ·
		{data.stats.totalPrinted.toLocaleString('en-IN')} stickers in market ·
		{data.batches.length} batches printed
	</div>

	<!-- Tabs -->
	<div style="display:flex;gap:0;border-bottom:2px solid #EAEAEA;margin-bottom:18px;">
		{#each [{ id: 'overview', label: 'Overview' }, { id: 'batches', label: `Batches (${data.batches.length})` }, { id: 'settings', label: 'Settings' }] as tab}
			<button
				type="button"
				onclick={() => activeTab = tab.id as 'overview' | 'batches' | 'settings'}
				style="background:none;border:none;cursor:pointer;padding:10px 20px;font-size:13px;font-weight:{activeTab === tab.id ? 700 : 500};color:{activeTab === tab.id ? '#2372B9' : '#686868'};font-family:'Montserrat',sans-serif;border-bottom:{activeTab === tab.id ? '2px solid #2372B9' : '2px solid transparent'};margin-bottom:-2px;"
			>{tab.label}</button>
		{/each}
	</div>

	{#if activeTab === 'batches'}
		<!-- KPI strip -->
		<div class="kpi-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;">
			{#each [
				{ label: 'Total stickers printed', value: data.stats.totalPrinted.toLocaleString('en-IN'), sub: `across ${data.batches.length} batches`, accent: '#2372B9' },
				{ label: 'In market',               value: data.stats.inMarket.toLocaleString('en-IN'),     sub: `${Math.round(data.stats.inMarket / data.stats.totalPrinted * 100)}% of printed`,    accent: '#474545' },
				{ label: 'Scanned at least once',   value: data.stats.scannedOnce.toLocaleString('en-IN'),  sub: `${Math.round(data.stats.scannedOnce / data.stats.inMarket * 100)}% of in-market`, accent: '#3d8c1a' },
				{ label: 'Last batch',              value: formatDay(data.stats.lastBatch.generated_at),     sub: `${data.stats.lastBatch.quantity.toLocaleString('en-IN')} codes`,                   accent: '#F59E0B' },
			] as kpi}
				<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;padding:14px 16px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
					<div style="font-size:11px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">{kpi.label}</div>
					<div style="font-size:22px;font-weight:700;color:{kpi.accent};line-height:1.1;margin-bottom:3px;">{kpi.value}</div>
					<div style="font-size:11px;color:#686868;">{kpi.sub}</div>
				</div>
			{/each}
		</div>

		<!-- Toolbar -->
		<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
			<div style="font-size:14px;font-weight:700;color:#474545;">Batch history</div>
			<span style="font-size:12px;color:#686868;">{data.batches.length} batches</span>
			<div style="flex:1;"></div>
			<div style="position:relative;">
				<svg style="position:absolute;left:10px;top:50%;transform:translateY(-50%);pointer-events:none;" width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#686868" stroke-width="2"/><path d="M20 20l-3-3" stroke="#686868" stroke-width="2" stroke-linecap="round"/></svg>
				<input
					type="search"
					placeholder="Search batch ID"
					bind:value={search}
					style="border:1.5px solid #EAEAEA;border-radius:7px;padding:7px 10px 7px 32px;font-size:12px;font-family:'Montserrat',sans-serif;color:#474545;outline:none;width:220px;height:32px;box-sizing:border-box;"
				/>
			</div>
		</div>

		<!-- Table (desktop) -->
		{#if filtered.length > 0}
			<div class="batch-table-wrap" style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
				<table style="width:100%;border-collapse:collapse;">
					<thead>
						<tr style="border-bottom:2px solid #EAEAEA;">
							{#each ['Batch ID', 'Quantity', 'Serial Range', 'Format', 'Generated', 'By', 'Status', 'Actions'] as col}
								<th style="padding:9px 14px;font-size:11px;font-weight:700;color:#686868;text-align:left;white-space:nowrap;">{col}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each filtered as batch}
							<tr style="border-bottom:1px solid #EAEAEA;" class="batch-row">
								<td style="padding:11px 14px;">
									<span style="font-family:monospace;font-size:12px;font-weight:700;color:#2372B9;">{batch.id}</span>
								</td>
								<td style="padding:11px 14px;font-size:13px;font-weight:700;color:#474545;">
									{batch.quantity.toLocaleString('en-IN')}
								</td>
								<td style="padding:11px 14px;font-family:monospace;font-size:11px;color:#686868;white-space:nowrap;">
									{batch.serial_start} → {batch.serial_end}
								</td>
								<td style="padding:11px 14px;">
									{#if batch.format === 'pdf'}
										<span style="display:inline-flex;align-items:center;gap:4px;background:#fde8e8;color:#9b2626;border:1px solid #fca5a5;border-radius:99px;padding:2px 8px;font-size:10px;font-weight:700;white-space:nowrap;">
											PDF · {batch.file_size_mb} MB
										</span>
									{:else}
										<span style="display:inline-flex;align-items:center;gap:4px;background:#e8f1fb;color:#14407a;border:1px solid #93c5fd;border-radius:99px;padding:2px 8px;font-size:10px;font-weight:700;white-space:nowrap;">
											ZIP · {batch.file_size_mb} MB
										</span>
									{/if}
								</td>
								<td style="padding:11px 14px;font-size:12px;color:#686868;white-space:nowrap;">
									{formatDate(batch.generated_at)}
								</td>
								<td style="padding:11px 14px;font-size:12px;color:#474545;white-space:nowrap;">
									{batch.generated_by}
								</td>
								<td style="padding:11px 14px;">
									{#if batch.status === 'active'}
										<span style="display:inline-flex;align-items:center;gap:4px;background:#f0f9e6;color:#3d6e10;border-radius:99px;padding:3px 9px;font-size:10px;font-weight:700;">
											<span style="width:5px;height:5px;border-radius:50%;background:#3d8c1a;display:inline-block;"></span>
											Active
										</span>
									{:else}
										<span style="display:inline-flex;align-items:center;gap:4px;background:#F4F6F8;color:#686868;border-radius:99px;padding:3px 9px;font-size:10px;font-weight:700;">
											<span style="width:5px;height:5px;border-radius:50%;background:#686868;display:inline-block;"></span>
											Archived
										</span>
									{/if}
								</td>
								<td style="padding:11px 14px;">
									<div style="display:flex;align-items:center;gap:6px;">
										<button
											type="button"
											style="display:inline-flex;align-items:center;gap:5px;background:#fff;color:#2372B9;border:1.5px solid #EAEAEA;border-radius:6px;padding:5px 10px;font-size:11px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;white-space:nowrap;"
										>
											<svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
											Re-download
										</button>
										<div style="position:relative;">
											<button
												type="button"
												onclick={(e) => { e.stopPropagation(); toggleMenu(batch.id); }}
												style="width:28px;height:26px;display:flex;align-items:center;justify-content:center;background:#fff;color:#686868;border:1.5px solid #EAEAEA;border-radius:6px;cursor:pointer;font-size:14px;"
												aria-label="More actions"
											>⋯</button>
											{#if openMenuId === batch.id}
												<div
													onclick={(e) => e.stopPropagation()}
													style="position:absolute;right:0;top:calc(100% + 4px);background:#fff;border:1px solid #EAEAEA;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.12);padding:4px;z-index:100;width:188px;"
												>
													{#each ['View payload sample', 'Copy serial range', batch.status === 'active' ? 'Archive batch' : 'Restore batch', 'Download CSV of serials'] as action}
														<button
															type="button"
															onclick={() => openMenuId = null}
															style="display:block;width:100%;text-align:left;padding:8px 12px;font-size:12px;font-weight:500;color:{action === 'Archive batch' ? '#E53E3E' : '#474545'};background:none;border:none;cursor:pointer;border-radius:6px;font-family:'Montserrat',sans-serif;"
															onmouseenter={(e) => (e.currentTarget.style.background='#F4F6F8')}
															onmouseleave={(e) => (e.currentTarget.style.background='none')}
														>{action}</button>
													{/each}
												</div>
											{/if}
										</div>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Mobile cards -->
			<div class="batch-cards">
				{#each filtered as batch}
					<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;padding:14px 16px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
						<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
							<span style="font-family:monospace;font-size:13px;font-weight:700;color:#2372B9;">{batch.id}</span>
							{#if batch.status === 'active'}
								<span style="display:inline-flex;align-items:center;gap:4px;background:#f0f9e6;color:#3d6e10;border-radius:99px;padding:3px 9px;font-size:10px;font-weight:700;">
									<span style="width:5px;height:5px;border-radius:50%;background:#3d8c1a;display:inline-block;"></span>Active
								</span>
							{:else}
								<span style="display:inline-flex;align-items:center;gap:4px;background:#F4F6F8;color:#686868;border-radius:99px;padding:3px 9px;font-size:10px;font-weight:700;">Archived</span>
							{/if}
						</div>
						<div style="font-size:11px;color:#686868;margin-bottom:4px;font-family:monospace;">{batch.serial_start} → {batch.serial_end}</div>
						<div style="font-size:11px;color:#686868;margin-bottom:10px;">{batch.quantity.toLocaleString('en-IN')} codes · {formatDate(batch.generated_at)}</div>
						<button type="button" style="width:100%;display:flex;align-items:center;justify-content:center;gap:5px;background:#fff;color:#2372B9;border:1.5px solid #EAEAEA;border-radius:6px;padding:8px;font-size:12px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;">
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
							Re-download
						</button>
					</div>
				{/each}
			</div>

		<!-- Empty state -->
		{:else if search}
			<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;padding:48px 24px;text-align:center;">
				<div style="font-size:13px;font-weight:600;color:#474545;margin-bottom:6px;">No batches match "{search}"</div>
				<div style="font-size:12px;color:#686868;">Try a different batch ID.</div>
			</div>
		{:else}
			<div style="background:#fff;border-radius:10px;border:2px dashed #EAEAEA;padding:56px 24px;text-align:center;">
				<div style="width:56px;height:56px;background:#F4F6F8;border-radius:10px;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;">
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="#686868" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="#686868" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="#686868" stroke-width="2"/><path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 19h2M19 14h2" stroke="#686868" stroke-width="2" stroke-linecap="square"/></svg>
				</div>
				<div style="font-size:14px;font-weight:700;color:#474545;margin-bottom:8px;">No batches printed yet</div>
				<div style="font-size:12px;color:#686868;margin-bottom:18px;max-width:280px;margin-left:auto;margin-right:auto;line-height:1.6;">Generate your first batch to start placing stickers on product boxes.</div>
				<button
					type="button"
					onclick={() => modalOpen = true}
					style="display:inline-flex;align-items:center;gap:6px;background:#2372B9;color:#fff;border:none;border-radius:7px;padding:9px 18px;font-size:13px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(35,114,185,0.3);"
				>Generate first batch</button>
			</div>
		{/if}

	{:else if activeTab === 'overview'}
		<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;padding:28px;text-align:center;color:#686868;font-size:13px;">
			Overview content coming soon.
		</div>
	{:else}
		<div style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;padding:28px;text-align:center;color:#686868;font-size:13px;">
			Settings content coming soon.
		</div>
	{/if}
</div>

<!-- QR Generator Modal -->
<QrGeneratorModal
	open={modalOpen}
	product={data.product}
	onclose={() => modalOpen = false}
/>

<style>
	@media (max-width: 768px) {
		.pg { padding: 16px 14px !important; }
		.kpi-grid { grid-template-columns: 1fr 1fr !important; }
	}
	@media (max-width: 480px) {
		.kpi-grid { grid-template-columns: 1fr !important; }
	}
	.batch-table-wrap { display: block; }
	.batch-cards { display: none; gap: 10px; flex-direction: column; }
	@media (max-width: 1024px) {
		.batch-table-wrap { display: none !important; }
		.batch-cards { display: flex !important; }
	}
	.batch-row:hover { background: #fafafa; }
</style>
