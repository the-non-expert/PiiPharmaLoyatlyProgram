<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageData, ActionData } from './$types';
	import { slugify } from '$lib/utils/slug';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showAddForm = $state(false);
	let optimisticActive = $state<Record<string, boolean>>({});

	function isActive(p: { id: string; active: boolean }) {
		return p.id in optimisticActive ? optimisticActive[p.id] : p.active;
	}

	$effect(() => {
		if (form && !(form as any)?.createError) showAddForm = false;
	});
</script>

<div class="pg" style="padding:32px 36px;font-family:'Montserrat',sans-serif;">

	<!-- Header row -->
	<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;gap:10px;flex-wrap:wrap;">
		<h1 style="font-size:22px;font-weight:700;color:#474545;margin:0;">Products</h1>
		<button
			type="button"
			onclick={() => showAddForm = !showAddForm}
			style="display:inline-flex;align-items:center;gap:5px;background:#2372B9;color:#fff;border:none;border-radius:7px;padding:8px 14px;font-size:13px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;"
		>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>
			Add Product
		</button>
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

	<!-- Empty state -->
	{#if data.products.length === 0}
		<div style="background:#fff;border-radius:12px;border:1px solid #EAEAEA;padding:64px 32px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
			<div style="width:64px;height:64px;border-radius:14px;background:#F4F6F8;border:2px dashed #EAEAEA;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
				<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M19 11H5M19 11a7 7 0 11-14 0 7 7 0 0114 0zM12 8v6M9 11h6" stroke="#BDBDBD" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
			</div>
			<p style="font-size:16px;font-weight:700;color:#474545;margin:0 0 8px;">No products yet</p>
			<p style="font-size:13px;color:#686868;margin:0 0 24px;max-width:340px;margin-left:auto;margin-right:auto;line-height:1.6;">Products are the medicine SKUs in your loyalty program. Each one has a coupon threshold and a cashback amount retailers earn when they hit it.</p>
			<button
				type="button"
				onclick={() => showAddForm = true}
				style="display:inline-flex;align-items:center;gap:6px;background:#2372B9;color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:13px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>
				Add your first product
			</button>
		</div>
	{/if}

	<!-- Product grid -->
	<div class="prod-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;">
		{#each data.products as p}
			{@const active = isActive(p)}
			<div
				class="prod-card"
				role="link"
				tabindex="0"
				onclick={() => goto(`/admin/products/${slugify(p.name)}/batches`)}
				onkeydown={(e) => { if (e.key === 'Enter') goto(`/admin/products/${slugify(p.name)}/batches`); }}
				style="background:#fff;border-radius:10px;border:1px solid #EAEAEA;padding:18px 20px;box-shadow:0 1px 4px rgba(0,0,0,0.04);transition:box-shadow 180ms,border-color 180ms;cursor:pointer;"
			>
				<!-- Card header: name + toggle -->
				<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:8px;">
					<div style="font-size:16px;font-weight:700;color:{active ? '#2372B9' : '#999'};line-height:1.3;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{p.name}</div>

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
					}} onclick={(e) => e.stopPropagation()}>
						<input type="hidden" name="id" value={p.id} />
						<button
							type="submit"
							title="{active ? 'Deactivate' : 'Activate'}"
							style="display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;padding:0;flex-shrink:0;"
							onclick={(e) => e.stopPropagation()}
						>
							<div style="width:32px;height:16px;border-radius:99px;background:{active ? '#3d8c1a' : '#cdd0d4'};transition:background 200ms;position:relative;flex-shrink:0;">
								<div style="position:absolute;top:2px;left:{active ? '16px' : '2px'};width:12px;height:12px;border-radius:50%;background:#fff;transition:left 200ms;box-shadow:0 1px 3px rgba(0,0,0,0.2);"></div>
							</div>
							<span style="font-size:11px;font-weight:600;color:{active ? '#3d8c1a' : '#686868'};">{active ? 'Active' : 'Inactive'}</span>
						</button>
					</form>
				</div>

				<!-- Stats band -->
				<div style="display:flex;border-top:1px solid #F0F0F0;border-bottom:1px solid #F0F0F0;">
					<div style="flex:1;text-align:center;padding:11px 4px;border-right:1px solid #F0F0F0;">
						<div style="font-size:21px;font-weight:700;color:#474545;line-height:1;">{p.coupons_required}</div>
						<div style="font-size:9px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.07em;margin-top:4px;">Req.</div>
					</div>
					<div style="flex:1;text-align:center;padding:11px 4px;border-right:1px solid #F0F0F0;">
						<div style="font-size:21px;font-weight:700;color:#2372B9;line-height:1;">₹{p.cashback_amount}</div>
						<div style="font-size:9px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.07em;margin-top:4px;">Cashback</div>
					</div>
					<div style="flex:1;text-align:center;padding:11px 4px;border-right:1px solid #F0F0F0;">
						<div style="font-size:21px;font-weight:700;color:#474545;line-height:1;">{(p as any).submitted_count ?? 0}</div>
						<div style="font-size:9px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.07em;margin-top:4px;">Scanned</div>
					</div>
					<div style="flex:1;text-align:center;padding:11px 4px;">
						<div style="font-size:21px;font-weight:700;color:#474545;line-height:1;">{(p as any).claims_count ?? 0}</div>
						<div style="font-size:9px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.07em;margin-top:4px;">Claims</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

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
	.prod-card:hover { box-shadow: 0 4px 16px rgba(35,114,185,0.12) !important; border-color: #2372B9 !important; }
</style>
