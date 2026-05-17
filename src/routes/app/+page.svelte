<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { slide, fly, fade } from 'svelte/transition';
  import type { PageData } from './$types';
  import QrGlyph from '$lib/components/QrGlyph.svelte';
  import ScannerView from '$lib/components/ScannerView.svelte';
  import ScanResultSheet from '$lib/components/ScanResultSheet.svelte';
  import type { ScanResultOk } from '$lib/components/ScanResultSheet.svelte';
  import ScanErrorBanner from '$lib/components/ScanErrorBanner.svelte';
  import type { ScanErrorCode } from '$lib/components/ScanErrorBanner.svelte';

  let { data }: { data: PageData } = $props();

  // ── Nav menu ──────────────────────────────────────────────
  let menuOpen = $state(false);

  // ── State machine ─────────────────────────────────────────
  type AppState =
    | { kind: 'idle' }
    | { kind: 'scanning' }
    | { kind: 'result'; payload: ScanResultOk }
    | { kind: 'error'; reason: ScanErrorCode; detail?: string };

  let appState = $state<AppState>({ kind: 'idle' });
  let submitting = $state(false);
  let productFilter = $state<'all' | 'inprogress' | 'completed'>('all');

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning,' : hour < 17 ? 'Good afternoon,' : 'Good evening,';

  // Hero label changes when in error state
  const heroLabel = $derived(
    appState.kind === 'error'
      ? { main: 'Try again', sub: "Last scan couldn't be processed" }
      : { main: 'Scan Coupon', sub: 'Tap to scan a QR sticker on the box' }
  );

  // ── QR decode → POST /app/scan ────────────────────────────
  async function handleScanResult(payload: { s: string; p: string; b: string; h: string }) {
    submitting = true;
    try {
      const res = await fetch('/app/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        appState = { kind: 'error', reason: 'network_error' };
        return;
      }

      const data = await res.json();

      switch (data.status) {
        case 'ok':
          appState = {
            kind: 'result',
            payload: {
              serial: payload.s,
              product_name: data.product_name,
              coupons_submitted: data.coupons_submitted,
              coupons_required: data.coupons_required,
              cashback_amount: data.cashback_amount,
              claim_created: data.claim_created,
              upi_id: data.upi_id
            }
          };
          break;
        case 'already_scanned':
          appState = {
            kind: 'error',
            reason: 'qr_already_scanned',
            detail: data.previous_scan_date
          };
          break;
        case 'hmac_failed':
          appState = { kind: 'error', reason: 'qr_hmac_failed' };
          break;
        case 'invalid':
        default:
          appState = { kind: 'error', reason: 'qr_invalid' };
      }
    } catch {
      appState = { kind: 'error', reason: 'network_error' };
    } finally {
      submitting = false;
    }
  }

  function openScanner() {
    appState = { kind: 'scanning' };
  }

  function closeScanner() {
    appState = { kind: 'idle' };
  }

  function handleScanError() {
    // QR decoder had an issue before even hitting the server
    appState = { kind: 'error', reason: 'qr_invalid' };
  }

  // Auto-dismiss error after 8s
  let errorTimer: ReturnType<typeof setTimeout> | null = null;
  $effect(() => {
    if (errorTimer !== null) clearTimeout(errorTimer);
    if (appState.kind === 'error') {
      errorTimer = setTimeout(() => {
        appState = { kind: 'idle' };
      }, 8000);
    }
    return () => { if (errorTimer !== null) clearTimeout(errorTimer); };
  });
</script>

