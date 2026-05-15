<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import type { PageData, ActionData } from './$types';
  import BottomNav from '$lib/components/BottomNav.svelte';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  const r = $derived(data.retailer);

  const initials = $derived(
    (r.name ?? '?')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w: string) => w[0].toUpperCase())
      .join('')
  );

  let editing = $state(false);
  let saving  = $state(false);

  // Form field state — initialised from DB, stays in sync while editing
  let name   = $state(r.name   ?? '');
  let city   = $state(r.city   ?? '');
  let state_ = $state(r.state  ?? '');

  // UPI OTP flow state
  let upiOtpStep: 'locked' | 'otp' = $state(
    (form as any)?.upiOtpSent ? 'otp' : 'locked'
  );
  let upiDigits = $state<string[]>(['', '', '', '', '', '']);
  let upiBoxes: HTMLInputElement[] = [];
  let upiCodeInputEl = $state<HTMLInputElement | undefined>(undefined);
  let verifyUpiFormEl = $state<HTMLFormElement | undefined>(undefined);
  let newUpiId = $state('');
  let upiVerifying = $state(false);
  let upiHasError = $state(!!(form as any)?.upiError);
  let sendingUpiOtp = $state(false);
  let upiResendCountdown = $state(0);

  function startUpiResendTimer() {
    upiResendCountdown = 30;
    const t = setInterval(() => {
      upiResendCountdown--;
      if (upiResendCountdown <= 0) clearInterval(t);
    }, 1000);
  }

  function onUpiDigitInput(e: Event, i: number) {
    const input = e.target as HTMLInputElement;
    const v = input.value.replace(/\D/g, '').slice(-1);
    upiDigits[i] = v;
    input.value = v;
    upiHasError = false;
    if (v && i < 5) upiBoxes[i + 1]?.focus();
    if (upiDigits.every(d => d.length === 1)) {
      if (upiCodeInputEl) upiCodeInputEl.value = upiDigits.join('');
      upiVerifying = true;
      verifyUpiFormEl?.requestSubmit();
    }
  }

  function onUpiDigitKeydown(e: KeyboardEvent, i: number) {
    if (e.key === 'Backspace') {
      if (upiDigits[i]) {
        upiDigits[i] = '';
        (e.target as HTMLInputElement).value = '';
      } else if (i > 0) {
        upiDigits[i - 1] = '';
        upiBoxes[i - 1].value = '';
        upiBoxes[i - 1]?.focus();
      }
    }
  }

  function onUpiDigitPaste(e: ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? '';
    for (let j = 0; j < 6; j++) upiDigits[j] = text[j] ?? '';
    for (let j = 0; j < 6; j++) { if (upiBoxes[j]) upiBoxes[j].value = upiDigits[j]; }
    upiBoxes[Math.min(text.length, 5)]?.focus();
    if (text.length === 6 && upiCodeInputEl) {
      upiCodeInputEl.value = text;
      upiVerifying = true;
      verifyUpiFormEl?.requestSubmit();
    }
  }

  function cancelUpiChange() {
    upiOtpStep = 'locked';
    upiDigits = ['', '', '', '', '', ''];
    newUpiId = '';
    upiHasError = false;
    upiVerifying = false;
  }

  function startEdit() {
    name   = r.name   ?? '';
    city   = r.city   ?? '';
    state_ = r.state  ?? '';
    cancelUpiChange();
    editing = true;
  }

  function cancelEdit() {
    editing = false;
    saving  = false;
    cancelUpiChange();
  }
</script>

