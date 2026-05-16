<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import QrGeneratorModal from '$lib/components/QrGeneratorModal.svelte';
	import { slugify } from '$lib/utils/slug';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Existing edit state
	let editingId   = $state<string | null>(null);
	let showAddForm = $state(false);
	let editName     = $state('');
	let editRequired = $state(0);
	let editCashback = $state(0);

	// Optimistic active state for toggle
	let optimisticActive = $state<Record<string, boolean>>({});

	// QR modal state
	let modalOpen    = $state(false);
	let modalProduct = $state<{ id: string; name: string } | null>(null);

	function startEdit(p: { id: string; name: string; coupons_required: number; cashback_amount: number }) {
		editingId    = p.id;
		editName     = p.name;
		editRequired = p.coupons_required;
		editCashback = p.cashback_amount;
	}

	function cancelEdit() { editingId = null; }

	function openQrModal(p: { id: string; name: string }) {
		modalProduct = { id: p.id, name: p.name };
		modalOpen = true;
	}

	function isActive(p: { id: string; active: boolean }) {
		return p.id in optimisticActive ? optimisticActive[p.id] : p.active;
	}

	$effect(() => {
		if (form && !(form as any)?.updateError) editingId = null;
		if (form && !(form as any)?.createError) showAddForm = false;
	});
</script>

