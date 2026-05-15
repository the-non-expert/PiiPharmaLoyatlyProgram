<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import jsQR from 'jsqr';

  let {
    onclose,
    onresult,
    onerror
  }: {
    onclose: () => void;
    onresult: (payload: { s: string; p: string; h: string }) => void;
    onerror: (msg: string) => void;
  } = $props();

  let videoEl = $state<HTMLVideoElement | null>(null);
  let canvasEl = $state<HTMLCanvasElement | null>(null);
  let torchOn = $state(false);
  let permissionDenied = $state(false);
  let stream = $state<MediaStream | null>(null);
  let rafId: number | null = null;
  let scanLineY = $state(0);
  let scanLineDir = $state(1);
  let scanLineRaf: number | null = null;
  let decoded = false; // guard against double-fire

  async function startCamera() {
    decoded = false;
    permissionDenied = false;
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });
      stream = s;
      if (videoEl) {
        videoEl.srcObject = s;
        await videoEl.play();
        scheduleDecode();
      }
    } catch {
      permissionDenied = true;
    }
  }

  function stopCamera() {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    if (scanLineRaf !== null) { cancelAnimationFrame(scanLineRaf); scanLineRaf = null; }
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
  }

  function scheduleDecode() {
    let last = 0;
    function tick(now: number) {
      if (now - last >= 100) { // ~10fps
        last = now;
        tryDecode();
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
  }

  function tryDecode() {
    if (decoded || !videoEl || !canvasEl || videoEl.readyState < 2) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    const w = videoEl.videoWidth;
    const h = videoEl.videoHeight;
    if (!w || !h) return;

    canvasEl.width = w;
    canvasEl.height = h;
    ctx.drawImage(videoEl, 0, 0, w, h);

    const imageData = ctx.getImageData(0, 0, w, h);
    const code = jsQR(imageData.data, w, h, { inversionAttempts: 'dontInvert' });
    if (!code) return;

    let payload: { s?: string; p?: string; h?: string } = {};
    try {
      payload = JSON.parse(code.data);
    } catch {
      onerror('qr_invalid');
      return;
    }

    if (!payload.s || !payload.p) {
      onerror('qr_invalid');
      return;
    }

    decoded = true;
    stopCamera();
    if (typeof navigator.vibrate === 'function') navigator.vibrate(40);
    onresult({ s: payload.s, p: payload.p, h: payload.h ?? '' });
  }

  function animateScanLine() {
    const RANGE = 220; // viewfinder height minus padding
    function step() {
      scanLineY += scanLineDir * 1.5;
      if (scanLineY >= RANGE) { scanLineY = RANGE; scanLineDir = -1; }
      if (scanLineY <= 0) { scanLineY = 0; scanLineDir = 1; }
      scanLineRaf = requestAnimationFrame(step);
    }
    scanLineRaf = requestAnimationFrame(step);
  }

  async function toggleTorch() {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    torchOn = !torchOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: torchOn } as MediaTrackConstraintSet] });
    } catch {
      torchOn = !torchOn; // revert if not supported
    }
  }

  onMount(() => {
    startCamera();
    animateScanLine();
  });

  onDestroy(() => {
    stopCamera();
  });
</script>

<div
  class="fixed inset-0 z-50 flex flex-col font-[Montserrat]"
  style="background:#0a0a0a"
  role="dialog"
  aria-modal="true"
  aria-label="QR code scanner"
