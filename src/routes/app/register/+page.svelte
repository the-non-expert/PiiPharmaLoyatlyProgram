<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();

  const STATES = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
    'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
    'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
    'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
    'Uttarakhand','West Bengal','Andaman & Nicobar Islands','Chandigarh',
    'Dadra & Nagar Haveli and Daman & Diu','Delhi','Jammu & Kashmir','Ladakh',
    'Lakshadweep','Puducherry'
  ];

  const f = $derived(form as { name?: string; city?: string; state?: string; upi_id?: string; error?: string } | undefined);

  function fieldClass(hasErr = false) {
    return `w-full h-[52px] border-2 rounded-lg px-4 text-[15px] text-[#474545] bg-white focus:outline-none transition-colors ${hasErr ? 'border-[#E53E3E] bg-[#fde8e8]' : 'border-[#EAEAEA] focus:border-[#2372B9]'}`;
  }
</script>

<main class="min-h-screen bg-white flex flex-col font-[Montserrat]">
  <div class="flex-1 max-w-sm mx-auto w-full flex flex-col px-6 py-5 overflow-y-auto">

    <!-- Header -->
    <div class="mb-7">
      <div class="flex items-center gap-[10px] mb-1.5">
        <div class="w-9 h-9 bg-[#e8f1fb] rounded-lg flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="#2372B9" stroke-width="2"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#2372B9" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h1 class="text-[22px] font-bold text-[#474545]">Complete your profile</h1>
      </div>
      <p class="text-[13px] text-[#686868] leading-relaxed" style="padding-left:46px">One-time setup. Takes less than a minute.</p>
    </div>

    <form method="POST" use:enhance class="flex flex-col flex-1 gap-[18px]">

      {#if f?.error}
        <div class="bg-[#fde8e8] text-[#9b2626] rounded-lg p-3 text-[13px]">{f.error}</div>
      {/if}

      <!-- Full Name -->
      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#474545]" for="name">Full Name</label>
        <input
          id="name" name="name" type="text"
          value={f?.name ?? ''}
          placeholder="e.g. Rajesh Kumar"
          class={fieldClass()}
          required
        />
      </div>

      <!-- City -->
      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#474545]" for="city">City</label>
        <input
          id="city" name="city" type="text"
          value={f?.city ?? ''}
          placeholder="e.g. Indore"
          class={fieldClass()}
          required
        />
      </div>

      <!-- State dropdown -->
      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#474545]" for="state">State</label>
        <div class="relative">
          <select
            id="state" name="state"
            class="w-full h-[52px] border-2 border-[#EAEAEA] rounded-lg px-4 text-[15px] text-[#474545] bg-white focus:outline-none focus:border-[#2372B9] appearance-none transition-colors"
            required
          >
            <option value="" disabled selected={!f?.state}>Select state</option>
            {#each STATES as s}
              <option value={s} selected={f?.state === s}>{s}</option>
            {/each}
          </select>
          <div class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="#686868" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- UPI ID -->
      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-semibold text-[#474545]" for="upi_id">UPI ID</label>
        <input
          id="upi_id" name="upi_id" type="text"
          value={f?.upi_id ?? ''}
          placeholder="yourname@upi"
          class={fieldClass()}
          required
        />
        <div class="flex items-start gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="shrink-0 mt-[2px]">
            <circle cx="12" cy="12" r="9" stroke="#24AEB1" stroke-width="2"/>
            <path d="M12 8v4M12 16h.01" stroke="#24AEB1" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="text-[12px] text-[#686868] leading-snug">Cashback will be transferred to this UPI ID</span>
        </div>
      </div>

      <div class="flex-1 min-h-6"></div>

      <div>
        <button
          type="submit"
          class="w-full py-4 rounded-lg bg-[#2372B9] text-white text-[16px] font-bold"
        >
          Save and Continue
        </button>
        <p class="text-[12px] text-[#686868] text-center mt-3 leading-snug">
          Your data is safe and only used for cashback processing.
        </p>
      </div>

    </form>
  </div>
</main>
