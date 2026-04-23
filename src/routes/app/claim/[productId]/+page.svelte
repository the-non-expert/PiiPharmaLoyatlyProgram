<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let photoPreview = $state<string | null>(null);
  let photoFile = $state<File | null>(null);
  let serialValue = $state('');
  let submitting = $state(false);

  function handlePhoto(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    photoFile = file;
    const reader = new FileReader();
    reader.onload = ev => { photoPreview = ev.target?.result as string; };
    reader.readAsDataURL(file);
  }

  function clearPhoto() {
    photoFile = null;
    photoPreview = null;
  }

  function resetForm() {
    photoFile = null;
    photoPreview = null;
    serialValue = '';
    submitting = false;
  }

  const savedResult = $derived(form as any);
  const showPostSave = $derived(savedResult?.saved === true);
  const newCount = $derived(savedResult?.newCount ?? data.submitted_count);
  const required = $derived(savedResult?.required ?? data.product.coupons_required);
  const qualified = $derived(savedResult?.qualified === true);
  const pct = $derived(Math.min(100, Math.round((newCount / required) * 100)));
  const submitEnabled = $derived(!!photoFile && serialValue.trim().length > 0);

  const remaining = $derived(data.product.coupons_required - data.submitted_count);
</script>

{#if showPostSave && qualified}
<!-- ── SCREEN 8: CLAIM CREATED (gradient celebration) ── -->
<main
  class="min-h-screen flex flex-col font-[Montserrat]"
  style="background: linear-gradient(160deg, #1a5a99 0%, #2372B9 40%, #24AEB1 100%)"
>
  <div class="max-w-sm mx-auto w-full flex flex-col items-center px-6 pb-10 pt-4">

    <!-- Celebration icon -->
    <div class="mt-10 mb-7 relative">
      <!-- Confetti dots -->
      <div class="absolute w-3.5 h-3.5 rounded-full bg-[#F59E0B] opacity-80" style="top:-15px;left:-30px"></div>
      <div class="absolute w-2.5 h-2.5 rounded-full bg-[#93CB52] opacity-80" style="top:-10px;right:-30px"></div>
      <div class="absolute w-2 h-2 rounded-full bg-white opacity-80" style="top:20px;left:-20px"></div>
      <div class="absolute w-3 h-3 rounded-full bg-[#F59E0B] opacity-80" style="top:25px;right:-40px"></div>
      <div class="absolute w-2.5 h-2.5 rounded-full bg-white opacity-80" style="top:-25px;right:10px"></div>
      <div
        class="w-[100px] h-[100px] rounded-full flex items-center justify-center"
        style="background: rgba(255,255,255,0.2); border: 3px solid rgba(255,255,255,0.5); backdrop-filter: blur(4px)"
      >
        <span class="text-[44px]">🎉</span>
      </div>
    </div>

    <h1 class="text-[26px] font-bold text-white text-center mb-2.5 leading-snug">
      Claim submitted<br>for review!
    </h1>
    <p class="text-[14px] text-center mb-8 leading-relaxed" style="color: rgba(255,255,255,0.85)">
      Your ₹{savedResult.cashback} cashback claim is now under review.<br>We'll process it shortly.
    </p>

    <!-- Details card -->
    <div
      class="w-full rounded-[14px] p-5 mb-9"
      style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); backdrop-filter: blur(8px)"
    >
      <div class="flex justify-between items-center mb-3.5">
        <span class="text-[13px]" style="color: rgba(255,255,255,0.75)">Product</span>
        <span class="text-[14px] font-semibold text-white">{data.product.name}</span>
      </div>
      <div class="h-px mb-3.5" style="background: rgba(255,255,255,0.2)"></div>
      <div class="flex justify-between items-center mb-3.5">
        <span class="text-[13px]" style="color: rgba(255,255,255,0.75)">Cashback</span>
        <span class="text-[18px] font-bold" style="color: #93CB52">₹{savedResult.cashback}</span>
      </div>
      <div class="h-px mb-3.5" style="background: rgba(255,255,255,0.2)"></div>
      <div class="flex items-start gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="shrink-0 mt-0.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linejoin="round"/>
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linejoin="round"/>
        </svg>
        <div>
          <div class="text-[12px] mb-0.5" style="color: rgba(255,255,255,0.7)">Cashback will be sent to</div>
          <div class="text-[14px] font-bold text-white">your registered UPI ID</div>
        </div>
      </div>
    </div>

    <a
      href="/app"
      class="w-full py-4 rounded-[10px] bg-white text-[#2372B9] text-[15px] font-bold text-center block"
    >
      Back to Dashboard
    </a>
  </div>
