<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showAddForm = $state(false);
	let optimisticActive = $state<Record<string, boolean>>({});

	// Leg builder state for create form
	type LegDraft = { product_id: string; coupons_required: number };
	let draftLegs = $state<LegDraft[]>([{ product_id: '', coupons_required: 1 }]);

	function addLeg() {
		draftLegs = [...draftLegs, { product_id: '', coupons_required: 1 }];
	}

	function removeLeg(i: number) {
		draftLegs = draftLegs.filter((_, idx) => idx !== i);
	}

	function isActive(p: { id: string; active: boolean }) {
		return p.id in optimisticActive ? optimisticActive[p.id] : p.active;
	}

	$effect(() => {
		if (form && !(form as any)?.createError) {
			showAddForm = false;
			draftLegs = [{ product_id: '', coupons_required: 1 }];
		}
	});

	// Used products set to avoid duplicate legs
	const usedProducts = $derived(new Set(draftLegs.map(l => l.product_id).filter(Boolean)));
</script>

<div class="pg" style="padding:32px 36px;font-family:'Montserrat',sans-serif;">

	<!-- Header -->
	<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;gap:10px;flex-wrap:wrap;">
		<div>
			<h1 style="font-size:22px;font-weight:700;color:#474545;margin:0 0 4px;">Cashback Plans</h1>
			<p style="font-size:12px;color:#686868;margin:0;">Define what retailers earn and how many coupons they need to qualify.</p>
		</div>
		<button
			type="button"
			onclick={() => showAddForm = !showAddForm}
			style="display:inline-flex;align-items:center;gap:5px;background:#2372B9;color:#fff;border:none;border-radius:7px;padding:8px 14px;font-size:13px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;"
		>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>
			New Plan
		</button>
	</div>

	<!-- Create form -->
	{#if showAddForm}
		<div style="background:#fff;border-radius:10px;border:2px solid #2372B9;padding:20px 22px;box-shadow:0 0 0 3px #e8f1fb;margin-bottom:24px;">
			<div style="font-size:14px;font-weight:700;color:#474545;margin-bottom:16px;">New Cashback Plan</div>
			<form
				method="POST"
				action="?/create"
				use:enhance={() => ({ result }) => {
					if (result.type !== 'failure') {
						showAddForm = false;
						draftLegs = [{ product_id: '', coupons_required: 1 }];
					}
				}}
			>
				<!-- Hidden legs JSON -->
				<input type="hidden" name="legs" value={JSON.stringify(draftLegs)} />

				<!-- Plan name + cashback -->
				<div class="top-row" style="display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap;margin-bottom:16px;">
					<div style="flex:1;min-width:200px;">
						<label for="new-name" style="font-size:11px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:5px;">Plan Name</label>
						<input id="new-name" name="name" placeholder="e.g. PiiCure Standard" required
							style="width:100%;border:2px solid #EAEAEA;border-radius:7px;padding:7px 10px;font-family:'Montserrat',sans-serif;font-size:13px;color:#474545;outline:none;box-sizing:border-box;"/>
					</div>
					<div style="width:140px;">
						<label for="new-cashback" style="font-size:11px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:5px;">Cashback (₹)</label>
						<input id="new-cashback" name="cashback_amount" type="number" min="1" placeholder="100" required
							style="width:100%;border:2px solid #EAEAEA;border-radius:7px;padding:7px 10px;font-family:'Montserrat',sans-serif;font-size:13px;color:#474545;outline:none;box-sizing:border-box;"/>
					</div>
				</div>

				<!-- Legs -->
				<div style="margin-bottom:14px;">
					<div style="font-size:11px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">
						Product Legs <span style="font-weight:500;text-transform:none;color:#aaa;">(one row per product)</span>
					</div>
					<div style="display:flex;flex-direction:column;gap:8px;">
						{#each draftLegs as leg, i}
							<div style="display:flex;gap:8px;align-items:center;">
								<select
									bind:value={leg.product_id}
									style="flex:1;border:2px solid #EAEAEA;border-radius:7px;padding:7px 10px;font-family:'Montserrat',sans-serif;font-size:13px;color:#474545;outline:none;"
								>
									<option value="">— Select product —</option>
									{#each data.products as p}
										<option
											value={p.id}
											disabled={usedProducts.has(p.id) && leg.product_id !== p.id}
										>{p.name}</option>
									{/each}
								</select>
								<div style="display:flex;align-items:center;gap:6px;white-space:nowrap;">
									<input
										type="number"
										min="1"
										bind:value={leg.coupons_required}
										style="width:70px;border:2px solid #EAEAEA;border-radius:7px;padding:7px 10px;font-family:'Montserrat',sans-serif;font-size:13px;color:#474545;outline:none;"
									/>
									<span style="font-size:11px;color:#686868;">coupons</span>
								</div>
								{#if draftLegs.length > 1}
									<button type="button" onclick={() => removeLeg(i)}
										style="background:none;border:none;cursor:pointer;color:#E53E3E;display:flex;padding:4px;">
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
									</button>
								{/if}
							</div>
						{/each}
					</div>
					{#if draftLegs.length < data.products.length}
						<button type="button" onclick={addLeg}
							style="display:inline-flex;align-items:center;gap:5px;margin-top:8px;background:none;border:1.5px dashed #EAEAEA;border-radius:7px;padding:6px 12px;font-size:12px;font-weight:600;color:#686868;cursor:pointer;font-family:'Montserrat',sans-serif;">
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
							Add another product leg
						</button>
					{/if}
				</div>

				{#if (form as any)?.createError}
					<p style="font-size:12px;color:#E53E3E;margin-bottom:10px;">{(form as any).createError}</p>
				{/if}

				<div style="display:flex;gap:8px;">
					<button type="submit"
						style="background:#3d8c1a;color:#fff;border:none;border-radius:7px;padding:9px 18px;font-size:12px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;">
						Save Plan
					</button>
					<button type="button" onclick={() => showAddForm = false}
						style="background:#fff;color:#474545;border:1.5px solid #EAEAEA;border-radius:7px;padding:9px 16px;font-size:12px;font-weight:600;font-family:'Montserrat',sans-serif;cursor:pointer;">
						Cancel
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Empty state -->
	{#if data.plans.length === 0}
		<div style="background:#fff;border-radius:12px;border:1px solid #EAEAEA;padding:64px 32px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
			<div style="width:64px;height:64px;border-radius:14px;background:#F4F6F8;border:2px dashed #EAEAEA;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
				<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M9 14l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#BDBDBD" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
			</div>
			<p style="font-size:16px;font-weight:700;color:#474545;margin:0 0 8px;">No plans yet</p>
			<p style="font-size:13px;color:#686868;margin:0 0 24px;max-width:360px;margin-left:auto;margin-right:auto;line-height:1.6;">
				Cashback plans define what retailers earn. Single-product plans work like before; combo plans require coupons from multiple products.
			</p>
			<button type="button" onclick={() => showAddForm = true}
				style="display:inline-flex;align-items:center;gap:6px;background:#2372B9;color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:13px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>
				Create your first plan
			</button>
		</div>
	{/if}

	<!-- Plans grid -->
	<div class="plan-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;">
		{#each data.plans as plan}
			{@const active = isActive(plan)}
			<div style="background:#fff;border-radius:10px;border:1px solid {active ? '#EAEAEA' : '#F0F0F0'};padding:18px 20px;box-shadow:0 1px 4px rgba(0,0,0,0.04);opacity:{active ? 1 : 0.7};">

				<!-- Header: name + toggle -->
				<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:14px;">
					<div>
						<div style="font-size:15px;font-weight:700;color:{active ? '#2372B9' : '#999'};line-height:1.3;">{plan.name}</div>
						{#if plan.legs.length > 1}
							<div style="font-size:10px;font-weight:700;color:#F59E0B;background:#fef3cd;border-radius:99px;padding:1px 7px;display:inline-block;margin-top:4px;letter-spacing:0.04em;">COMBO</div>
						{/if}
					</div>
					<form method="POST" action="?/toggleActive" use:enhance={() => {
						optimisticActive = { ...optimisticActive, [plan.id]: !active };
						return async ({ update, result }) => {
							await update();
							if (result.type === 'failure') {
								const next = { ...optimisticActive };
								delete next[plan.id];
								optimisticActive = next;
							} else {
								const next = { ...optimisticActive };
								delete next[plan.id];
								optimisticActive = next;
							}
						};
					}}>
						<input type="hidden" name="id" value={plan.id} />
						<button type="submit" title="{active ? 'Deactivate' : 'Activate'}"
							style="display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;padding:0;flex-shrink:0;">
							<div style="width:32px;height:16px;border-radius:99px;background:{active ? '#3d8c1a' : '#cdd0d4'};transition:background 200ms;position:relative;flex-shrink:0;">
								<div style="position:absolute;top:2px;left:{active ? '16px' : '2px'};width:12px;height:12px;border-radius:50%;background:#fff;transition:left 200ms;box-shadow:0 1px 3px rgba(0,0,0,0.2);"></div>
							</div>
						</button>
					</form>
				</div>

				<!-- Stats band -->
				<div style="display:flex;border-top:1px solid #F0F0F0;border-bottom:1px solid #F0F0F0;margin-bottom:14px;">
					<div style="flex:1;text-align:center;padding:10px 4px;border-right:1px solid #F0F0F0;">
						<div style="font-size:20px;font-weight:700;color:#2372B9;line-height:1;">₹{plan.cashback_amount}</div>
						<div style="font-size:9px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.07em;margin-top:4px;">Cashback</div>
					</div>
					<div style="flex:1;text-align:center;padding:10px 4px;border-right:1px solid #F0F0F0;">
						<div style="font-size:20px;font-weight:700;color:#474545;line-height:1;">{plan.legs.length}</div>
						<div style="font-size:9px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.07em;margin-top:4px;">Leg{plan.legs.length !== 1 ? 's' : ''}</div>
					</div>
					<div style="flex:1;text-align:center;padding:10px 4px;">
						<div style="font-size:20px;font-weight:700;color:#474545;line-height:1;">{plan.claims_count}</div>
						<div style="font-size:9px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.07em;margin-top:4px;">Claims</div>
					</div>
				</div>

				<!-- Legs breakdown -->
				<div style="display:flex;flex-direction:column;gap:5px;">
					{#each plan.legs as leg}
						<div style="display:flex;justify-content:space-between;align-items:center;background:#F4F6F8;border-radius:6px;padding:6px 10px;">
							<span style="font-size:12px;font-weight:600;color:#474545;">{leg.product_name}</span>
							<span style="font-size:11px;color:#686868;">{leg.coupons_required} coupon{leg.coupons_required !== 1 ? 's' : ''}</span>
						</div>
					{/each}
				</div>

			</div>
		{/each}
	</div>

</div>

<style>
	@media (max-width: 768px) {
		.pg { padding: 16px 14px !important; }
		.plan-grid { grid-template-columns: 1fr !important; }
		.top-row { flex-direction: column !important; }
	}
	@media (min-width: 769px) and (max-width: 1024px) {
		.plan-grid { grid-template-columns: repeat(2, 1fr) !important; }
	}
</style>
