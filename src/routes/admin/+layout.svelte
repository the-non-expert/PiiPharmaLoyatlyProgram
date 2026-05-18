<script lang="ts">
	import { page, navigating } from '$app/state';

	let { children, data } = $props<{ children: any; data: { pendingCount: number; adminEmail: string | null } }>();

	const adminDisplayName = $derived(data.adminEmail ? data.adminEmail.split('@')[0] : 'Admin');
	const adminInitials = $derived(
		adminDisplayName.length >= 2
			? adminDisplayName.slice(0, 2).toUpperCase()
			: adminDisplayName.slice(0, 1).toUpperCase()
	);

	const path = $derived(page.url.pathname as string);
	const isLoginPage = $derived(path === '/admin/login');

	let sidebarOpen = $state(false);

	function active(id: string) {
		if (id === 'dashboard') return path === '/admin';
		return path.startsWith(`/admin/${id}`);
	}

	function closeSidebar() {
		sidebarOpen = false;
	}
</script>

{#if isLoginPage}
	{@render children()}
{:else}
	<div class="flex min-h-screen" style="background:#F4F6F8; font-family:'Montserrat',sans-serif;">

		<!-- Mobile backdrop -->
		{#if sidebarOpen}
			<div
				class="fixed inset-0 bg-black/50 lg:hidden"
				style="z-index:40;"
				role="button"
				tabindex="-1"
				onclick={closeSidebar}
				onkeydown={(e) => e.key === 'Escape' && closeSidebar()}
			></div>
		{/if}

		<!-- Sidebar -->
		<aside
			class="fixed top-0 left-0 h-full flex flex-col transition-transform duration-300"
			style="width:220px; background:#141f2e; z-index:50; transform: {sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'} "
		>
			<!-- Logo -->
			<a href="/admin" onclick={closeSidebar} class="flex items-center gap-[10px] px-[18px] py-[22px] no-underline" style="border-bottom:1px solid rgba(255,255,255,0.07);">
				<div class="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0" style="background:#2372B9;">
					<span style="font-size:12px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Pii</span>
				</div>
				<div>
					<div style="font-size:13px;font-weight:700;color:#fff;line-height:1.2;">PiiPharma</div>
					<div style="font-size:10px;color:rgba(255,255,255,0.4);">Admin Portal</div>
				</div>
			</a>

			<!-- Nav -->
			<nav class="flex-1 px-2 py-[10px]" style="display:flex;flex-direction:column;gap:1px;">
				{#each [
					{ id:'dashboard', label:'Dashboard',  href:'/admin' },
					{ id:'claims',    label:'Claims',     href:'/admin/claims', badge: data.pendingCount },
					{ id:'retailers', label:'Retailers',  href:'/admin/retailers' },
					{ id:'products',  label:'Products',   href:'/admin/products' },
					{ id:'plans',     label:'Plans',      href:'/admin/plans' },
					{ id:'payouts',   label:'Payouts',    href:'/admin/payouts' },
				] as item}
					{@const on = active(item.id)}
					<a
						href={item.href}
						onclick={closeSidebar}
						class="flex items-center gap-[10px] px-3 rounded-[7px] no-underline"
						style="padding-top:9px;padding-bottom:9px;background:{on ? '#2372B9' : 'transparent'};"
					>
						{#if item.id === 'dashboard'}
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;color:{on?'#fff':'rgba(255,255,255,0.45)'}"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 21V12h6v9" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
						{:else if item.id === 'claims'}
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;color:{on?'#fff':'rgba(255,255,255,0.45)'}"><rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" stroke-width="2"/><path d="M8 7h8M8 11h8M8 15h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
						{:else if item.id === 'retailers'}
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;color:{on?'#fff':'rgba(255,255,255,0.45)'}"><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.85" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
						{:else if item.id === 'products'}
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;color:{on?'#fff':'rgba(255,255,255,0.45)'}"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
						{:else if item.id === 'plans'}
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;color:{on?'#fff':'rgba(255,255,255,0.45)'}"><path d="M9 14l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
						{:else if item.id === 'payouts'}
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;color:{on?'#fff':'rgba(255,255,255,0.45)'}"><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/><path d="M2 10h20" stroke="currentColor" stroke-width="2"/></svg>
						{/if}
						<span style="font-size:13px;font-weight:{on?700:500};color:{on?'#fff':'rgba(255,255,255,0.6)'};">{item.label}</span>
						{#if item.badge && !on}
							<span class="ml-auto" style="background:rgba(245,158,11,0.18);color:#F59E0B;border-radius:99px;padding:1px 7px;font-size:11px;font-weight:700;">{item.badge}</span>
						{/if}
					</a>
				{/each}
			</nav>

			<!-- User -->
			<div class="px-4 py-[14px]" style="border-top:1px solid rgba(255,255,255,0.07);">
				<div class="flex items-center gap-[9px]">
					<div class="flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0" style="background:rgba(255,255,255,0.14);">
						<span style="font-size:11px;font-weight:700;color:#fff;">{adminInitials}</span>
					</div>
					<div class="flex-1 min-w-0">
						<div style="font-size:12px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{adminDisplayName}</div>
						<div style="font-size:10px;color:rgba(255,255,255,0.4);">Admin</div>
					</div>
					<a href="/admin/logout" title="Sign out" style="color:rgba(255,255,255,0.3);display:flex;flex-shrink:0;">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
					</a>
				</div>
			</div>
		</aside>

		<!-- Main content area -->
		<div class="flex flex-col flex-1 min-h-screen lg:ml-[220px]">
			<!-- Mobile top bar -->
			<header
				class="lg:hidden flex items-center gap-3 px-4 py-3 sticky top-0"
				style="background:#141f2e; z-index:30;"
			>
				<button
					type="button"
					onclick={() => sidebarOpen = !sidebarOpen}
					style="color:#fff;background:none;border:none;cursor:pointer;display:flex;padding:4px;"
					aria-label="Toggle menu"
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
						<path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
				</button>
				<a href="/admin" class="flex items-center gap-2 no-underline">
					<div class="flex items-center justify-center w-6 h-6 rounded-md flex-shrink-0" style="background:#2372B9;">
						<span style="font-size:9px;font-weight:900;color:#fff;">Pii</span>
					</div>
					<span style="font-size:13px;font-weight:700;color:#fff;">PiiPharma Admin</span>
				</a>
				{#if data.pendingCount > 0}
					<a href="/admin/claims" class="ml-auto no-underline" style="background:rgba(245,158,11,0.18);color:#F59E0B;border-radius:99px;padding:2px 8px;font-size:11px;font-weight:700;">{data.pendingCount} pending</a>
				{/if}
			</header>

			<main class="flex-1 overflow-auto" style="overflow-x:hidden;">
				{#if navigating.to && navigating.to.url.pathname.startsWith('/admin') && !navigating.to.url.pathname.startsWith('/admin/login')}
					{@const dest = navigating.to.url.pathname}
					<div style="padding:32px 36px;font-family:'Montserrat',sans-serif;" class="sk-pg">

						{#if dest === '/admin'}
							<!-- Dashboard skeleton -->
							<div class="sk-bar" style="width:160px;height:22px;margin-bottom:24px;"></div>
							<div class="sk-stat-grid" style="display:flex;gap:16px;margin-bottom:28px;">
								{#each [1,2,3,4,5] as _}
									<div class="sk-card" style="flex:1;padding:18px 20px;">
										<div class="sk-bar" style="width:80%;height:11px;margin-bottom:10px;"></div>
										<div class="sk-bar" style="width:50%;height:26px;margin-bottom:8px;"></div>
										<div class="sk-bar" style="width:60%;height:11px;"></div>
									</div>
								{/each}
							</div>
							<div class="sk-card" style="padding:0;overflow:hidden;">
								<div style="padding:13px 18px;border-bottom:1px solid #EAEAEA;">
									<div class="sk-bar" style="width:80px;height:14px;"></div>
								</div>
								{#each [1,2,3,4,5,6] as _}
									<div style="display:flex;gap:14px;padding:11px 14px;border-bottom:1px solid #EAEAEA;">
										<div class="sk-bar" style="flex:2;height:13px;"></div>
										<div class="sk-bar" style="flex:1;height:13px;"></div>
										<div class="sk-bar" style="flex:1;height:13px;"></div>
										<div class="sk-bar" style="flex:1;height:13px;"></div>
										<div class="sk-bar" style="flex:1;height:13px;"></div>
									</div>
								{/each}
							</div>

						{:else if /^\/admin\/claims\/[^/]+/.test(dest)}
							<!-- Claim detail skeleton -->
							<div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
								<div class="sk-bar" style="width:28px;height:28px;border-radius:50%;"></div>
								<div class="sk-bar" style="width:180px;height:22px;"></div>
							</div>
							<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;" class="sk-detail-grid">
								<div class="sk-card" style="padding:18px 20px;">
									<div class="sk-bar" style="width:90px;height:11px;margin-bottom:14px;"></div>
									{#each [1,2,3,4] as _}
										<div style="margin-bottom:12px;">
											<div class="sk-bar" style="width:60px;height:10px;margin-bottom:5px;"></div>
											<div class="sk-bar" style="width:85%;height:14px;"></div>
										</div>
									{/each}
								</div>
								<div class="sk-card" style="padding:18px 20px;">
									<div class="sk-bar" style="width:100px;height:11px;margin-bottom:14px;"></div>
									<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
										{#each [1,2,3,4] as _}
											<div class="sk-bar" style="height:90px;border-radius:8px;"></div>
										{/each}
									</div>
									<div class="sk-bar" style="width:70%;height:11px;margin-bottom:8px;"></div>
									{#each [1,2,3] as _}
										<div class="sk-bar" style="width:55%;height:12px;margin-bottom:6px;font-family:monospace;"></div>
									{/each}
								</div>
							</div>
							<div class="sk-card" style="padding:16px 20px;display:flex;gap:10px;">
								<div class="sk-bar" style="width:110px;height:38px;border-radius:7px;"></div>
								<div class="sk-bar" style="width:110px;height:38px;border-radius:7px;"></div>
							</div>

						{:else if dest.startsWith('/admin/claims')}
							<!-- Claims list skeleton -->
							<div class="sk-bar" style="width:80px;height:22px;margin-bottom:16px;"></div>
							<div style="display:flex;gap:0;border-bottom:2px solid #EAEAEA;margin-bottom:18px;">
								<div class="sk-bar" style="width:90px;height:14px;margin:0 20px 10px;"></div>
								<div class="sk-bar" style="width:90px;height:14px;margin:0 20px 10px;"></div>
							</div>
							<div style="display:flex;gap:8px;margin-bottom:16px;">
								<div class="sk-bar" style="width:180px;height:32px;border-radius:7px;"></div>
								<div class="sk-bar" style="width:150px;height:32px;border-radius:7px;"></div>
								<div class="sk-bar" style="width:160px;height:32px;border-radius:7px;"></div>
							</div>
							<div class="sk-card" style="padding:0;overflow:hidden;">
								<div style="display:flex;gap:14px;padding:10px 14px;border-bottom:2px solid #EAEAEA;">
									{#each [80,120,90,110,80,70,70,60] as w}
										<div class="sk-bar" style="width:{w}px;height:11px;flex-shrink:0;"></div>
									{/each}
								</div>
								{#each [1,2,3,4,5,6,7] as _}
									<div style="display:flex;gap:14px;padding:11px 14px;border-bottom:1px solid #EAEAEA;align-items:center;">
										<div class="sk-bar" style="width:80px;height:12px;flex-shrink:0;font-family:monospace;"></div>
										<div class="sk-bar" style="width:120px;height:13px;flex-shrink:0;"></div>
										<div class="sk-bar" style="width:90px;height:12px;flex-shrink:0;"></div>
										<div class="sk-bar" style="width:110px;height:13px;flex-shrink:0;"></div>
										<div class="sk-bar" style="width:80px;height:12px;flex-shrink:0;"></div>
										<div class="sk-bar" style="width:50px;height:13px;flex-shrink:0;"></div>
										<div class="sk-bar" style="width:60px;height:20px;border-radius:99px;flex-shrink:0;"></div>
										<div class="sk-bar" style="width:50px;height:12px;flex-shrink:0;"></div>
									</div>
								{/each}
							</div>

						{:else if dest.startsWith('/admin/retailers')}
							<!-- Retailers skeleton -->
							<div class="sk-bar" style="width:100px;height:22px;margin-bottom:20px;"></div>
							<div class="sk-bar" style="width:340px;height:34px;border-radius:8px;margin-bottom:16px;"></div>
							<div class="sk-card" style="padding:0;overflow:hidden;">
								<div style="display:flex;gap:14px;padding:10px 14px;border-bottom:2px solid #EAEAEA;">
									{#each [100,80,70,80,120,90,70,90] as w}
										<div class="sk-bar" style="width:{w}px;height:11px;flex-shrink:0;"></div>
									{/each}
								</div>
								{#each [1,2,3,4,5,6,7,8] as _}
									<div style="display:flex;gap:14px;padding:11px 14px;border-bottom:1px solid #EAEAEA;align-items:center;">
										<div class="sk-bar" style="width:100px;height:13px;flex-shrink:0;"></div>
										<div class="sk-bar" style="width:80px;height:12px;flex-shrink:0;"></div>
										<div class="sk-bar" style="width:70px;height:13px;flex-shrink:0;"></div>
										<div class="sk-bar" style="width:80px;height:13px;flex-shrink:0;"></div>
										<div class="sk-bar" style="width:120px;height:12px;flex-shrink:0;"></div>
										<div class="sk-bar" style="width:90px;height:12px;flex-shrink:0;"></div>
										<div class="sk-bar" style="width:30px;height:13px;flex-shrink:0;"></div>
										<div class="sk-bar" style="width:70px;height:13px;flex-shrink:0;"></div>
									</div>
								{/each}
							</div>

						{:else if dest.startsWith('/admin/payouts')}
							<!-- Payouts skeleton -->
							<div class="sk-bar" style="width:90px;height:22px;margin-bottom:18px;"></div>
							<div class="sk-bar" style="width:100%;height:48px;border-radius:10px;margin-bottom:18px;"></div>
							<div class="sk-card" style="padding:0;overflow:hidden;">
								<div style="display:flex;gap:14px;padding:10px 14px;border-bottom:2px solid #EAEAEA;align-items:center;">
									<div class="sk-bar" style="width:16px;height:16px;border-radius:3px;flex-shrink:0;"></div>
									{#each [120,80,90,100,60,70,80] as w}
										<div class="sk-bar" style="width:{w}px;height:11px;flex-shrink:0;"></div>
									{/each}
								</div>
								{#each [1,2,3,4,5,6] as _}
									<div style="display:flex;gap:14px;padding:11px 14px;border-bottom:1px solid #EAEAEA;align-items:center;">
										<div class="sk-bar" style="width:16px;height:16px;border-radius:3px;flex-shrink:0;"></div>
										<div class="sk-bar" style="width:120px;height:13px;flex-shrink:0;"></div>
										<div class="sk-bar" style="width:80px;height:12px;flex-shrink:0;"></div>
										<div class="sk-bar" style="width:90px;height:13px;flex-shrink:0;"></div>
										<div class="sk-bar" style="width:100px;height:13px;flex-shrink:0;"></div>
										<div class="sk-bar" style="width:50px;height:13px;flex-shrink:0;"></div>
										<div class="sk-bar" style="width:60px;height:20px;border-radius:99px;flex-shrink:0;"></div>
										<div class="sk-bar" style="width:60px;height:13px;flex-shrink:0;"></div>
									</div>
								{/each}
							</div>

						{:else if dest.startsWith('/admin/products')}
							<!-- Products skeleton -->
							<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
								<div class="sk-bar" style="width:100px;height:22px;"></div>
								<div class="sk-bar" style="width:110px;height:34px;border-radius:7px;"></div>
							</div>
							<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;" class="sk-products-grid">
								{#each [1,2,3,4,5,6] as _}
									<div class="sk-card" style="padding:18px 20px;">
										<div class="sk-bar" style="width:75%;height:15px;margin-bottom:10px;"></div>
										<div style="display:flex;gap:16px;margin-bottom:14px;">
											<div>
												<div class="sk-bar" style="width:50px;height:10px;margin-bottom:5px;"></div>
												<div class="sk-bar" style="width:30px;height:18px;"></div>
											</div>
											<div>
												<div class="sk-bar" style="width:60px;height:10px;margin-bottom:5px;"></div>
												<div class="sk-bar" style="width:40px;height:18px;"></div>
											</div>
										</div>
										<div class="sk-bar" style="width:80px;height:28px;border-radius:6px;"></div>
									</div>
								{/each}
							</div>

						{:else}
							<!-- Generic admin skeleton -->
							<div class="sk-bar" style="width:160px;height:22px;margin-bottom:24px;"></div>
							<div class="sk-card" style="padding:0;overflow:hidden;">
								{#each [1,2,3,4,5] as _}
									<div style="display:flex;gap:14px;padding:14px;border-bottom:1px solid #EAEAEA;">
										<div class="sk-bar" style="flex:2;height:13px;"></div>
										<div class="sk-bar" style="flex:1;height:13px;"></div>
										<div class="sk-bar" style="flex:1;height:13px;"></div>
									</div>
								{/each}
							</div>
						{/if}

					</div>
				{:else}
					{@render children()}
				{/if}
			</main>
		</div>
	</div>
{/if}

<style>
	@media (min-width: 1024px) {
		aside {
			transform: translateX(0) !important;
		}
	}
	:global(.sk-bar) {
		background: #EAEAEA;
		border-radius: 5px;
		animation: sk-pulse 1.4s ease-in-out infinite;
	}
	:global(.sk-card) {
		background: #fff;
		border-radius: 10px;
		border: 1px solid #EAEAEA;
		box-shadow: 0 1px 4px rgba(0,0,0,0.04);
	}
	@keyframes sk-pulse {
		0%, 100% { opacity: 1; }
		50%       { opacity: 0.45; }
	}
	@media (max-width: 768px) {
		.sk-pg { padding: 16px 14px !important; }
		.sk-stat-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
		.sk-detail-grid { grid-template-columns: 1fr !important; }
		.sk-products-grid { grid-template-columns: 1fr !important; }
	}
</style>
