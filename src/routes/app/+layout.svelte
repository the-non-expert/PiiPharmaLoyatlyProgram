<script lang="ts">
  import { navigating } from '$app/state';

  let { children } = $props();
</script>

{#if navigating.to && navigating.to.url.pathname.startsWith('/app')}
  {@const dest = navigating.to.url.pathname}
  <main class="min-h-screen bg-[#F4F6F8] flex flex-col font-[Montserrat]">
    <div class="max-w-lg mx-auto w-full flex flex-col flex-1">

      {#if dest === '/app' || dest === '/app/'}
        <!-- Home skeleton — matches new QR scanner hero layout -->
        <div class="bg-[#2372B9] px-5 shrink-0" style="padding-top:12px;padding-bottom:36px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:36px;">
            <div>
              <div class="app-sk-bar" style="width:80px;height:11px;margin-bottom:6px;opacity:0.35;"></div>
              <div class="app-sk-bar" style="width:160px;height:20px;opacity:0.35;"></div>
            </div>
            <div style="width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,0.2);flex-shrink:0;"></div>
          </div>
          <!-- scan button placeholder -->
          <div style="display:flex;flex-direction:column;align-items:center;gap:18px;">
            <div style="width:168px;height:168px;border-radius:50%;background:rgba(255,255,255,0.15);"></div>
            <div>
              <div class="app-sk-bar" style="width:120px;height:16px;margin:0 auto 6px;opacity:0.35;"></div>
              <div class="app-sk-bar" style="width:200px;height:11px;margin:0 auto;opacity:0.25;"></div>
            </div>
          </div>
        </div>
        <div class="flex-1 px-4 py-5">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <div class="app-sk-bar" style="width:110px;height:12px;"></div>
            <div class="app-sk-bar" style="width:60px;height:11px;"></div>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            {#each [1,2,3] as _}
              <div class="app-sk-card" style="padding:12px 14px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                  <div class="app-sk-bar" style="width:55%;height:14px;"></div>
                  <div class="app-sk-bar" style="width:36px;height:13px;"></div>
                </div>
                <div class="app-sk-bar" style="width:100%;height:6px;border-radius:99px;margin-bottom:6px;"></div>
                <div class="app-sk-bar" style="width:45%;height:11px;"></div>
              </div>
            {/each}
          </div>
        </div>

      {:else if dest.startsWith('/app/history')}
        <!-- History skeleton -->
        <div class="bg-white border-b border-[#EAEAEA] px-4 pt-3 pb-4 shrink-0" style="display:flex;align-items:center;gap:8px;">
          <div class="app-sk-bar" style="width:32px;height:32px;border-radius:50%;flex-shrink:0;"></div>
          <div class="app-sk-bar" style="width:100px;height:20px;"></div>
        </div>
        <div class="flex-1 px-4 py-4">
          <div style="display:flex;flex-direction:column;gap:10px;">
            {#each [1,2,3,4] as _}
              <div class="app-sk-card">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                  <div>
                    <div class="app-sk-bar" style="width:140px;height:14px;margin-bottom:5px;"></div>
                    <div class="app-sk-bar" style="width:110px;height:11px;"></div>
                  </div>
                  <div class="app-sk-bar" style="width:68px;height:22px;border-radius:99px;"></div>
                </div>
                <div class="app-sk-bar" style="width:90px;height:14px;"></div>
              </div>
            {/each}
          </div>
        </div>

      {:else if dest.startsWith('/app/profile')}
        <!-- Profile skeleton -->
        <div class="bg-[#2372B9] px-5 pt-3 pb-6 shrink-0">
          <div style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.15);margin-bottom:12px;"></div>
          <div style="display:flex;align-items:center;gap:16px;">
            <div style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.2);flex-shrink:0;"></div>
            <div>
              <div class="app-sk-bar" style="width:130px;height:18px;margin-bottom:6px;opacity:0.35;"></div>
              <div class="app-sk-bar" style="width:90px;height:12px;opacity:0.35;"></div>
            </div>
          </div>
        </div>
        <div class="flex-1 px-4 py-5">
          <div class="app-sk-card" style="padding:20px;">
            {#each [1,2,3,4] as _}
              <div style="margin-bottom:16px;">
                <div class="app-sk-bar" style="width:70px;height:10px;margin-bottom:6px;"></div>
                <div class="app-sk-bar" style="width:80%;height:14px;"></div>
              </div>
              {#if _ < 4}
                <div style="height:1px;background:#EAEAEA;margin-bottom:16px;"></div>
              {/if}
            {/each}
          </div>
        </div>

      {:else if dest.startsWith('/app/claim')}
        <!-- Coupon submission skeleton -->
        <div class="bg-[#2372B9] px-5 pt-3 pb-5 shrink-0">
          <div class="app-sk-bar" style="width:160px;height:18px;margin-bottom:6px;opacity:0.35;"></div>
          <div class="app-sk-bar" style="width:100px;height:13px;opacity:0.35;"></div>
        </div>
        <div class="flex-1 px-4 py-5">
          <div class="app-sk-card" style="margin-bottom:14px;padding:16px;">
            <div class="app-sk-bar" style="width:70%;height:13px;margin-bottom:10px;"></div>
            <div class="app-sk-bar" style="width:100%;height:8px;border-radius:99px;margin-bottom:6px;"></div>
            <div class="app-sk-bar" style="width:50%;height:11px;"></div>
          </div>
          <div class="app-sk-card" style="margin-bottom:14px;height:140px;display:flex;align-items:center;justify-content:center;">
            <div class="app-sk-bar" style="width:60px;height:60px;border-radius:12px;"></div>
          </div>
          <div class="app-sk-card" style="padding:16px;">
            <div class="app-sk-bar" style="width:80px;height:11px;margin-bottom:8px;"></div>
            <div class="app-sk-bar" style="width:100%;height:46px;border-radius:8px;"></div>
          </div>
        </div>

      {:else}
        <!-- Generic app skeleton -->
        <div class="bg-[#2372B9] px-5 pt-3 pb-5 shrink-0" style="height:80px;"></div>
        <div class="flex-1 px-4 py-5">
          <div style="display:flex;flex-direction:column;gap:10px;">
            {#each [1,2,3] as _}
              <div class="app-sk-card">
                <div class="app-sk-bar" style="width:70%;height:14px;margin-bottom:8px;"></div>
                <div class="app-sk-bar" style="width:50%;height:12px;"></div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

    </div>
  </main>
{:else}
  {@render children()}
{/if}

<style>
  .app-sk-bar {
    background: #EAEAEA;
    border-radius: 5px;
    animation: app-sk-pulse 1.4s ease-in-out infinite;
  }
  .app-sk-card {
    background: #fff;
    border-radius: 12px;
    border: 1px solid #EAEAEA;
    padding: 14px 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  @keyframes app-sk-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
</style>
