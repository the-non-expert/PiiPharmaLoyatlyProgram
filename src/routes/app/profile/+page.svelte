<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';
  import BottomNav from '$lib/components/BottomNav.svelte';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  const initials = $derived(
    data.retailer.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w: string) => w[0].toUpperCase())
      .join('')
  );
</script>

<main class="min-h-screen bg-[#F4F6F8] flex flex-col font-[Montserrat]">
  <div class="max-w-lg mx-auto w-full flex flex-col flex-1 pb-[72px]">

    <!-- Header with avatar -->
    <div class="bg-[#2372B9] px-5 pt-3 pb-6 shrink-0">
      <div class="flex items-center gap-4">
        <div
          class="w-[56px] h-[56px] rounded-full flex items-center justify-center shrink-0"
          style="background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.4)"
        >
          <span class="text-[20px] font-bold text-white">{initials}</span>
        </div>
        <div>
          <h1 class="text-[20px] font-bold text-white leading-snug">{data.retailer.name}</h1>
          <p class="text-[13px]" style="color: rgba(255,255,255,0.75)">+91 {data.retailer.mobile}</p>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-5">

      {#if form?.error}
        <div class="bg-[#fde8e8] text-[#9b2626] rounded-xl p-3 text-[13px] mb-4 border border-[#E53E3E]">{form.error}</div>
      {/if}
      {#if form?.success}
        <div class="bg-[#f0f9e6] text-[#3d6e10] rounded-xl p-3 text-[13px] mb-4 border border-[#93CB52]">UPI ID updated successfully!</div>
      {/if}

      <!-- Info card -->
      <div
        class="bg-white rounded-xl border border-[#EAEAEA] p-5 mb-4"
        style="box-shadow: 0 2px 8px rgba(0,0,0,0.04)"
      >
        <div class="flex flex-col gap-4">
          <div>
            <p class="text-[12px] font-semibold text-[#686868] uppercase mb-1" style="letter-spacing:0.05em">Full Name</p>
            <p class="text-[15px] font-semibold text-[#474545]">{data.retailer.name}</p>
          </div>
          <div class="h-px bg-[#EAEAEA]"></div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-[12px] font-semibold text-[#686868] uppercase mb-1" style="letter-spacing:0.05em">City</p>
              <p class="text-[14px] text-[#474545]">{data.retailer.city ?? '—'}</p>
            </div>
            <div>
              <p class="text-[12px] font-semibold text-[#686868] uppercase mb-1" style="letter-spacing:0.05em">State</p>
              <p class="text-[14px] text-[#474545]">{data.retailer.state ?? '—'}</p>
            </div>
          </div>
          <div class="h-px bg-[#EAEAEA]"></div>
          <div>
            <p class="text-[12px] font-semibold text-[#686868] uppercase mb-1" style="letter-spacing:0.05em">Mobile</p>
            <p class="text-[14px] text-[#474545]">+91 {data.retailer.mobile}</p>
          </div>
        </div>
      </div>

      <!-- UPI edit card -->
      <div
        class="bg-white rounded-xl border border-[#EAEAEA] p-5 mb-6"
        style="box-shadow: 0 2px 8px rgba(0,0,0,0.04)"
      >
        <p class="text-[13px] font-semibold text-[#474545] mb-3">UPI ID</p>
        <form method="post" use:enhance class="flex flex-col gap-3">
          <div>
            <input
              type="text"
              id="upi_id"
              name="upi_id"
              value={(form as any)?.upi_id ?? data.retailer.upi_id ?? ''}
              placeholder="handle@bank"
              class="w-full h-[52px] rounded-lg border-2 border-[#EAEAEA] px-4 text-[15px] text-[#474545] bg-white focus:outline-none focus:border-[#2372B9] transition-colors placeholder:text-[#EAEAEA]"
            />
            <div class="flex items-start gap-1.5 mt-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="shrink-0 mt-[2px]">
                <circle cx="12" cy="12" r="9" stroke="#24AEB1" stroke-width="2"/>
                <path d="M12 8v4M12 16h.01" stroke="#24AEB1" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span class="text-[12px] text-[#686868]">Cashback will be sent to this UPI ID</span>
            </div>
          </div>
          <button
            type="submit"
            class="w-full py-3.5 rounded-lg bg-[#2372B9] text-white text-[15px] font-bold"
          >
            Update UPI ID
          </button>
        </form>
      </div>

      <!-- Sign out -->
      <div class="text-center">
        <a href="/app/logout" class="text-[14px] font-semibold text-[#E53E3E]">Sign out</a>
      </div>

    </div>
  </div>

  <BottomNav active="profile" />
</main>