<main class="min-h-screen bg-[#F4F6F8] flex flex-col font-[Montserrat]">
  <div class="max-w-lg mx-auto w-full flex flex-col flex-1 relative">

    <!-- ── Blue hero zone ───────────────────────────────────── -->
    <div
      class="bg-[#2372B9] px-5 pb-9 shrink-0 relative overflow-hidden"
      style="padding-top: 12px"
    >
      <!-- decorative faint QR brackets top-right -->
      <div class="absolute top-[50px] right-[-30px] pointer-events-none" aria-hidden="true" style="opacity:0.08">
        <QrGlyph size={220} color="#fff" />
      </div>

      <!-- greeting row -->
      <div class="flex justify-between items-center relative z-10">
        <div>
          <p class="text-[13px] leading-none mb-[2px]" style="color:rgba(255,255,255,0.75)">{greeting}</p>
          <h1 class="text-[22px] font-bold text-white leading-snug">{data.retailerName} 👋</h1>
          {#await data.productsWithStats then { cashbackEarned }}
            {#if cashbackEarned > 0}
              <p class="text-[12px] font-semibold mt-[4px]" style="color:rgba(255,255,255,0.7)">
                ₹{cashbackEarned} earned so far
              </p>
            {/if}
          {/await}
        </div>
        <button
          onclick={() => (menuOpen = true)}
          aria-label="Open navigation menu"
          class="w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0 cursor-pointer border-none"
          style="background:rgba(255,255,255,0.2);border:2px solid rgba(255,255,255,0.4)"
        >
          <span class="text-[15px] font-bold text-white">{data.initials}</span>
        </button>
      </div>

      <!-- hero scan button — whole block (circle + labels) is the tap target -->
      <button
        onclick={openScanner}
        aria-label="Scan a coupon QR code"
        class="mt-9 flex flex-col items-center gap-[18px] relative z-10 bg-transparent border-none p-0 cursor-pointer w-full"
      >
        <div class="relative w-[168px] h-[168px] flex items-center justify-center">
          <!-- outer halo -->
          <div
            class="absolute rounded-full pointer-events-none"
            style="inset:-12px;background:rgba(255,255,255,0.10)"
            aria-hidden="true"
          ></div>
          <!-- inner halo -->
          <div
            class="absolute rounded-full pointer-events-none"
            style="inset:6px;background:rgba(255,255,255,0.14)"
            aria-hidden="true"
          ></div>
          <!-- button circle -->
          <div
            class="w-[144px] h-[144px] rounded-full bg-white flex items-center justify-center"
            style="box-shadow:0 10px 32px rgba(0,0,0,0.25)"
          >
            <QrGlyph size={84} color="#2372B9" />
          </div>
        </div>

        <div class="text-center">
          <div class="text-[19px] font-bold text-white mb-1">{heroLabel.main}</div>
          <div class="text-[13px]" style="color:rgba(255,255,255,0.8)">{heroLabel.sub}</div>
        </div>
      </button>
    </div>

    <!-- ── Error banner — slides down from hero seam, 240ms ────── -->
    {#if appState.kind === 'error'}
      <div class="mx-4 relative z-10" style="margin-top:-18px" transition:slide={{ duration: 240 }}>
        <ScanErrorBanner
          reason={appState.reason}
          detail={appState.detail}
          onretry={openScanner}
          ondismiss={() => (appState = { kind: 'idle' })}
        />
      </div>
    {/if}

    <!-- ── Body ───────────────────────────────────────────────── -->
    <div class="flex-1 overflow-y-auto px-4 py-5">

      {#await data.productsWithStats}
        <!-- skeleton while loading -->
        <div class="flex flex-col gap-[10px]">
          {#each [1, 2, 3] as _}
            <div class="bg-white rounded-xl border border-[#EAEAEA] px-[14px] py-3 animate-pulse" style="box-shadow:0 1px 4px rgba(0,0,0,0.04)">
              <div class="flex justify-between items-center mb-2">
                <div class="h-[14px] bg-[#EAEAEA] rounded w-1/2"></div>
                <div class="h-[13px] bg-[#EAEAEA] rounded w-10"></div>
              </div>
              <div class="h-[6px] bg-[#EAEAEA] rounded-full mb-[6px]"></div>
              <div class="h-[11px] bg-[#EAEAEA] rounded w-2/5"></div>
            </div>
          {/each}
        </div>

      {:then { products, neverScanned }}

        {#if neverScanned}
          <!-- ── Empty / first-run state ── -->
          <div class="flex flex-col items-center pt-2">
            <div
              class="w-14 h-14 rounded-full flex items-center justify-center mb-[14px]"
              style="background:#e8f1fb"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v4M12 18v4M22 12h-4M6 12H2M19 5l-3 3M8 16l-3 3M19 19l-3-3M8 8L5 5"
                  stroke="#2372B9" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h2 class="text-[17px] font-bold text-[#474545] text-center mb-[6px]">
              Start scanning to earn cashback
            </h2>
            <p class="text-[13px] text-[#686868] text-center leading-[1.6] max-w-[280px] mb-[22px]">
              Every QR sticker counts toward a product target. Hit the target and we'll send cashback straight to your UPI.
            </p>
            <div class="w-full flex flex-col gap-[10px]">
              {#each [
                { n: '1', t: 'Find the QR sticker on the product box' },
                { n: '2', t: 'Tap Scan Coupon and point at the code' },
                { n: '3', t: 'When you hit the target, cashback is auto-claimed' }
              ] as step}
                <div class="flex items-center gap-3 px-3 py-[10px] bg-white rounded-[10px] border border-[#EAEAEA]">
                  <div
                    class="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                    style="background:#e8f1fb;color:#2372B9"
                  >{step.n}</div>
                  <span class="text-[13px] text-[#474545] leading-[1.4]">{step.t}</span>
                </div>
              {/each}
            </div>
          </div>

        {:else}
          <!-- ── Filter tabs ── -->
          {#if products.some(p => p.has_active_claim) && products.some(p => !p.has_active_claim)}
            {@const tabs = [
              { id: 'all',        label: 'All' },
              { id: 'inprogress', label: 'In Progress' },
              { id: 'completed',  label: 'Completed' },
            ]}
            <div class="flex gap-2 mb-3">
              {#each tabs as tab}
                <button
                  type="button"
                  onclick={() => (productFilter = tab.id)}
                  class="px-3 py-[5px] rounded-full text-[12px] font-bold border transition-colors cursor-pointer"
                  style={productFilter === tab.id
                    ? 'background:#2372B9;color:#fff;border-color:#2372B9'
                    : 'background:#fff;color:#686868;border-color:#EAEAEA'}
                >
                  {tab.label}
                </button>
              {/each}
            </div>
          {/if}

          <!-- ── Active progress list ── -->
          {@const filtered = productFilter === 'inprogress'
            ? products.filter(p => !p.has_active_claim)
            : productFilter === 'completed'
              ? products.filter(p => p.has_active_claim)
              : products}
          <div class="flex justify-between items-baseline mb-3">
            <h2
              class="text-[13px] font-bold text-[#474545] uppercase"
              style="letter-spacing:0.06em"
            >Active Progress</h2>
            <span class="text-[12px] font-semibold text-[#686868]">
              {filtered.length} product{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div class="flex flex-col gap-[10px]">
            {#each filtered as product}
              <div
                class="bg-white rounded-xl border border-[#EAEAEA] px-[14px] py-3"
                style="box-shadow:0 1px 4px rgba(0,0,0,0.04)"
              >
                <div class="text-[14px] font-bold text-[#474545] mb-2">{product.name}</div>

                {#if product.submitted_count > 0}
                  {@const pct = Math.min(100, Math.round((product.submitted_count / product.coupons_required) * 100))}
                  {@const remaining = product.coupons_required - product.submitted_count}
                  <div class="flex justify-between items-baseline mb-[5px]">
                    <span class="text-[11px] font-semibold text-[#686868]">{product.submitted_count}/{product.coupons_required} scanned</span>
                  </div>
                  <div class="h-[6px] bg-[#EAEAEA] rounded-full overflow-hidden mb-[6px]">
                    <div class="h-full rounded-full transition-all duration-500" style="width:{pct}%;background:#2372B9"></div>
                  </div>
                  <div class="text-[11px] text-[#686868]">
                    {remaining} more scan{remaining === 1 ? '' : 's'} to unlock ₹{product.cashback_amount} cashback
                  </div>
                {/if}

                {#if product.claim_count > 0}
                  {#if product.submitted_count > 0}
                    <div class="h-px bg-[#EAEAEA] my-[8px]"></div>
                  {/if}
                  <div class="flex items-center gap-[6px]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="#2372B9" stroke-width="2"/>
                      <path d="M12 7v5l3 3" stroke="#2372B9" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <span class="text-[11px] text-[#686868]">
                      {product.claim_count} claim{product.claim_count === 1 ? '' : 's'} processing · ₹{product.claim_total_cashback} total queued for payout
                    </span>
                  </div>
                {/if}

                {#if product.submitted_count === 0 && product.claim_count === 0}
                  <div class="text-[11px] text-[#686868]">₹{product.cashback_amount} cashback when complete</div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}

      {:catch}
        <p class="text-[13px] text-[#686868] text-center py-8">Couldn't load products. Please refresh.</p>
      {/await}

    </div>
  </div>

</main>

<!-- ── Nav sheet (replaces bottom nav) ──────────────────────── -->
{#if menuOpen}
  <div
    class="fixed inset-0 z-40"
    style="background:rgba(0,0,0,0.35)"
    onclick={() => (menuOpen = false)}
    aria-hidden="true"
    in:fade={{ duration: 150 }}
    out:fade={{ duration: 150 }}
  ></div>
  <div
    class="fixed bottom-0 left-0 right-0 z-50 bg-white max-w-lg mx-auto"
    style="border-radius:24px 24px 0 0; box-shadow:0 -8px 32px rgba(0,0,0,0.12)"
    in:fly={{ y: 240, duration: 260 }}
    out:fly={{ y: 240, duration: 200 }}
    role="dialog"
    aria-modal="true"
    aria-label="Navigation"
  >
    <div class="px-6 pt-4 pb-10">
      <!-- drag handle -->
      <div class="w-11 h-[5px] rounded-full bg-[#EAEAEA] mx-auto mb-5"></div>

      <!-- user chip — tap to go to profile -->
      <a
        href="/app/profile"
        onclick={() => (menuOpen = false)}
        class="flex items-center gap-3 pb-4 mb-2 border-b border-[#EAEAEA]"
      >
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style="background:#e8f1fb"
        >
          <span class="text-[13px] font-bold text-[#2372B9]">{data.initials}</span>
        </div>
        <span class="text-[15px] font-bold text-[#474545]">{data.retailerName}</span>
        <svg class="ml-auto shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke="#686868" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>

      <!-- nav items -->
      <nav class="flex flex-col">
        <a
          href="/app/history"
          onclick={() => (menuOpen = false)}
          class="flex items-center gap-3 py-[14px]"
        >
          <div class="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style="background:#F4F6F8">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#2372B9" stroke-width="2"/>
              <path d="M7 8h10M7 12h10M7 16h6" stroke="#2372B9" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="text-[15px] font-semibold text-[#474545]">My Claims</span>
          <svg class="ml-auto" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="#686868" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </nav>
    </div>
  </div>
{/if}

<!-- ── Scanner overlay ──────────────────────────────────────── -->
{#if appState.kind === 'scanning'}
  <ScannerView
    onclose={closeScanner}
    onresult={handleScanResult}
    onerror={handleScanError}
  />
{/if}

<!-- ── Loading spinner while POST is in-flight ──────────────── -->
{#if submitting}
  <div
    class="fixed inset-0 z-40 flex items-center justify-center"
    style="background:rgba(15,30,50,0.55)"
    aria-busy="true"
    aria-label="Processing scan"
  >
    <div
      class="w-14 h-14 rounded-full border-4 border-white animate-spin"
      style="border-top-color:transparent"
    ></div>
  </div>
{/if}

<!-- ── Result sheet ──────────────────────────────────────────── -->
{#if appState.kind === 'result'}
  <ScanResultSheet
    result={appState.payload}
    onscanagain={() => { invalidateAll(); openScanner(); }}
    onviewclaims={() => goto('/app/history')}
  />
{/if}
