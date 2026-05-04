<script lang="ts">
  import type { PageData } from './$types';
  import BottomNav from '$lib/components/BottomNav.svelte';

  let { data }: { data: PageData } = $props();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning,' : hour < 17 ? 'Good afternoon,' : 'Good evening,';

  function pct(submitted: number, required: number) {
    return Math.min(100, Math.round((submitted / required) * 100));
  }

  const statusMap: Record<string, { bg: string; color: string; dot: string; label: string }> = {
    pending:  { bg: '#fef3cd', color: '#92640a', dot: '#F59E0B', label: 'Pending' },
    approved: { bg: '#f0f9e6', color: '#3d6e10', dot: '#93CB52', label: 'Approved' },
    rejected: { bg: '#fde8e8', color: '#9b2626', dot: '#E53E3E', label: 'Rejected' },
    paid:     { bg: '#e8f1fb', color: '#14407a', dot: '#2372B9', label: 'Paid' },
  };
</script>

<main class="min-h-screen bg-[#F4F6F8] flex flex-col font-[Montserrat]">
  <div class="max-w-lg mx-auto w-full flex flex-col flex-1 pb-[72px]">

    <!-- Blue header -->
    <div class="bg-[#2372B9] px-5 pt-3 pb-5 shrink-0">
      <div class="flex justify-between items-center">
        <div>
          <p class="text-[13px] font-medium leading-none mb-1" style="color: rgba(255,255,255,0.75)">{greeting}</p>
          <h1 class="text-[22px] font-bold text-white leading-snug">Welcome back 👋</h1>
        </div>
        <div
          class="w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0"
          style="background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.4)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="rgba(255,255,255,0.9)" stroke-width="2"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Scrollable body -->
    <div class="flex-1 overflow-y-auto px-4 py-5">

      <!-- YOUR PRODUCTS -->
      <h2 class="text-[15px] font-bold text-[#474545] mb-3 uppercase" style="letter-spacing:0.05em">Your Products</h2>

      {#await data.products}
        <!-- Skeleton cards while data loads -->
        <div class="flex flex-col gap-3 mb-6">
          {#each [1, 2, 3] as _}
            <div
              class="bg-white rounded-xl border border-[#EAEAEA] p-4 animate-pulse"
              style="box-shadow: 0 2px 8px rgba(0,0,0,0.04)"
            >
              <div class="flex justify-between items-start mb-3">
                <div class="flex-1 min-w-0 mr-3">
                  <div class="h-[16px] bg-[#EAEAEA] rounded w-2/3 mb-[8px]"></div>
                  <div class="h-[13px] bg-[#EAEAEA] rounded w-1/3"></div>
                </div>
              </div>
              <div class="h-2 bg-[#EAEAEA] rounded-full mb-3"></div>
              <div class="flex justify-between items-center">
                <div class="h-[12px] bg-[#EAEAEA] rounded w-2/5"></div>
                <div class="h-[32px] bg-[#EAEAEA] rounded-md w-28"></div>
              </div>
            </div>
          {/each}
        </div>
      {:then products}
        {#if products.length === 0}
          <div class="bg-white rounded-xl p-8 text-center border border-[#EAEAEA]">
            <p class="text-[14px] text-[#686868]">No active products found.</p>
          </div>
        {:else}
          <div class="flex flex-col gap-3 mb-6">
            {#each products as product}
              {@const done = product.has_active_claim}
              {@const progress = pct(product.submitted_count, product.coupons_required)}

              <div
                class="bg-white rounded-xl border border-[#EAEAEA] p-4"
                style="box-shadow: 0 2px 8px rgba(0,0,0,0.04)"
              >
                <div class="flex justify-between items-start mb-2.5">
                  <div class="flex-1 min-w-0 mr-3">
                    <div class="text-[15px] font-bold text-[#474545] mb-[3px]">{product.name}</div>
                    <div class="text-[13px] font-bold" style="color: {done ? '#93CB52' : '#2372B9'}">
                      ₹{product.cashback_amount} cashback
                    </div>
                  </div>
                  {#if done}
                    <span
                      class="inline-flex items-center gap-1 px-[10px] py-1 rounded-full text-[12px] font-bold shrink-0"
                      style="background: #f0f9e6; color: #3d6e10"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-[#93CB52]"></span>
                      Approved
                    </span>
                  {/if}
                </div>

                <!-- Progress bar -->
                <div class="h-2 bg-[#EAEAEA] rounded-full overflow-hidden mb-2">
                  <div
                    class="h-full rounded-full transition-all"
                    style="width: {done ? 100 : progress}%; background: {done ? '#93CB52' : '#2372B9'}"
                  ></div>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-[12px] text-[#686868]">
                    {done ? product.coupons_required : product.submitted_count} of {product.coupons_required} coupons submitted
                  </span>
                  {#if !done}
                    <a
                      href="/app/claim/{product.id}"
                      class="bg-[#e8f1fb] text-[#2372B9] border border-[#2372B9] rounded-md px-[14px] py-[7px] text-[13px] font-bold shrink-0"
                    >
                      Submit Coupon
                    </a>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      {/await}

    </div>
  </div>

  <BottomNav active="home" />
</main>