<div class="pg" style="padding:32px 36px;font-family:'Montserrat',sans-serif;">

	<!-- Header row -->
	<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;gap:10px;flex-wrap:wrap;">
		<h1 style="font-size:22px;font-weight:700;color:#474545;margin:0;">Products</h1>
		<div style="display:flex;gap:8px;">
			<!-- <a
				href="/admin/products/batches"
				style="display:inline-flex;align-items:center;gap:6px;background:#fff;color:#2372B9;border:1.5px solid #2372B9;border-radius:7px;padding:8px 14px;font-size:12px;font-weight:700;font-family:'Montserrat',sans-serif;text-decoration:none;"
			>
				<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/><path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 19h2M19 14h2" stroke="currentColor" stroke-width="2" stroke-linecap="square"/></svg>
				View All Batches
			</a> -->
			<button
				type="button"
				onclick={() => showAddForm = !showAddForm}
				style="display:inline-flex;align-items:center;gap:5px;background:#2372B9;color:#fff;border:none;border-radius:7px;padding:8px 14px;font-size:13px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>
				Add Product
			</button>
		</div>
	</div>

	<!-- Add product form -->
	{#if showAddForm}
		<div style="background:#fff;border-radius:10px;border:2px solid #2372B9;padding:18px 20px;box-shadow:0 0 0 3px #e8f1fb;margin-bottom:20px;">
			<div style="font-size:14px;font-weight:700;color:#474545;margin-bottom:14px;">New Product</div>
			<form method="POST" action="?/create" use:enhance class="add-form" style="display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap;">
				<div class="add-field-name" style="flex:1;min-width:180px;">
					<label for="new-name" style="font-size:11px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:5px;">Product Name</label>
					<input id="new-name" name="name" placeholder="e.g. Amoxicillin 500mg" required style="width:100%;border:2px solid #EAEAEA;border-radius:7px;padding:7px 10px;font-family:'Montserrat',sans-serif;font-size:13px;color:#474545;outline:none;box-sizing:border-box;"/>
				</div>
				<div style="width:130px;">
					<label for="new-coupons" style="font-size:11px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:5px;">Coupons Req.</label>
					<input id="new-coupons" name="coupons_required" type="number" min="1" placeholder="5" required style="width:100%;border:2px solid #EAEAEA;border-radius:7px;padding:7px 10px;font-family:'Montserrat',sans-serif;font-size:13px;color:#474545;outline:none;box-sizing:border-box;"/>
				</div>
				<div style="width:130px;">
					<label for="new-cashback" style="font-size:11px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:5px;">Cashback (₹)</label>
					<input id="new-cashback" name="cashback_amount" type="number" min="1" placeholder="100" required style="width:100%;border:2px solid #EAEAEA;border-radius:7px;padding:7px 10px;font-family:'Montserrat',sans-serif;font-size:13px;color:#474545;outline:none;box-sizing:border-box;"/>
				</div>
				<div style="display:flex;gap:8px;">
					<button type="submit" style="background:#3d8c1a;color:#fff;border:none;border-radius:7px;padding:9px 16px;font-size:12px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;">Save</button>
					<button type="button" onclick={() => showAddForm = false} style="background:#fff;color:#474545;border:1.5px solid #EAEAEA;border-radius:7px;padding:9px 16px;font-size:12px;font-weight:600;font-family:'Montserrat',sans-serif;cursor:pointer;">Cancel</button>
				</div>
			</form>
			{#if (form as any)?.createError}
				<p style="font-size:12px;color:#E53E3E;margin-top:8px;">{(form as any).createError}</p>
			{/if}
		</div>
	{/if}

	<!-- Product grid -->
	{#if data.products.length === 0}
		<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 24px;text-align:center;">
			<div style="width:56px;height:56px;border-radius:14px;background:#e8f1fb;display:flex;align-items:center;justify-content:center;margin-bottom:20px;">
				<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#2372B9" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="#2372B9" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="#2372B9" stroke-width="2"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="#2372B9" stroke-width="2"/></svg>
			</div>
			<div style="font-size:17px;font-weight:700;color:#474545;margin-bottom:8px;">No products yet</div>
			<div style="font-size:13px;color:#686868;max-width:320px;line-height:1.6;margin-bottom:24px;">Products are the medicine SKUs enrolled in the cashback program. Each product has a coupon threshold and a cashback amount.</div>
			<button
				type="button"
				onclick={() => showAddForm = true}
				style="display:inline-flex;align-items:center;gap:6px;background:#2372B9;color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:13px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;"
			>
				<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>
				Add your first product
			</button>
		</div>
	{:else}
	<div class="prod-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;">
		{#each data.products as p}
			{@const editing   = editingId === p.id}
			{@const active    = isActive(p)}
			<div
				class="prod-card"
				style="background:#fff;border-radius:10px;border:{editing ? '2px solid #2372B9' : '1px solid #EAEAEA'};padding:18px 20px;box-shadow:{editing ? '0 0 0 3px #e8f1fb,0 6px 18px rgba(35,114,185,0.18)' : '0 1px 4px rgba(0,0,0,0.04)'};transition:box-shadow 180ms,border-color 180ms;"
			>
				<!-- Card header: name + toggle -->
				<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:8px;">
					<a
						href="/admin/products/{slugify(p.name)}/batches"
						style="font-size:16px;font-weight:700;color:{active ? '#474545' : '#999'};line-height:1.3;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-decoration:none;pointer-events:{editing ? 'none' : 'auto'};"
					>{p.name}</a>

					{#if !editing}
						<!-- iOS-style toggle -->
						<form method="POST" action="?/toggleActive" use:enhance={() => {
							optimisticActive = { ...optimisticActive, [p.id]: !active };
							return async ({ update, result }) => {
								await update();
								if (result.type === 'failure') {
									const next = { ...optimisticActive };
									delete next[p.id];
									optimisticActive = next;
								} else {
									const next = { ...optimisticActive };
									delete next[p.id];
									optimisticActive = next;
								}
							};
						}}>
							<input type="hidden" name="id" value={p.id} />
							<button
								type="submit"
								title="{active ? 'Deactivate' : 'Activate'}"
								style="display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;padding:0;flex-shrink:0;"
							>
								<!-- track -->
								<div style="width:32px;height:16px;border-radius:99px;background:{active ? '#3d8c1a' : '#cdd0d4'};transition:background 200ms;position:relative;flex-shrink:0;">
									<!-- knob -->
									<div style="position:absolute;top:2px;left:{active ? '16px' : '2px'};width:12px;height:12px;border-radius:50%;background:#fff;transition:left 200ms;box-shadow:0 1px 3px rgba(0,0,0,0.2);"></div>
								</div>
								<span style="font-size:11px;font-weight:600;color:{active ? '#3d8c1a' : '#686868'};">{active ? 'Active' : 'Inactive'}</span>
							</button>
						</form>
					{:else}
						<span style="font-size:11px;font-weight:700;color:#2372B9;background:#e8f1fb;padding:3px 8px;border-radius:99px;white-space:nowrap;flex-shrink:0;">Editing</span>
					{/if}
				</div>

				<!-- Stat tiles -->
				<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
					<div style="background:#F4F6F8;border-radius:7px;padding:8px 10px;">
						<div style="font-size:9px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:5px;">Coupons Req.</div>
						{#if editing}
							<input type="number" min="1" bind:value={editRequired} style="width:100%;border:2px solid #2372B9;border-radius:6px;padding:4px 8px;font-family:'Montserrat',sans-serif;font-size:16px;font-weight:700;color:#474545;outline:none;background:#fff;box-sizing:border-box;"/>
						{:else}
							<div style="font-size:17px;font-weight:700;color:#474545;">{p.coupons_required}</div>
						{/if}
					</div>
					<div style="background:#F4F6F8;border-radius:7px;padding:8px 10px;">
						<div style="font-size:9px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:5px;">Cashback (₹)</div>
						{#if editing}
							<input type="number" min="1" bind:value={editCashback} style="width:100%;border:2px solid #2372B9;border-radius:6px;padding:4px 8px;font-family:'Montserrat',sans-serif;font-size:16px;font-weight:700;color:#2372B9;outline:none;background:#fff;box-sizing:border-box;"/>
						{:else}
							<div style="font-size:17px;font-weight:700;color:#2372B9;">₹{p.cashback_amount}</div>
						{/if}
					</div>
				</div>

				<!-- Mini stats -->
				<div style="display:flex;justify-content:space-between;font-size:11px;color:#686868;margin-bottom:{editing ? 12 : 0}px;padding-bottom:{editing ? 0 : 12}px;{editing ? '' : 'border-bottom:1px solid #EAEAEA;'}">
					<span>Coupons in: <strong style="color:#474545;">{(p as any).submitted_count ?? 0}</strong></span>
					<span>Claims: <strong style="color:#474545;">{(p as any).claims_count ?? 0}</strong></span>
				</div>

				<!-- Edit form actions -->
				{#if editing}
					<form method="POST" action="?/update" use:enhance onsubmit={() => { editingId = null; }}>
						<input type="hidden" name="id" value={p.id} />
						<input type="hidden" name="name" value={editName} />
						<input type="hidden" name="coupons_required" value={editRequired} />
						<input type="hidden" name="cashback_amount" value={editCashback} />
						<div style="display:flex;gap:8px;">
							<button type="submit" style="flex:1;background:#3d8c1a;color:#fff;border:none;border-radius:7px;padding:9px;font-size:12px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;">Save</button>
							<button type="button" onclick={cancelEdit} style="flex:1;background:#fff;color:#474545;border:1.5px solid #EAEAEA;border-radius:7px;padding:9px;font-size:12px;font-weight:600;font-family:'Montserrat',sans-serif;cursor:pointer;">Cancel</button>
						</div>
					</form>
					{#if (form as any)?.updateError && (form as any)?.updateId === p.id}
						<p style="font-size:12px;color:#E53E3E;margin-top:6px;">{(form as any).updateError}</p>
					{/if}

				<!-- Normal action row -->
				{:else}
					<div style="display:flex;gap:8px;align-items:center;">
						<!-- Generate QR — wide primary ghost action -->
						<button
							type="button"
							onclick={() => openQrModal(p)}
							class="qr-btn"
							style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;background:#e8f1fb;color:#2372B9;border:1.5px solid #2372B9;border-radius:7px;padding:8px 12px;font-size:12px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;transition:background 150ms,color 150ms;"
						>
							<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/><path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 19h2M19 14h2" stroke="currentColor" stroke-width="2" stroke-linecap="square"/></svg>
							Generate QR
						</button>
						<!-- Edit icon button -->
						<button
							type="button"
							onclick={() => startEdit(p)}
							title="Edit product"
							style="width:34px;height:32px;display:flex;align-items:center;justify-content:center;background:#fff;color:#686868;border:1.5px solid #EAEAEA;border-radius:7px;cursor:pointer;flex-shrink:0;"
						>
							<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 20h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
						</button>
					</div>
				{/if}
			</div>
		{/each}
	</div>
	{/if}
</div>

<!-- QR Generator Modal -->
<QrGeneratorModal
	open={modalOpen}
	product={modalProduct}
	onclose={() => { modalOpen = false; modalProduct = null; }}
/>

<style>
	@media (max-width: 768px) {
		.pg { padding: 16px 14px !important; }
		.prod-grid { grid-template-columns: 1fr !important; }
		.add-form { flex-direction: column !important; }
		.add-field-name { min-width: 100% !important; }
	}
	@media (min-width: 769px) and (max-width: 1024px) {
		.prod-grid { grid-template-columns: repeat(2, 1fr) !important; }
	}
	.prod-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06) !important; }
	.qr-btn:hover { background: #2372B9 !important; color: #fff !important; }
	.qr-btn:hover svg { stroke: #fff; }
</style>