>
  <!-- camera feed -->
  <!-- svelte-ignore a11y_media_has_caption -->
  <video
    bind:this={videoEl}
    class="absolute inset-0 w-full h-full object-cover"
    playsinline
    muted
    aria-hidden="true"
  ></video>
  <!-- hidden decode canvas -->
  <canvas bind:this={canvasEl} class="hidden" aria-hidden="true"></canvas>

  <!-- vignette -->
  <div
    class="absolute inset-0 pointer-events-none"
    style="background:radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%)"
    aria-hidden="true"
  ></div>

  {#if permissionDenied}
    <!-- permission denied state -->
    <div class="relative z-10 flex flex-col items-center justify-center flex-1 px-8 text-center gap-4">
      <div
        class="w-16 h-16 rounded-full flex items-center justify-center"
        style="background:rgba(255,255,255,0.12)"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M1 1l22 22M7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16M9.5 4H15l2 2h3" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <h2 class="text-[17px] font-bold text-white">Camera access needed</h2>
      <p class="text-[13px] leading-[1.5]" style="color:rgba(255,255,255,0.75)">
        Allow camera access to scan QR codes. You may need to update this in your device settings.
      </p>
      <button
        onclick={startCamera}
        class="mt-2 px-6 py-3 rounded-xl text-[14px] font-bold text-[#2372B9] bg-white"
      >
        Grant access
      </button>
      <button
        onclick={onclose}
        class="text-[13px] font-semibold bg-transparent border-none cursor-pointer"
        style="color:rgba(255,255,255,0.6)"
      >
        Cancel
      </button>
    </div>
  {:else}
    <!-- top bar -->
    <div class="relative z-10 flex items-center justify-between px-4 pt-4 shrink-0">
      <button
        onclick={onclose}
        class="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
        style="background:rgba(0,0,0,0.55);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.15)"
        aria-label="Close scanner"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
      </button>
      <div
        class="text-[15px] font-bold text-white"
        style="text-shadow:0 1px 4px rgba(0,0,0,0.6)"
      >Scan Coupon</div>
      <div class="w-10" aria-hidden="true"></div>
    </div>

    <!-- viewfinder -->
    <div class="relative z-10 flex-1 flex flex-col items-center justify-center gap-7 px-6">
      <!-- dim mask with cutout -->
      <div
        class="absolute inset-0 pointer-events-none"
        style="background:rgba(0,0,0,0.55);-webkit-mask-image:radial-gradient(circle at center, transparent 142px, #000 142px);mask-image:radial-gradient(circle at center, transparent 142px, #000 142px)"
        aria-hidden="true"
      ></div>

      <!-- reticle -->
      <div class="relative w-[260px] h-[260px]" aria-hidden="true">
        <!-- corner brackets -->
        <div class="absolute top-0 left-0 w-8 h-8" style="border-top:4px solid #fff;border-left:4px solid #fff;border-radius:14px 0 0 0"></div>
        <div class="absolute top-0 right-0 w-8 h-8" style="border-top:4px solid #fff;border-right:4px solid #fff;border-radius:0 14px 0 0"></div>
        <div class="absolute bottom-0 left-0 w-8 h-8" style="border-bottom:4px solid #fff;border-left:4px solid #fff;border-radius:0 0 0 14px"></div>
        <div class="absolute bottom-0 right-0 w-8 h-8" style="border-bottom:4px solid #fff;border-right:4px solid #fff;border-radius:0 0 14px 0"></div>

        <!-- animated scan line -->
        <div
          class="absolute left-[10px] right-[10px] h-[2px]"
          style="top:{scanLineY}px;background:linear-gradient(90deg,transparent,#2372B9,transparent);box-shadow:0 0 12px #2372B9;opacity:0.95"
        ></div>
      </div>

      <div class="text-center max-w-[280px]">
        <div
          class="text-[17px] font-bold text-white mb-[6px]"
          style="text-shadow:0 1px 4px rgba(0,0,0,0.5)"
        >Point at the QR code</div>
        <div class="text-[13px] leading-[1.5]" style="color:rgba(255,255,255,0.75)">
          Centre the sticker on the product box inside the frame
        </div>
      </div>
    </div>

    <!-- torch toggle -->
    <div class="relative z-10 flex justify-center pb-10 shrink-0">
      <button
        onclick={toggleTorch}
        class="flex items-center gap-2 rounded-full cursor-pointer"
        style="padding:12px 20px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);backdrop-filter:blur(8px)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M9 2h6l-1 7h3l-7 13 1-9H7l2-11z" stroke="#fff" stroke-width="1.8" stroke-linejoin="round" fill="none"/>
        </svg>
        <span class="text-[13px] font-semibold text-white">
          Torch {torchOn ? 'on' : 'off'}
        </span>
      </button>
    </div>
  {/if}
</div>
