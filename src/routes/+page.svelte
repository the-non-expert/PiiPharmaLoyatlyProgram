<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();

  let step: 'mobile' | 'otp' = $state((form as any)?.otpSent ? 'otp' : 'mobile');
  let mobile = $state((form as any)?.mobile ?? '');
  let resendCountdown = $state(0);
  let verifying = $state(false);
  let hasError = $state(!!(form as any)?.error);

  // 6-box OTP state
  let digits = $state<string[]>(['', '', '', '', '', '']);
  let boxes: HTMLInputElement[] = [];
  let codeInputEl = $state<HTMLInputElement | undefined>(undefined);

  let sendOtpFormEl: HTMLFormElement | undefined = $state();
  let verifyFormEl: HTMLFormElement | undefined = $state();

  const displayMobile = $derived(
    mobile.length === 10
      ? `+91 ${mobile.slice(0, 2)}${'*'.repeat(5)}${mobile.slice(7)}`
      : `+91 ${mobile}`
  );

  function startResendTimer() {
    resendCountdown = 30;
    const t = setInterval(() => {
      resendCountdown--;
      if (resendCountdown <= 0) clearInterval(t);
    }, 1000);
  }

  function handleMobileInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const v = input.value.replace(/\D/g, '').slice(0, 10);
    input.value = v;
    mobile = v;
    hasError = false;
    if (v.length === 10) sendOtpFormEl?.requestSubmit();
  }

  function onDigitInput(e: Event, i: number) {
    const input = e.target as HTMLInputElement;
    const v = input.value.replace(/\D/g, '').slice(-1);
    digits[i] = v;
    input.value = v;
    hasError = false;
    if (v && i < 5) boxes[i + 1]?.focus();
    if (digits.every(d => d.length === 1)) {
      if (codeInputEl) codeInputEl.value = digits.join('');
      verifying = true;
      verifyFormEl?.requestSubmit();
    }
  }

  function onDigitKeydown(e: KeyboardEvent, i: number) {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        digits[i] = '';
        (e.target as HTMLInputElement).value = '';
      } else if (i > 0) {
        digits[i - 1] = '';
        boxes[i - 1].value = '';
        boxes[i - 1]?.focus();
      }
    }
  }

  function onDigitPaste(e: ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? '';
    for (let j = 0; j < 6; j++) digits[j] = text[j] ?? '';
    for (let j = 0; j < 6; j++) { if (boxes[j]) boxes[j].value = digits[j]; }
    boxes[Math.min(text.length, 5)]?.focus();
    if (text.length === 6) {
      if (codeInputEl) codeInputEl.value = text;
      verifying = true;
      verifyFormEl?.requestSubmit();
    }
  }

  function goBack() {
    step = 'mobile';
    verifying = false;
    hasError = false;
    digits = ['', '', '', '', '', ''];
  }
</script>

