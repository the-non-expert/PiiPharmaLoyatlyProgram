<script lang="ts">
  let { active }: { active: 'home' | 'claims' | 'profile' } = $props();
</script>

<nav
  class="fixed bottom-0 left-0 right-0 h-[72px] bg-white border-t border-[#EAEAEA] flex max-w-lg mx-auto z-10"
  style="box-shadow: 0 -2px 12px rgba(0,0,0,0.06)"
>
  <!-- Home -->
  <a href="/app" class="flex-1 flex flex-col items-center justify-center gap-[3px] min-w-[44px]">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
        stroke={active === 'home' ? '#2372B9' : '#686868'}
        stroke-width="2"
        fill={active === 'home' ? '#e8f1fb' : 'none'}
        stroke-linejoin="round"/>
      <path d="M9 22V12h6v10"
        stroke={active === 'home' ? '#2372B9' : '#686868'}
        stroke-width="2"
        stroke-linejoin="round"/>
    </svg>
    <span class="text-[11px] {active === 'home' ? 'font-bold text-[#2372B9]' : 'font-semibold text-[#686868]'}">Home</span>
    {#if active === 'home'}
      <div class="w-5 h-[3px] bg-[#2372B9] rounded-full"></div>
    {/if}
  </a>

  <!-- My Claims -->
  <a href="/app/history" class="flex-1 flex flex-col items-center justify-center gap-[3px] min-w-[44px]">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2"
        stroke={active === 'claims' ? '#2372B9' : '#686868'}
        stroke-width="2"
        fill={active === 'claims' ? '#e8f1fb' : 'none'}/>
      <path d="M7 8h10M7 12h10M7 16h6"
        stroke={active === 'claims' ? '#2372B9' : '#686868'}
        stroke-width="2"
        stroke-linecap="round"/>
    </svg>
    <span class="text-[11px] {active === 'claims' ? 'font-bold text-[#2372B9]' : 'font-semibold text-[#686868]'}">My Claims</span>
    {#if active === 'claims'}
      <div class="w-5 h-[3px] bg-[#2372B9] rounded-full"></div>
    {/if}
  </a>

  <!-- Profile -->
  <a href="/app/profile" class="flex-1 flex flex-col items-center justify-center gap-[3px] min-w-[44px]">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4"
        stroke={active === 'profile' ? '#2372B9' : '#686868'}
        stroke-width="2"
        fill={active === 'profile' ? '#e8f1fb' : 'none'}/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
        stroke={active === 'profile' ? '#2372B9' : '#686868'}
        stroke-width="2"
        stroke-linecap="round"
        fill="none"/>
    </svg>
    <span class="text-[11px] {active === 'profile' ? 'font-bold text-[#2372B9]' : 'font-semibold text-[#686868]'}">Profile</span>
    {#if active === 'profile'}
      <div class="w-5 h-[3px] bg-[#2372B9] rounded-full"></div>
    {/if}
  </a>
</nav>
