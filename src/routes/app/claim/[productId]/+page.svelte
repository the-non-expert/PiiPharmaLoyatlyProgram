<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  // ── Coupon queue ─────────────────────────────────────────────────────────
  // File objects MUST live outside $state — Svelte 5 proxies plain objects,
  // which breaks FormData.append when passing a proxied File reference.
  let queueFiles: File[] = [];                              // raw, non-reactive
  let queue = $state<{ preview: string; serial: string }[]>([]); // display only

  // Current entry being filled
  let curFile    = $state<File | null>(null);
  let curPreview = $state<string | null>(null);
  let curSerial  = $state('');
  let submitting  = $state(false);
  let compressing = $state(false);

  const curComplete    = $derived(!!curFile && curSerial.trim().length > 0);
  const totalToSubmit  = $derived(queue.length + (curComplete ? 1 : 0));
  const canSubmit      = $derived(totalToSubmit > 0 && !submitting && !data.has_active_claim);

  // Post-save derived
  const savedResult = $derived(form as any);
  const showPostSave = $derived(savedResult?.saved === true);
  const newCount  = $derived(savedResult?.newCount  ?? data.submitted_count);
  const required  = $derived(savedResult?.required  ?? data.product.coupons_required);
  const qualified = $derived(savedResult?.qualified === true);
  const pct = $derived(Math.min(100, Math.round((newCount / required) * 100)));

  // Resize to max 1200px wide and re-encode at 82% JPEG quality.
  // Keeps files well under Netlify's 6MB function body limit.
  async function compressImage(raw: File): Promise<{ file: File; preview: string }> {
    return new Promise(resolve => {
      const img = new Image();
      const url = URL.createObjectURL(raw);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX = 1200;
        let w = img.width, h = img.height;
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        const preview = canvas.toDataURL('image/jpeg', 0.82);
        canvas.toBlob(
          blob => resolve({ file: new File([blob ?? raw], 'coupon.jpg', { type: 'image/jpeg' }), preview }),
          'image/jpeg', 0.82
        );
      };
      img.src = url;
    });
  }

  async function handlePhoto(e: Event) {
    const raw = (e.target as HTMLInputElement).files?.[0];
    if (!raw) return;
    compressing = true;
    const { file, preview } = await compressImage(raw);
    compressing = false;
    curFile = file;
    curPreview = preview;
  }

  function clearPhoto() { curFile = null; curPreview = null; }

  function addToQueue() {
    if (!curFile || !curSerial.trim()) return;
    queueFiles.push(curFile);
    queue.push({ preview: curPreview!, serial: curSerial.trim().toUpperCase() });
    curFile = null;
    curPreview = null;
    curSerial = '';
  }

  function removeFromQueue(i: number) {
    queueFiles.splice(i, 1);
    queue.splice(i, 1);
  }
</script>

{#if showPostSave && qualified}
<!-- ── CLAIM CREATED ── -->
<main
  class="min-h-screen flex flex-col font-[Montserrat]"
  style="background: linear-gradient(160deg, #1a5a99 0%, #2372B9 40%, #24AEB1 100%)"
>
  <div class="max-w-sm mx-auto w-full flex flex-col items-center px-6 pb-10 pt-4">
    <div class="mt-10 mb-7 relative">
      <div class="absolute w-3.5 h-3.5 rounded-full bg-[#F59E0B] opacity-80" style="top:-15px;left:-30px"></div>
      <div class="absolute w-2.5 h-2.5 rounded-full bg-[#93CB52] opacity-80" style="top:-10px;right:-30px"></div>
      <div class="absolute w-2 h-2 rounded-full bg-white opacity-80" style="top:20px;left:-20px"></div>
      <div class="absolute w-3 h-3 rounded-full bg-[#F59E0B] opacity-80" style="top:25px;right:-40px"></div>
      <div class="absolute w-2.5 h-2.5 rounded-full bg-white opacity-80" style="top:-25px;right:10px"></div>
      <div class="w-[100px] h-[100px] rounded-full flex items-center justify-center"
        style="background: rgba(255,255,255,0.2); border: 3px solid rgba(255,255,255,0.5)">
        <span class="text-[44px]">🎉</span>
      </div>
    </div>

    <h1 class="text-[26px] font-bold text-white text-center mb-2.5 leading-snug">
      Claim submitted<br>for review!
    </h1>
    <p class="text-[14px] text-center mb-8 leading-relaxed" style="color: rgba(255,255,255,0.85)">
      Your ₹{savedResult.cashback} cashback claim is now under review.<br>We'll process it shortly.
    </p>

    <div class="w-full rounded-[14px] p-5 mb-9"
      style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3)">
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
          <div class="text-[14px] font-bold text-white">{savedResult.upi_id ?? 'your registered UPI ID'}</div>
        </div>
      </div>
    </div>

    <a href="/app" class="w-full py-4 rounded-[10px] bg-white text-[#2372B9] text-[15px] font-bold text-center block">
      Back to Dashboard
    </a>
  </div>
