<script lang="ts">
  import QrGlyph from './QrGlyph.svelte';

  export interface ScanResultOk {
    serial: string;
    product_name: string;
    coupons_submitted: number;
    coupons_required: number;
    cashback_amount: number;
    claim_created: boolean;
    upi_id?: string;
  }

  let {
    result,
    onscanagain,
    onviewclaims
  }: {
    result: ScanResultOk;
    onscanagain: () => void;
    onviewclaims: () => void;
  } = $props();

  const remaining = $derived(result.coupons_required - result.coupons_submitted);
  const pct = $derived(
    Math.min(100, Math.round((result.coupons_submitted / result.coupons_required) * 100))
  );

  function trapFocus(node: HTMLElement) {
    const focusable = node.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onscanagain(); return; }
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    node.addEventListener('keydown', handleKey);
    first?.focus();
    return { destroy() { node.removeEventListener('keydown', handleKey); } };
  }
</script>

<!-- Backdrop: dim home behind -->
<div class="fixed inset-0 z-30" style="background: rgba(15,30,50,0.55)" aria-hidden="true"></div>

<!-- Sheet -->
<div
  class="fixed left-0 right-0 bottom-0 z-40 bg-white max-w-lg mx-auto"
  style="border-radius: 24px 24px 0 0; box-shadow: 0 -16px 48px rgba(0,0,0,0.2); padding: 12px 24px 32px"
  role="dialog"
  aria-modal="true"
  aria-label={result.claim_created ? 'Claim completed' : 'Coupon scanned'}
  use:trapFocus
>
  <!-- drag handle -->
  <div class="w-11 h-[5px] rounded-full bg-[#d8dde3] mx-auto mb-[18px]"></div>

  {#if result.claim_created}
    <!-- ── CELEBRATION VARIANT ── -->
    <div class="relative flex justify-center mt-1 mb-3">
      <!-- confetti dots -->
      {#each [[-60,-6,'#F59E0B',8],[-40,16,'#93CB52',6],[55,-10,'#2372B9',9],[70,18,'#F59E0B',7],[20,-22,'#93CB52',7],[-20,-28,'#2372B9',6]] as [x,y,c,s]}
        <div
          class="absolute rounded-full"
          style="width:{s}px;height:{s}px;background:{c};opacity:0.85;left:calc(50% + {x}px);top:calc(50% + {y}px);transform:translate(-50%,-50%)"
        ></div>
      {/each}
      <div
        class="w-[72px] h-[72px] rounded-full flex items-center justify-center"
        style="background:#f0f9e6;border:3px solid #93CB52"
      >
        <span class="text-[36px]" role="img" aria-label="party">🎉</span>
      </div>
    </div>

    <h2 class="text-[22px] font-bold text-[#474545] text-center mb-[6px]">Claim submitted!</h2>
    <p class="text-[13px] text-[#686868] text-center leading-[1.5] mb-[18px]">
      You completed {result.coupons_required} of {result.coupons_required} coupons for {result.product_name}.
    </p>

    <!-- cashback gradient card -->
    <div
      class="relative overflow-hidden rounded-[14px] px-5 py-[18px] mb-[6px] text-white"
      style="background: linear-gradient(135deg, #2372B9 0%, #1a5a99 100%)"
    >
      <div class="absolute right-[-20px] top-[-20px] opacity-[0.12]">
        <QrGlyph size={140} color="#fff" />
      </div>
      <div
        class="text-[11px] font-bold uppercase mb-[6px]"
        style="color:rgba(255,255,255,0.75);letter-spacing:0.07em"
      >Cashback</div>
      <div class="text-[36px] font-bold mb-2" style="letter-spacing:-0.01em">₹{result.cashback_amount}</div>
      <div
        class="flex items-center gap-2 px-3 py-[10px] rounded-lg"
        style="background:rgba(255,255,255,0.16);border:1px solid rgba(255,255,255,0.2)"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
        </svg>
        <span class="text-[12px]" style="color:rgba(255,255,255,0.85)">Transferring to</span>
        <span class="text-[13px] font-bold">{result.upi_id ?? '—'}</span>
      </div>
    </div>

  {:else}
    <!-- ── PROGRESS VARIANT ── -->
    <div class="flex items-center gap-3 mb-[6px]">
      <div
        class="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
        style="background:#f0f9e6;border:2px solid #93CB52"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M5 12l5 5 9-9" stroke="#93CB52" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div>
        <div class="text-[18px] font-bold text-[#474545]">Coupon scanned</div>
        <div class="text-[12px] text-[#686868]">Serial {result.serial}</div>
      </div>
    </div>

    <!-- product + progress card -->
    <div
      class="mt-5 p-[18px] rounded-xl border border-[#EAEAEA]"
      style="background:#F4F6F8"
    >
      <div
        class="text-[11px] font-bold uppercase text-[#686868] mb-[6px]"
        style="letter-spacing:0.07em"
      >Product</div>
      <div class="text-[19px] font-bold text-[#474545] mb-[18px]">{result.product_name}</div>

      <div class="flex justify-between items-baseline mb-2">
        <span class="text-[13px] font-semibold text-[#474545]">Coupons scanned</span>
        <span>
          <span class="text-[16px] font-bold text-[#2372B9]">{result.coupons_submitted}</span>
          <span class="text-[13px] font-semibold text-[#686868]"> of {result.coupons_required}</span>
        </span>
      </div>

      <div class="h-2 bg-[#EAEAEA] rounded-full overflow-hidden mb-[14px]">
        <div
          class="h-full rounded-full transition-all duration-500"
          style="width:{pct}%;background:#2372B9"
        ></div>
      </div>

      <!-- cashback strip -->
      <div
        class="flex items-center gap-[10px] px-[14px] py-3 rounded-lg"
        style="background:#e8f1fb"
      >
        <span class="text-[22px]" role="img" aria-label="money">💰</span>
        <div class="flex-1">
          <div class="text-[14px] font-bold text-[#2372B9]">₹{result.cashback_amount} cashback when complete</div>
          <div class="text-[12px] text-[#474545] mt-[1px]">{remaining} more scan{remaining !== 1 ? 's' : ''} to unlock</div>
        </div>
      </div>
    </div>
  {/if}

  <!-- actions -->
  <div class="flex flex-col gap-[10px] mt-5">
    <button
      onclick={onscanagain}
      class="w-full flex items-center justify-center gap-2 rounded-xl py-[15px] text-[15px] font-bold text-white"
      style="background:#2372B9"
    >
      <!-- QR bricks icon -->
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="#fff" stroke-width="2"/>
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="#fff" stroke-width="2"/>
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="#fff" stroke-width="2"/>
        <path d="M14 14h3v3h-3zM18 18h3v3h-3z" fill="#fff"/>
      </svg>
      Scan Another
    </button>
    <button
      onclick={onviewclaims}
      class="text-[14px] font-bold text-[#2372B9] py-2 bg-transparent border-none cursor-pointer"
    >
      View My Claims
    </button>
  </div>
</div>

<!-- live region for screen reader announcements -->
<div aria-live="polite" class="sr-only">
  {result.claim_created
    ? `Claim submitted! ₹${result.cashback_amount} cashback for ${result.product_name}.`
    : `Coupon scanned. ${result.coupons_submitted} of ${result.coupons_required} for ${result.product_name}.`}
</div>