<main class="min-h-screen bg-[#F4F6F8] flex flex-col font-[Montserrat]">
  <div class="max-w-lg mx-auto w-full flex flex-col flex-1 pb-[72px]">

    <!-- Header -->
    <div class="bg-[#2372B9] px-5 pt-3 pb-6 shrink-0">
      <div class="flex items-center gap-4">
        <div
          class="w-[56px] h-[56px] rounded-full flex items-center justify-center shrink-0"
          style="background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.4)"
        >
          <span class="text-[20px] font-bold text-white">{initials}</span>
        </div>
        <div>
          <h1 class="text-[20px] font-bold text-white leading-snug">{r.name ?? 'My Profile'}</h1>
          <p class="text-[13px]" style="color: rgba(255,255,255,0.75)">+91 {r.mobile}</p>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-5">

      {#if (form as any)?.error}
        <div class="bg-[#fde8e8] text-[#9b2626] rounded-xl p-3 text-[13px] mb-4 border border-[#E53E3E]">
          {(form as any).error}
        </div>
      {/if}
      {#if (form as any)?.success}
        <div class="bg-[#f0f9e6] text-[#3d6e10] rounded-xl p-3 text-[13px] mb-4 border border-[#93CB52]">
          Profile updated successfully!
        </div>
      {/if}

      <!-- Profile card -->
      <div class="bg-white rounded-xl border border-[#EAEAEA] p-5 mb-4" style="box-shadow: 0 2px 8px rgba(0,0,0,0.04)">

        {#if !editing}
          <!-- View mode -->
          <div class="flex items-center justify-between mb-4">
            <p class="text-[14px] font-semibold text-[#474545]">Profile Details</p>
            <button
              type="button"
              onclick={startEdit}
              class="flex items-center gap-1.5 text-[13px] font-semibold text-[#2372B9]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#2372B9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#2372B9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Edit
            </button>
          </div>

          <div class="flex flex-col gap-4">
            <div>
              <p class="text-[11px] font-semibold text-[#686868] uppercase mb-1" style="letter-spacing:0.05em">Mobile</p>
              <p class="text-[14px] text-[#474545]">+91 {r.mobile}</p>
            </div>
            <div class="h-px bg-[#EAEAEA]"></div>
            <div>
              <p class="text-[11px] font-semibold text-[#686868] uppercase mb-1" style="letter-spacing:0.05em">Full Name</p>
              <p class="text-[15px] font-semibold text-[#474545]">{r.name ?? '—'}</p>
            </div>
            <div class="h-px bg-[#EAEAEA]"></div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-[11px] font-semibold text-[#686868] uppercase mb-1" style="letter-spacing:0.05em">City</p>
                <p class="text-[14px] text-[#474545]">{r.city ?? '—'}</p>
              </div>
              <div>
                <p class="text-[11px] font-semibold text-[#686868] uppercase mb-1" style="letter-spacing:0.05em">State</p>
                <p class="text-[14px] text-[#474545]">{r.state ?? '—'}</p>
              </div>
            </div>
            <div class="h-px bg-[#EAEAEA]"></div>
            <div>
              <p class="text-[11px] font-semibold text-[#686868] uppercase mb-1" style="letter-spacing:0.05em">UPI ID</p>
              <p class="text-[14px] text-[#474545]">{r.upi_id ?? '—'}</p>
            </div>
          </div>

        {:else}
          <!-- Edit mode -->
          <div class="flex items-center justify-between mb-4">
            <p class="text-[14px] font-semibold text-[#474545]">Edit Profile</p>
            <button type="button" onclick={cancelEdit} class="text-[13px] text-[#686868]">Cancel</button>
          </div>

          <!-- Name / City / State form -->
          <form
            method="post"
            action="?/updateProfile"
            use:enhance={() => {
              saving = true;
              return async ({ result, update }) => {
                saving = false;
                if (result.type === 'success') editing = false;
                await update();
              };
            }}
            class="flex flex-col gap-4"
          >
            <!-- Mobile (read-only) -->
            <div>
              <label class="block text-[11px] font-semibold text-[#686868] uppercase mb-1" style="letter-spacing:0.05em" for="mobile-display">
                Mobile (cannot change)
              </label>
              <div id="mobile-display" class="h-[48px] rounded-lg border-2 border-[#EAEAEA] bg-[#F4F6F8] px-4 flex items-center text-[14px] text-[#686868]">
                +91 {r.mobile}
              </div>
            </div>

            <!-- Name -->
            <div>
              <label class="block text-[11px] font-semibold text-[#686868] uppercase mb-1" style="letter-spacing:0.05em" for="name">Full Name</label>
              <input
                id="name" name="name" type="text"
                bind:value={name}
                placeholder="Store owner name"
                class="w-full h-[48px] rounded-lg border-2 border-[#EAEAEA] px-4 text-[15px] text-[#474545] bg-white focus:outline-none focus:border-[#2372B9] transition-colors placeholder:text-[#EAEAEA]"
                required
              />
            </div>

            <!-- City + State -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-semibold text-[#686868] uppercase mb-1" style="letter-spacing:0.05em" for="city">City</label>
                <input
                  id="city" name="city" type="text"
                  bind:value={city}
                  placeholder="Mumbai"
                  class="w-full h-[48px] rounded-lg border-2 border-[#EAEAEA] px-4 text-[15px] text-[#474545] bg-white focus:outline-none focus:border-[#2372B9] transition-colors placeholder:text-[#EAEAEA]"
                  required
                />
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-[#686868] uppercase mb-1" style="letter-spacing:0.05em" for="state">State</label>
                <input
                  id="state" name="state" type="text"
                  bind:value={state_}
                  placeholder="Maharashtra"
                  class="w-full h-[48px] rounded-lg border-2 border-[#EAEAEA] px-4 text-[15px] text-[#474545] bg-white focus:outline-none focus:border-[#2372B9] transition-colors placeholder:text-[#EAEAEA]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              class="w-full py-3.5 rounded-lg bg-[#2372B9] text-white text-[15px] font-bold disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>

          <!-- UPI ID — separate section, OTP-protected, outside the profile form -->
          <div class="mt-4 pt-4 border-t border-[#EAEAEA]">
            <p class="text-[11px] font-semibold text-[#686868] uppercase mb-2" style="letter-spacing:0.05em">UPI ID</p>

            {#if upiOtpStep === 'locked'}
              <div class="h-[48px] rounded-lg border-2 border-[#EAEAEA] bg-[#F4F6F8] px-4 flex items-center justify-between">
                <span class="text-[14px] text-[#686868]">{r.upi_id ?? '—'}</span>
                <form
                  method="post"
                  action="?/sendUpiOtp"
                  use:enhance={() => {
                    sendingUpiOtp = true;
                    return async ({ result, update }) => {
                      sendingUpiOtp = false;
                      if (result.type === 'success' && (result.data as any)?.upiOtpSent) {
                        upiOtpStep = 'otp';
                        upiHasError = false;
                        startUpiResendTimer();
                      } else {
                        await update();
                      }
                    };
                  }}
                >
                  <button
                    type="submit"
                    disabled={sendingUpiOtp}
                    class="text-[12px] font-semibold text-[#2372B9] disabled:opacity-50 shrink-0 ml-2"
                  >
                    {sendingUpiOtp ? 'Sending…' : 'Change UPI ID'}
                  </button>
                </form>
              </div>
              <p class="text-[11px] text-[#686868] mt-1">For your security, we'll send an OTP to your number before updating your UPI ID.</p>

            {:else}
              <!-- OTP step for UPI change -->
              <div class="rounded-lg border-2 border-[#2372B9] bg-[#f7faff] p-4 flex flex-col gap-3" style="box-shadow: 0 0 0 3px #e8f1fb">
                <div class="flex items-center justify-between">
                  <p class="text-[13px] font-semibold text-[#474545]">Verify to change UPI ID</p>
                  <button type="button" onclick={cancelUpiChange} class="text-[12px] text-[#686868]">Cancel</button>
                </div>

                <form
                  method="post"
                  action="?/verifyUpiOtp"
                  bind:this={verifyUpiFormEl}
                  use:enhance={() => {
                    upiVerifying = true;
                    return async ({ result, update }) => {
                      if (result.type === 'failure') {
                        upiVerifying = false;
                        upiHasError = true;
                        upiDigits = ['', '', '', '', '', ''];
                        upiBoxes.forEach(b => { if (b) b.value = ''; });
                        upiBoxes[0]?.focus();
                      } else if (result.type === 'success') {
                        editing = false;
                        cancelUpiChange();
                        await invalidateAll();
                      } else {
                        await update();
                      }
                    };
                  }}
                  class="flex flex-col gap-3"
                >
                  <!-- New UPI ID input -->
                  <div>
                    <label class="block text-[11px] font-semibold text-[#686868] uppercase mb-1" style="letter-spacing:0.05em" for="new_upi_id">New UPI ID</label>
                    <input
                      id="new_upi_id" name="upi_id" type="text"
                      bind:value={newUpiId}
                      placeholder="handle@bank"
                      class="w-full h-[44px] rounded-lg border-2 border-[#EAEAEA] px-4 text-[14px] text-[#474545] bg-white focus:outline-none focus:border-[#2372B9] transition-colors placeholder:text-[#EAEAEA]"
                      required
                    />
                  </div>

                  <!-- OTP boxes -->
                  <div>
                    <p class="text-[11px] font-semibold text-[#686868] uppercase mb-2" style="letter-spacing:0.05em">OTP sent to +91 {r.mobile}</p>
                    <div class="flex justify-center gap-[8px]">
                      {#each upiDigits as digit, i}
                        <input
                          bind:this={upiBoxes[i]}
                          type="tel"
                          inputmode="numeric"
                          maxlength="1"
                          value={digit}
                          oninput={(e) => onUpiDigitInput(e, i)}
                          onkeydown={(e) => onUpiDigitKeydown(e, i)}
                          onpaste={i === 0 ? onUpiDigitPaste : undefined}
                          disabled={upiVerifying}
                          class="w-[40px] h-[48px] shrink-0 border-2 rounded-[10px] text-center text-[20px] font-bold text-[#474545] focus:outline-none transition-colors disabled:opacity-50"
                          style="
                            border-color: {upiHasError ? '#E53E3E' : digit ? '#2372B9' : '#EAEAEA'};
                            background: {upiHasError ? '#fde8e8' : digit ? '#e8f1fb' : '#fff'};
                          "
                        />
                      {/each}
                    </div>
                    {#if (form as any)?.upiError}
                      <p class="text-[12px] text-[#E53E3E] mt-2 text-center">{(form as any).upiError}</p>
                    {/if}
                  </div>

                  <input type="hidden" name="code" bind:this={upiCodeInputEl} />

                  <button
                    type="submit"
                    disabled={upiVerifying || upiDigits.some(d => !d) || !newUpiId}
                    class="w-full py-3 rounded-lg bg-[#2372B9] text-white text-[14px] font-bold disabled:opacity-50"
                  >
                    {upiVerifying ? 'Verifying…' : 'Verify & Save UPI ID'}
                  </button>
                </form>

                <!-- Resend OTP -->
                <div class="flex justify-center">
                  {#if upiResendCountdown > 0}
                    <span class="text-[12px] text-[#686868]">
                      Resend in <strong class="text-[#24AEB1]">0:{String(upiResendCountdown).padStart(2, '0')}</strong>
                    </span>
                  {:else}
                    <form
                      method="post"
                      action="?/sendUpiOtp"
                      use:enhance={() => ({ result }) => {
                        if (result.type === 'success') {
                          upiDigits = ['', '', '', '', '', ''];
                          upiBoxes.forEach(b => { if (b) b.value = ''; });
                          upiBoxes[0]?.focus();
                          startUpiResendTimer();
                        }
                      }}
                    >
                      <button type="submit" class="text-[12px] font-semibold text-[#2372B9] underline underline-offset-2">
                        Resend OTP
                      </button>
                    </form>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Sign out -->
      <div class="text-center mt-2">
        <a
          href="/app/logout"
          class="inline-flex items-center gap-2 text-[14px] font-semibold text-[#E53E3E]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="#E53E3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Sign out
        </a>
      </div>

    </div>
  </div>

  <BottomNav active="profile" />
</main>