</main>

{:else if showPostSave}
<!-- ── SCREEN 7: PROGRESS UPDATED ── -->
<main class="min-h-screen bg-white flex flex-col font-[Montserrat]">
  <div class="max-w-sm mx-auto w-full flex flex-col items-center px-6 pb-10">

    <!-- Success icon -->
    <div class="mt-12 mb-6">
      <div
        class="w-[88px] h-[88px] rounded-full flex items-center justify-center"
        style="background: #f0f9e6; border: 3px solid #93CB52"
      >
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
          <path d="M5 12l5 5 9-9" stroke="#93CB52" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>

    <h1 class="text-[24px] font-bold text-[#474545] text-center mb-2 leading-snug">
      Coupon submitted<br>successfully!
    </h1>
    <p class="text-[14px] text-[#686868] text-center mb-9 leading-relaxed">
      Your coupon has been recorded for {data.product.name}.
    </p>

    <!-- Progress card -->
    <div
      class="w-full bg-white rounded-[14px] border border-[#EAEAEA] p-5 mb-9"
      style="box-shadow: 0 4px 16px rgba(0,0,0,0.06)"
    >
      <div class="flex justify-between items-center mb-3">
        <span class="text-[14px] font-semibold text-[#474545]">{data.product.name}</span>
        <span class="text-[15px] font-bold text-[#2372B9]">{newCount} / {required}</span>
      </div>
      <div class="h-2 bg-[#EAEAEA] rounded-full overflow-hidden mb-2.5">
        <div class="h-full bg-[#2372B9] rounded-full transition-all" style="width:{pct}%"></div>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-2 h-2 rounded-full bg-[#F59E0B] shrink-0"></div>
        <span class="text-[13px] text-[#474545]">
          {newCount} of {required} coupons submitted —
          <strong>{required - newCount} more to go</strong>
        </span>
      </div>
    </div>

    <div class="w-full flex flex-col gap-3">
      <button
        type="button"
        onclick={resetForm}
        class="w-full py-[15px] rounded-lg bg-[#2372B9] text-white text-[15px] font-bold text-center"
      >
        Submit Another Coupon
      </button>
      <a
        href="/app"
        class="w-full py-[13px] rounded-lg text-[#2372B9] text-[15px] font-bold text-center border-2 border-[#2372B9]"
      >
        Back to Dashboard
      </a>
    </div>
  </div>
</main>

{:else}
<!-- ── SCREEN 5/6: SUBMISSION FORM ── -->
<main class="min-h-screen bg-white flex flex-col font-[Montserrat]">
  <div class="max-w-sm mx-auto w-full flex flex-col flex-1">

    <!-- Top bar -->
    <div class="flex items-center gap-3 px-5 py-2 border-b border-[#EAEAEA] shrink-0">
      <a
        href="/app"
        class="w-10 h-10 flex items-center justify-center rounded-full bg-[#F4F6F8] shrink-0"
        aria-label="Back"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="#474545" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>
      <span class="text-[17px] font-bold text-[#474545] truncate">{data.product.name}</span>
    </div>

    <div class="flex-1 flex flex-col gap-5 px-5 py-5 pb-8 overflow-y-auto">

      <!-- Error banner -->
      {#if (form as any)?.error}
        <div class="bg-[#fde8e8] text-[#9b2626] rounded-xl p-3 text-[13px] border border-[#E53E3E]">
          {(form as any).error}
        </div>
      {/if}

      <!-- Active claim warning -->
      {#if data.has_active_claim}
        <div class="bg-[#fef3cd] text-[#92640a] rounded-xl p-4 text-[14px] border border-[#F59E0B]">
          This product is already submitted for review. Check My Claims for the status.
        </div>
      {/if}

      <!-- Cashback reminder chip -->
      <div class="bg-[#e8f1fb] rounded-[10px] px-4 py-3.5 flex items-center gap-2.5">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#2372B9" stroke-width="2" fill="#e8f1fb"/>
          <path d="M12 7v5l3 3" stroke="#2372B9" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <div>
          <div class="text-[15px] font-bold text-[#2372B9]">₹{data.product.cashback_amount} cashback on {data.product.coupons_required} coupons</div>
          <div class="text-[12px] text-[#686868] mt-0.5">
            {data.submitted_count} of {data.product.coupons_required} submitted
            {#if remaining > 0} — {remaining} more to go{/if}
          </div>
        </div>
      </div>

      <!-- Progress card -->
      <div class="bg-white rounded-[10px] border border-[#EAEAEA] p-4">
        <div class="flex justify-between items-center mb-2.5">
          <span class="text-[14px] font-semibold text-[#474545]">Progress</span>
          <span class="text-[14px] font-bold text-[#2372B9]">{data.submitted_count} / {data.product.coupons_required}</span>
        </div>
        <div class="h-2 bg-[#EAEAEA] rounded-full overflow-hidden mb-2">
          <div
            class="h-full bg-[#2372B9] rounded-full"
            style="width: {Math.min(100, Math.round((data.submitted_count / data.product.coupons_required) * 100))}%"
          ></div>
        </div>
        {#if remaining > 0}
          <div class="text-[12px] text-[#686868]">{remaining} more coupon{remaining === 1 ? '' : 's'} needed to unlock cashback</div>
        {/if}
      </div>

      <!-- Submission form -->
      <form
        method="post"
        enctype="multipart/form-data"
        class="flex flex-col gap-5 flex-1"
        use:enhance={() => {
          submitting = true;
          return async ({ result, update }) => {
            submitting = false;
            await update();
          };
        }}
      >
        <!-- Photo area -->
        {#if photoPreview}
          <!-- Screen 6: photo selected -->
          <div class="relative rounded-[14px] overflow-hidden border-2 border-[#93CB52] min-h-[200px] flex-1">
            <img src={photoPreview} alt="Coupon preview" class="w-full h-full object-cover min-h-[200px]" />
            <!-- Success overlay -->
            <div class="absolute top-2.5 left-2.5 bg-[#93CB52] rounded-md px-2.5 py-1 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5 9-9" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
              <span class="text-[11px] font-bold text-white">Photo added</span>
            </div>
            <!-- Retake button -->
            <button
              type="button"
              onclick={clearPhoto}
              class="absolute top-2.5 right-2.5 rounded-md px-3 py-1.5"
              style="background: rgba(0,0,0,0.55)"
            >
              <span class="text-[12px] font-semibold text-white">Retake</span>
            </button>
            <!-- Hidden file input for re-selection -->
            <input type="file" name="photo" accept="image/*" capture="environment" class="hidden" value="" />
          </div>
        {:else}
          <!-- Screen 5: empty photo area -->
          <label
            class="flex flex-col items-center justify-center rounded-[14px] border-[2.5px] border-dashed border-[#EAEAEA] bg-[#F4F6F8] cursor-pointer flex-1 min-h-[180px] gap-3 py-8"
          >
            <div class="w-16 h-16 rounded-full bg-[#e8f1fb] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#2372B9" stroke-width="2" stroke-linejoin="round"/>
                <circle cx="12" cy="13" r="4" stroke="#2372B9" stroke-width="2"/>
              </svg>
            </div>
            <div class="text-center">
              <div class="text-[16px] font-bold text-[#474545] mb-1">Tap to photograph coupon</div>
              <div class="text-[13px] text-[#686868]">Take a clear photo of the physical coupon</div>
            </div>
            <input
              type="file"
              name="photo"
              accept="image/*"
              capture="environment"
              onchange={handlePhoto}
              class="hidden"
            />
          </label>
        {/if}

        <!-- Serial number -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[13px] font-semibold text-[#474545]" for="serial">Serial number on coupon</label>
          <input
            id="serial"
            name="serial"
            type="text"
            inputmode="text"
            autocapitalize="characters"
            autocorrect="off"
            spellcheck="false"
            autocomplete="off"
            placeholder="e.g. AMX-2024-001234"
            bind:value={serialValue}
            class="w-full h-[52px] rounded-lg border-2 border-[#EAEAEA] px-4 text-[15px] text-[#474545] bg-white focus:outline-none focus:border-[#2372B9] transition-colors placeholder:text-[#EAEAEA]"
            required
          />
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          disabled={!submitEnabled || submitting || data.has_active_claim}
          class="w-full py-4 rounded-lg text-white text-[16px] font-bold transition-colors"
          style="background: {submitEnabled && !submitting && !data.has_active_claim ? '#2372B9' : '#b8cfe8'}; cursor: {submitEnabled && !submitting && !data.has_active_claim ? 'pointer' : 'not-allowed'}"
        >
          {#if submitting}
            <span class="flex items-center justify-center gap-2">
              <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="4"/>
                <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Saving…
            </span>
          {:else}
            Submit Coupon
          {/if}
        </button>

      </form>
    </div>
  </div>
</main>
{/if}
