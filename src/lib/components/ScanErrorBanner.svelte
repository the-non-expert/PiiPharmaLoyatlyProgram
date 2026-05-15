<script lang="ts">
  import type { Snippet } from 'svelte';

  export type ScanErrorCode = 'qr_already_scanned' | 'qr_invalid' | 'qr_hmac_failed' | 'network_error';

  let {
    reason,
    detail,
    onretry,
    ondismiss
  }: {
    reason: ScanErrorCode;
    detail?: string;
    onretry: () => void;
    ondismiss: () => void;
  } = $props();

  const COPY: Record<ScanErrorCode, { title: string; body: (detail?: string) => string }> = {
    qr_already_scanned: {
      title: 'QR already scanned',
      body: (d) => `This coupon was scanned on ${d ?? 'a previous date'}. Each QR can only be used once.`
    },
    qr_invalid: {
      title: 'Invalid QR code',
      body: () => "We couldn't read this code. Please try again, or contact support if the issue persists."
    },
    qr_hmac_failed: {
      title: "Couldn't verify this code",
      body: () => 'This sticker may be damaged or counterfeit. Please contact support.'
    },
    network_error: {
      title: 'Connection problem',
      body: () => "Couldn't reach our servers. Check your connection and try again."
    }
  };

  const copy = $derived(COPY[reason] ?? COPY.qr_invalid);

  const SUPPORT_WHATSAPP = 'https://wa.me/919999999999';
</script>

<div
  class="bg-white rounded-xl px-[14px] py-[14px] flex items-start gap-3"
  style="border: 1.5px solid #E53E3E; box-shadow: 0 8px 24px rgba(229,62,62,0.18)"
  role="alert"
>
  <!-- icon -->
  <div
    class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
    style="background: #fde8e8"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 8v5M12 17h.01" stroke="#E53E3E" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="12" cy="12" r="9" stroke="#E53E3E" stroke-width="2"/>
    </svg>
  </div>

  <!-- text -->
  <div class="flex-1 min-w-0">
    <div class="text-[14px] font-bold text-[#474545] mb-[2px]">{copy.title}</div>
    <div class="text-[12.5px] text-[#686868] leading-[1.5]">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html copy.body(detail).replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#474545]">$1</strong>')}
    </div>
    <div class="flex gap-[14px] mt-2">
      <button
        onclick={onretry}
        class="text-[12.5px] font-bold text-[#2372B9] bg-transparent border-none p-0 cursor-pointer"
      >
        Try another QR
      </button>
      <a
        href={SUPPORT_WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        class="text-[12.5px] font-bold text-[#686868]"
      >
        Contact support
      </a>
    </div>
  </div>

  <!-- dismiss — small icon with 24×24 tap target -->
  <button
    onclick={ondismiss}
    class="p-[5px] -mt-[2px] -mr-[2px] cursor-pointer bg-transparent border-none"
    aria-label="Dismiss error"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="#686868" stroke-width="2.2" stroke-linecap="round"/>
    </svg>
  </button>
</div>
