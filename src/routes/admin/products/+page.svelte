<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editingId  = $state<string | null>(null);
	let showAddForm = $state(false);

	// Per-card edit state
	let editName     = $state('');
	let editRequired = $state(0);
	let editCashback = $state(0);

	function startEdit(p: { id: string; name: string; coupons_required: number; cashback_amount: number }) {
		editingId  = p.id;
		editName   = p.name;
		editRequired = p.coupons_required;
		editCashback = p.cashback_amount;
	}

	function cancelEdit() {
		editingId = null;
	}

	$effect(() => {
		// Close edit mode on successful form submission
		if (form && !(form as any)?.updateError) {
			editingId = null;
		}
		if (form && !(form as any)?.createError) {
			showAddForm = false;
		}
	});
</script>

<div style="padding:32px 36px;font-family:'Montserrat',sans-serif;">
	<!-- Header row -->
	<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
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

	<!-- Add product form (inline card) -->
	{#if showAddForm}
		<div style="background:#fff;border-radius:10px;border:2px solid #2372B9;padding:18px 20px;box-shadow:0 0 0 3px #e8f1fb;margin-bottom:20px;">
			<div style="font-size:14px;font-weight:700;color:#474545;margin-bottom:14px;">New Product</div>
			<form method="POST" action="?/create" use:enhance style="display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap;">
				<div style="flex:1;min-width:180px;">
					<label for="new-name" style="font-size:11px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:5px;">Product Name</label>
					<input
						id="new-name"
						name="name"
						placeholder="e.g. Amoxicillin 500mg"
						required
						style="width:100%;border:2px solid #EAEAEA;border-radius:7px;padding:7px 10px;font-family:'Montserrat',sans-serif;font-size:13px;color:#474545;outline:none;box-sizing:border-box;"
					/>
				</div>
				<div style="width:130px;">
					<label for="new-coupons" style="font-size:11px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:5px;">Coupons Req.</label>
					<input
						id="new-coupons"
						name="coupons_required"
						type="number"
						min="1"
						placeholder="5"
						required
						style="width:100%;border:2px solid #EAEAEA;border-radius:7px;padding:7px 10px;font-family:'Montserrat',sans-serif;font-size:13px;color:#474545;outline:none;box-sizing:border-box;"
					/>
				</div>
				<div style="width:130px;">
					<label for="new-cashback" style="font-size:11px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:5px;">Cashback (₹)</label>
					<input
						id="new-cashback"
						name="cashback_amount"
						type="number"
						min="1"
						placeholder="100"
						required
						style="width:100%;border:2px solid #EAEAEA;border-radius:7px;padding:7px 10px;font-family:'Montserrat',sans-serif;font-size:13px;color:#474545;outline:none;box-sizing:border-box;"
					/>
				</div>
				<div style="display:flex;gap:8px;">
					<button
						type="submit"
						style="background:#3d8c1a;color:#fff;border:none;border-radius:7px;padding:9px 16px;font-size:12px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;"
					>Save</button>
					<button
						type="button"
						onclick={() => showAddForm = false}
						style="background:#fff;color:#474545;border:1.5px solid #EAEAEA;border-radius:7px;padding:9px 16px;font-size:12px;font-weight:600;font-family:'Montserrat',sans-serif;cursor:pointer;"
					>Cancel</button>
				</div>
			</form>
			{#if (form as any)?.createError}
				<p style="font-size:12px;color:#E53E3E;margin-top:8px;">{(form as any).createError}</p>
			{/if}
		</div>
	{/if}

	<!-- Product card grid -->
	<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;">
		{#each data.products as p}
			{@const editing = editingId === p.id}
			<div style="background:#fff;border-radius:10px;border:{editing ? '2px solid #2372B9' : '1px solid #EAEAEA'};padding:18px 20px;box-shadow:{editing ? '0 0 0 3px #e8f1fb' : '0 1px 4px rgba(0,0,0,0.04)'};">
				<!-- Card header -->
				<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">
					<div style="font-size:14px;font-weight:700;color:#474545;line-height:1.3;margin-right:8px;">{p.name}</div>
					{#if editing}
						<span style="font-size:11px;font-weight:700;color:#2372B9;background:#e8f1fb;padding:3px 8px;border-radius:99px;white-space:nowrap;flex-shrink:0;">Editing</span>
					{:else}
						<button
							type="button"
							onclick={() => startEdit(p)}
							style="background:#fff;color:#474545;border:1.5px solid #EAEAEA;border-radius:7px;padding:5px 11px;font-size:11px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;white-space:nowrap;flex-shrink:0;"
						>Edit</button>
					{/if}
				</div>

				<!-- Stat tiles -->
				<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
					<div style="background:#F4F6F8;border-radius:7px;padding:10px 12px;">
						<div style="font-size:9px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:5px;">Coupons Req.</div>
						{#if editing}
							<input
								type="number"
								min="1"
								bind:value={editRequired}
								style="width:100%;border:2px solid #2372B9;border-radius:6px;padding:4px 8px;font-family:'Montserrat',sans-serif;font-size:16px;font-weight:700;color:#474545;outline:none;background:#fff;box-sizing:border-box;"
							/>
						{:else}
							<div style="font-size:18px;font-weight:700;color:#474545;">{p.coupons_required}</div>
						{/if}
					</div>
					<div style="background:#F4F6F8;border-radius:7px;padding:10px 12px;">
						<div style="font-size:9px;font-weight:700;color:#686868;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:5px;">Cashback (₹)</div>
						{#if editing}
							<input
								type="number"
								min="1"
								bind:value={editCashback}
								style="width:100%;border:2px solid #2372B9;border-radius:6px;padding:4px 8px;font-family:'Montserrat',sans-serif;font-size:16px;font-weight:700;color:#2372B9;outline:none;background:#fff;box-sizing:border-box;"
							/>
						{:else}
							<div style="font-size:18px;font-weight:700;color:#2372B9;">₹{p.cashback_amount}</div>
						{/if}
					</div>
				</div>

				<!-- Inline stats -->
				<div style="display:flex;justify-content:space-between;margin-bottom:{editing ? 14 : 0}px;">
					<div>
						<div style="font-size:9px;color:#686868;text-transform:uppercase;letter-spacing:0.07em;font-weight:700;">Coupons Submitted</div>
						<div style="font-size:14px;font-weight:600;color:#474545;margin-top:3px;">{(p as any).submitted_count ?? 0}</div>
					</div>
					<div style="text-align:right;">
						<div style="font-size:9px;color:#686868;text-transform:uppercase;letter-spacing:0.07em;font-weight:700;">Claims Triggered</div>
						<div style="font-size:14px;font-weight:600;color:#474545;margin-top:3px;">{(p as any).claims_count ?? 0}</div>
					</div>
				</div>

				<!-- Edit mode actions -->
				{#if editing}
					<form method="POST" action="?/update" use:enhance onsubmit={() => { editingId = null; }}>
						<input type="hidden" name="id" value={p.id} />
						<input type="hidden" name="name" value={editName} />
						<input type="hidden" name="coupons_required" value={editRequired} />
						<input type="hidden" name="cashback_amount" value={editCashback} />
						<div style="display:flex;gap:8px;">
							<button
								type="submit"
								style="flex:1;background:#3d8c1a;color:#fff;border:none;border-radius:7px;padding:9px;font-size:12px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;"
							>Save</button>
							<button
								type="button"
								onclick={cancelEdit}
								style="flex:1;background:#fff;color:#474545;border:1.5px solid #EAEAEA;border-radius:7px;padding:9px;font-size:12px;font-weight:600;font-family:'Montserrat',sans-serif;cursor:pointer;"
							>Cancel</button>
						</div>
					</form>
					{#if (form as any)?.updateError && (form as any)?.updateId === p.id}
						<p style="font-size:12px;color:#E53E3E;margin-top:6px;">{(form as any).updateError}</p>
					{/if}
				{/if}
			</div>
		{/each}
	</div>
</div>