<main class="min-h-screen bg-white flex flex-col font-[Montserrat]">
  <div class="flex-1 max-w-sm mx-auto w-full flex flex-col">

    {#if step === 'mobile'}
    <!-- ── MOBILE NUMBER STEP (Screen 1) ── -->
    <div class="flex-1 flex flex-col px-7 pb-10">

      <!-- Logo block -->
      <div class="pt-9 pb-8 flex flex-col items-center">
        <div
          class="w-[72px] h-[72px] bg-[#2372B9] rounded-[18px] flex items-center justify-center mb-4"
          style="box-shadow: 0 8px 24px #e8f1fb"
        >
          <span class="text-[32px] font-black text-white leading-none" style="letter-spacing:-1px">Pii</span>
        </div>
        <div class="text-[13px] font-semibold text-[#686868] uppercase" style="letter-spacing:0.06em">PiiPharma Loyalty</div>
      </div>

      <!-- Headline -->
      <div class="mb-9">
        <h1 class="text-[26px] font-bold text-[#474545] leading-snug mb-2">Welcome,<br>Retailer Partner 🙏</h1>
        <p class="text-[14px] text-[#686868] leading-relaxed">Login to submit coupons and claim your cashback.</p>
      </div>

      <!-- Form -->
      <form
        method="POST"
        action="?/sendOtp"
        bind:this={sendOtpFormEl}
        class="flex flex-col flex-1"
        use:enhance={() => ({ result }) => {
          if (result.type === 'success' && (result.data as any)?.otpSent) {
            step = 'otp';
            hasError = false;
            startResendTimer();
          } else if (result.type === 'failure') {
            hasError = true;
          }
        }}
      >
        <!-- Phone input -->
        <div>
          <label class="block text-[13px] font-semibold text-[#474545] mb-1.5" for="mobile">Mobile Number</label>
          <div
            class="flex h-[54px] rounded-lg overflow-hidden border-2 transition-all"
            style="border-color: {hasError ? '#E53E3E' : mobile.length === 10 ? '#2372B9' : '#EAEAEA'}; {mobile.length === 10 && !hasError ? 'box-shadow: 0 0 0 3px #e8f1fb' : ''}"
          >
            <span class="flex items-center px-4 text-[16px] font-bold text-[#2372B9] bg-[#F4F6F8] border-r border-[#EAEAEA] shrink-0">+91</span>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              inputmode="numeric"
              maxlength="10"
              value={mobile}
              oninput={handleMobileInput}
              placeholder="98765 43210"
              class="flex-1 px-4 text-[16px] text-[#474545] bg-white focus:outline-none placeholder:text-[#EAEAEA] placeholder:font-normal placeholder:text-base"
              required
            />
          </div>
          {#if (form as any)?.error && !((form as any)?.otpSent)}
            <p class="text-[12px] text-[#E53E3E] mt-1.5">{(form as any).error}</p>
          {/if}
        </div>

        <div class="flex-1 min-h-8"></div>

        <!-- Send OTP button -->
        <button
          type="submit"
          disabled={mobile.length !== 10}
          class="w-full py-4 rounded-lg text-white text-[17px] font-bold transition-colors mb-4"
          style="background: {mobile.length === 10 ? '#2372B9' : '#b8cfe8'}; cursor: {mobile.length === 10 ? 'pointer' : 'not-allowed'}"
        >
          Send OTP
        </button>

        <!-- WhatsApp note -->
        <div class="flex items-center justify-center gap-[7px]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.977-1.402A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" fill="#25D366"/>
            <path d="M8.5 9.5c.2-.5.4-.5.6-.5.16 0 .32 0 .46.01.18.01.36.1.54.5l.7 1.7c.1.24.05.52-.14.7l-.48.48c-.1.1-.12.25-.05.36.4.65 1.04 1.3 1.7 1.7.1.06.26.04.36-.05l.48-.48c.18-.19.46-.24.7-.14l1.7.7c.4.18.49.36.5.54.01.14.01.3.01.46 0 .2 0 .4-.5.6-.5.2-2 .8-3.5-.7S7.7 11 8.5 9.5z" fill="#fff"/>
          </svg>
          <span class="text-[13px] text-[#686868]">OTP will be sent via WhatsApp</span>
        </div>
      </form>
    </div>

    {:else}
    <!-- ── OTP STEP (Screen 2) ── -->

    <!-- Back arrow -->
    <div class="px-5 pt-2">
      <button
        type="button"
        onclick={goBack}
        class="w-10 h-10 flex items-center justify-center rounded-full bg-[#F4F6F8]"
        aria-label="Go back"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="#474545" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <div class="flex-1 flex flex-col px-7 pb-10">
      <h1 class="text-[28px] font-bold text-[#474545] mb-2">Enter OTP</h1>
      <p class="text-[14px] text-[#686868] leading-relaxed mb-9">
        We sent a 6-digit code to<br>
        <span class="font-bold text-[#474545]">{displayMobile}</span> via WhatsApp
      </p>

      <!-- Verify form -->
      <form
        method="POST"
        action="?/verifyOtp"
        bind:this={verifyFormEl}
        use:enhance={() => {
          verifying = true;
          return async ({ result, update }) => {
            if (result.type === 'failure') {
              verifying = false;
              hasError = true;
              digits = ['', '', '', '', '', ''];
              boxes.forEach(b => { if (b) b.value = ''; });
              boxes[0]?.focus();
            } else {
              await update();
            }
          };
        }}
      >
        <input type="hidden" name="mobile" value={mobile} />
        <input type="hidden" name="code" bind:this={codeInputEl} />

        <!-- 6 OTP boxes -->
        <div class="flex justify-center gap-[8px] mb-8">
          {#each digits as digit, i}
            <input
              bind:this={boxes[i]}
              type="tel"
              inputmode="numeric"
              maxlength="1"
              value={digit}
              oninput={(e) => onDigitInput(e, i)}
              onkeydown={(e) => onDigitKeydown(e, i)}
              onpaste={i === 0 ? onDigitPaste : undefined}
              disabled={verifying}
              class="w-[44px] h-[52px] shrink-0 border-2 rounded-[10px] text-center text-[22px] font-bold text-[#474545] focus:outline-none transition-colors disabled:opacity-50"
              style="
                border-color: {hasError ? '#E53E3E' : digit ? '#2372B9' : '#EAEAEA'};
                background: {hasError ? '#fde8e8' : digit ? '#e8f1fb' : '#fff'};
              "
            />
          {/each}
        </div>
      </form>

      <!-- Timer + Resend -->
      <div class="flex flex-col items-center gap-3 mb-auto">
        {#if resendCountdown > 0}
          <div class="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#24AEB1" stroke-width="2"/>
              <path d="M12 7v5l3 3" stroke="#24AEB1" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="text-[14px] text-[#686868]">
              Resend in <strong class="text-[#24AEB1]">0:{String(resendCountdown).padStart(2, '0')}</strong>
            </span>
          </div>
          <span class="text-[14px] text-[#EAEAEA] font-semibold cursor-not-allowed">Resend OTP</span>
        {:else}
          <form
            method="POST"
            action="?/sendOtp"
            use:enhance={() => ({ result }) => {
              if (result.type === 'success') {
                digits = ['', '', '', '', '', ''];
                boxes.forEach(b => { if (b) b.value = ''; });
                boxes[0]?.focus();
                startResendTimer();
              }
            }}
          >
            <input type="hidden" name="mobile" value={mobile} />
            <button type="submit" class="text-[14px] font-semibold text-[#2372B9] underline underline-offset-2">
              Resend OTP
            </button>
          </form>
        {/if}
      </div>

      <div class="flex-1"></div>

      <!-- Info box -->
      <div class="p-4 bg-[#F4F6F8] rounded-[10px] border border-[#EAEAEA]">
        <p class="text-[13px] text-[#686868] text-center leading-relaxed">
          OTP is valid for <strong class="text-[#474545]">5 minutes</strong>. Do not share it with anyone.
        </p>
      </div>
    </div>
    {/if}

  </div>
</main>