</main>

{:else if showPostSave}
<!-- ── PROGRESS UPDATED ── -->
<main class="min-h-screen bg-white flex flex-col font-[Montserrat]">
  <div class="max-w-sm mx-auto w-full flex flex-col items-center px-6 pb-10">
    <div class="mt-12 mb-6">
      <div class="w-[88px] h-[88px] rounded-full flex items-center justify-center"
        style="background: #f0f9e6; border: 3px solid #93CB52">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
          <path d="M5 12l5 5 9-9" stroke="#93CB52" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>

    <h1 class="text-[24px] font-bold text-[#474545] text-center mb-2 leading-snug">
      {savedResult.submittedCount > 1 ? `${savedResult.submittedCount} coupons` : 'Coupon'} submitted!
    </h1>
    <p class="text-[14px] text-[#686868] text-center mb-9 leading-relaxed">
      Recorded for {data.product.name}.
    </p>

    <div class="w-full bg-white rounded-[14px] border border-[#EAEAEA] p-5 mb-9"
      style="box-shadow: 0 4px 16px rgba(0,0,0,0.06)">
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
        onclick={() => goto(window.location.pathname, { replaceState: true })}
        class="w-full py-[15px] rounded-lg bg-[#2372B9] text-white text-[15px] font-bold text-center"
      >
        Submit Another Coupon
      </button>
      <a href="/app"
        class="w-full py-[13px] rounded-lg text-[#2372B9] text-[15px] font-bold text-center border-2 border-[#2372B9]">
        Back to Dashboard
      </a>
    </div>
  </div>
</main>

