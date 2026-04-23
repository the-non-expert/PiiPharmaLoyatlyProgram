<script lang="ts">
	import { page } from '$app/state';

	let { children, data } = $props<{ children: any; data: { pendingCount: number } }>();

	const path = $derived(page.url.pathname as string);
	const isLoginPage = $derived(path === '/admin/login');

	function active(id: string) {
		if (id === 'dashboard') return path === '/admin';
		return path.startsWith(`/admin/${id}`);
	}
</script>

{#if isLoginPage}
	{@render children()}
{:else}
	<div class="flex min-h-screen" style="background:#F4F6F8; font-family:'Montserrat',sans-serif;">
		<!-- Sidebar -->
		<aside
			class="fixed top-0 left-0 h-full flex flex-col"
			style="width:220px; background:#141f2e; z-index:50;"
		>
			<!-- Logo -->
			<div class="flex items-center gap-[10px] px-[18px] py-[22px]" style="border-bottom:1px solid rgba(255,255,255,0.07);">
				<div class="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0" style="background:#2372B9;">
					<span style="font-size:12px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Pii</span>
				</div>
				<div>
					<div style="font-size:13px;font-weight:700;color:#fff;line-height:1.2;">PiiPharma</div>
					<div style="font-size:10px;color:rgba(255,255,255,0.4);">Admin Portal</div>
				</div>
			</div>

			<!-- Nav -->
			<nav class="flex-1 px-2 py-[10px]" style="display:flex;flex-direction:column;gap:1px;">
				{#each [
					{ id:'dashboard', label:'Dashboard',  href:'/admin' },
					{ id:'claims',    label:'Claims',     href:'/admin/claims', badge: data.pendingCount },
					{ id:'retailers', label:'Retailers',  href:'/admin/retailers' },
					{ id:'products',  label:'Products',   href:'/admin/products' },
					{ id:'payouts',   label:'Payouts',    href:'/admin/payouts' },
				] as item}
					{@const on = active(item.id)}
					<a
						href={item.href}
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
						<span style="font-size:11px;font-weight:700;color:#fff;">RK</span>
					</div>
					<div class="flex-1 min-w-0">
						<div style="font-size:12px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Ramesh Kumar</div>
						<div style="font-size:10px;color:rgba(255,255,255,0.4);">Admin</div>
					</div>
					<a href="/admin/logout" title="Sign out" style="color:rgba(255,255,255,0.3);display:flex;flex-shrink:0;">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
					</a>
				</div>
			</div>
		</aside>

		<!-- Main -->
		<main class="flex-1 min-h-screen overflow-auto" style="margin-left:220px;">
			{@render children()}
		</main>
	</div>
{/if}
