<script lang="ts">
	import { navigating } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if navigating.to}
	<div class="fixed top-0 left-0 right-0 z-50 h-[3px] overflow-hidden" style="background: rgba(35,114,185,0.12)">
		<div class="h-full bg-[#2372B9]" style="animation: nav-bar 3s ease-out forwards"></div>
	</div>
{/if}

{@render children()}

<style>
	@keyframes nav-bar {
		0%   { width: 0% }
		30%  { width: 55% }
		60%  { width: 75% }
		85%  { width: 85% }
		100% { width: 92% }
	}
</style>