{:else}
<!-- ── SUBMISSION FORM ── -->
<main class="min-h-screen bg-white flex flex-col font-[Montserrat]">
  <div class="max-w-sm mx-auto w-full flex flex-col flex-1">

    <!-- Top bar -->
    <div class="flex items-center gap-3 px-5 py-2 border-b border-[#EAEAEA] shrink-0">
      <a href="/app"
        class="w-10 h-10 flex items-center justify-center rounded-full bg-[#F4F6F8] shrink-0"
        aria-label="Back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="#474545" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>
      <span class="text-[17px] font-bold text-[#474545] truncate">{data.product.name}</span>
    </div>

    <div class="flex-1 flex flex-col gap-4 px-5 py-5 pb-8 overflow-y-auto">

      <!-- Error -->
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

      <!-- Progress chip -->
      <div class="bg-[#e8f1fb] rounded-[10px] px-4 py-3.5 flex items-center gap-2.5">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#2372B9" stroke-width="2" fill="#e8f1fb"/>
          <path d="M12 7v5l3 3" stroke="#2372B9" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <div>
          <div class="text-[15px] font-bold text-[#2372B9]">₹{data.product.cashback_amount} cashback on {data.product.coupons_required} coupons</div>
          <div class="text-[12px] text-[#686868] mt-0.5">
            {data.submitted_count} of {data.product.coupons_required} submitted
            {#if data.product.coupons_required - data.submitted_count > 0}
              — {data.product.coupons_required - data.submitted_count} more to go
            {/if}
          </div>
        </div>
      </div>

      <!-- ── Queued coupons ── -->
      {#if queue.length > 0}
        <div class="flex flex-col gap-2">
          <p class="text-[12px] font-semibold text-[#686868] uppercase" style="letter-spacing:0.05em">
            Added ({queue.length}) — submit when ready
          </p>
          {#each queue as entry, i}
            <div class="flex items-center gap-3 bg-[#f0f9e6] border border-[#93CB52] rounded-xl p-3">
              <!-- Thumbnail -->
              <img src={entry.preview} alt="coupon" class="w-12 h-12 rounded-lg object-cover shrink-0 border border-[#93CB52]" />
              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="text-[13px] font-bold text-[#474545]">Coupon {i + 1}</p>
                <p class="text-[12px] text-[#686868] truncate font-mono">{entry.serial}</p>
              </div>
              <!-- Remove -->
              <button type="button" onclick={() => removeFromQueue(i)}
                class="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-[#EAEAEA] shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#E53E3E" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          {/each}
        </div>
      {/if}

      <!-- ── Current coupon input ── -->
      <form
        method="post"
        enctype="multipart/form-data"
        class="flex flex-col gap-4 flex-1"
        use:enhance={({ formData }) => {
          submitting = true;

          // Read serial from formData; use curFile from JS state (not formData)
          // because the DOM file input is empty in preview mode.
          const rawSerial = ((formData.get('serial') as string) ?? '').trim().toUpperCase();
          formData.delete('photo');
          formData.delete('serial');

          const all: { file: File; serial: string }[] = [
            ...queueFiles.map((file, i) => ({ file, serial: queue[i].serial })),
            ...(curFile && rawSerial ? [{ file: curFile, serial: rawSerial }] : [])
          ];

          formData.set('coupon_count', String(all.length));
          all.forEach((e, i) => {
            formData.append(`photo_${i}`, e.file, `coupon_${i}.jpg`);
            formData.append(`serial_${i}`, e.serial);
          });

          return async ({ result, update }) => {
            submitting = false;
            if (result.type !== 'failure') {
              queueFiles = [];
              queue = [];
              curFile = null; curPreview = null; curSerial = '';
            }
            await update();
          };
        }}
      >
        {#if queue.length > 0}
          <p class="text-[13px] font-semibold text-[#474545]">Add another coupon (optional)</p>
        {/if}

        <!-- Photo area -->
        {#if curPreview}
          <div class="relative rounded-[14px] overflow-hidden border-2 border-[#93CB52] min-h-[180px] flex-1">
            <img src={curPreview} alt="Coupon preview" class="w-full h-full object-cover min-h-[180px]" />
            <div class="absolute top-2.5 left-2.5 bg-[#93CB52] rounded-md px-2.5 py-1 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5 9-9" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
              <span class="text-[11px] font-bold text-white">Photo added</span>
            </div>
            <button type="button" onclick={clearPhoto}
              class="absolute top-2.5 right-2.5 rounded-md px-3 py-1.5"
              style="background: rgba(0,0,0,0.55)">
              <span class="text-[12px] font-semibold text-white">Retake</span>
            </button>
          </div>
        {:else if compressing}
          <div class="flex flex-col items-center justify-center rounded-[14px] border-[2.5px] border-[#c7ddf5] bg-[#f4f8fd] min-h-[160px] gap-3 py-7">
            <div class="w-14 h-14 rounded-full bg-[#e8f1fb] flex items-center justify-center">
              <svg class="animate-spin" width="26" height="26" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(35,114,185,0.15)" stroke-width="4"/>
                <path fill="#2372B9" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
            <div class="text-[14px] font-semibold text-[#474545]">Processing photo…</div>
          </div>
        {:else}
          <label class="flex flex-col items-center justify-center rounded-[14px] border-[2.5px] border-dashed border-[#EAEAEA] bg-[#F4F6F8] cursor-pointer min-h-[160px] gap-3 py-7">
            <div class="w-14 h-14 rounded-full bg-[#e8f1fb] flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#2372B9" stroke-width="2" stroke-linejoin="round"/>
                <circle cx="12" cy="13" r="4" stroke="#2372B9" stroke-width="2"/>
              </svg>
            </div>
            <div class="text-center">
              <div class="text-[15px] font-bold text-[#474545] mb-0.5">Tap to photograph coupon</div>
              <div class="text-[12px] text-[#686868]">Take a clear photo of the physical coupon</div>
            </div>
            <input type="file" name="photo" accept="image/*" capture="environment" onchange={handlePhoto} class="hidden" />
          </label>
        {/if}

        <!-- Serial number -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[13px] font-semibold text-[#474545]" for="serial">Serial number on coupon</label>
          <input
            id="serial" name="serial" type="text" inputmode="text"
            autocapitalize="characters" autocorrect="off" spellcheck="false" autocomplete="off"
            placeholder="e.g. AMX-2024-001234"
            bind:value={curSerial}
            class="w-full h-[52px] rounded-lg border-2 border-[#EAEAEA] px-4 text-[15px] text-[#474545] bg-white focus:outline-none focus:border-[#2372B9] transition-colors placeholder:text-[#EAEAEA]"
          />
        </div>

        <!-- Action buttons -->
        <div class="flex flex-col gap-2.5 mt-auto">

          <!-- Add to queue (only when current is complete) -->
          {#if curComplete}
            <button type="button" onclick={addToQueue}
              class="w-full py-3.5 rounded-lg border-2 border-[#2372B9] text-[#2372B9] text-[15px] font-bold flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="#2372B9" stroke-width="2.2" stroke-linecap="round"/>
              </svg>
              Add Another Coupon
            </button>
          {/if}

          <!-- Submit -->
          <button
            type="submit"
            disabled={!canSubmit}
            class="w-full py-4 rounded-lg text-white text-[16px] font-bold transition-colors"
            style="background: {canSubmit ? '#2372B9' : '#b8cfe8'}; cursor: {canSubmit ? 'pointer' : 'not-allowed'}"
          >
            {#if submitting}
              <span class="flex items-center justify-center gap-2">
                <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="4"/>
                  <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Submitting…
              </span>
            {:else if totalToSubmit > 1}
              Submit {totalToSubmit} Coupons
            {:else if totalToSubmit === 1}
              Submit Coupon
            {:else}
              Submit Coupon
            {/if}
          </button>

        </div>
      </form>
    </div>
  </div>
</main>
{/if}
