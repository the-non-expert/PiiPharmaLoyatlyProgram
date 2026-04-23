<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let showPassword = $state(false);

	function focusInput(e: FocusEvent) {
		const el = e.currentTarget as HTMLInputElement;
		el.style.borderColor = '#2372B9';
		el.style.boxShadow = '0 0 0 3px #e8f1fb';
	}
	function blurInput(e: FocusEvent) {
		const el = e.currentTarget as HTMLInputElement;
		el.style.borderColor = '#EAEAEA';
		el.style.boxShadow = 'none';
	}
</script>

<div
	class="min-h-screen flex items-center justify-center"
	style="background:#F4F6F8;background-image:radial-gradient(circle at 1px 1px,rgba(35,114,185,0.06) 1px,transparent 0);background-size:28px 28px;font-family:'Montserrat',sans-serif;"
>
	<div style="width:420px;background:#fff;border-radius:14px;border:1px solid #EAEAEA;padding:48px 44px;box-shadow:0 8px 48px rgba(0,0,0,0.08);">
		<!-- Logo + heading -->
		<div class="flex flex-col items-center" style="margin-bottom:36px;">
			<div class="flex items-center justify-center" style="width:52px;height:52px;background:#2372B9;border-radius:12px;margin-bottom:14px;box-shadow:0 6px 20px rgba(35,114,185,0.3);">
				<span style="font-size:20px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Pii</span>
			</div>
			<div style="font-size:17px;font-weight:700;color:#474545;">PiiPharma Admin</div>
			<div style="font-size:12px;color:#686868;margin-top:3px;">loyalty.piipharma.com/admin</div>
		</div>

		<form method="POST" use:enhance style="display:flex;flex-direction:column;gap:18px;margin-bottom:24px;">
			<div>
				<label for="email" style="font-size:13px;font-weight:600;color:#474545;display:block;margin-bottom:6px;">Email address</label>
				<input
					id="email" name="email" type="email" autocomplete="email"
					onfocus={focusInput}
					onblur={blurInput}
					style="width:100%;height:40px;border:2px solid #EAEAEA;border-radius:8px;padding:0 14px;font-family:'Montserrat',sans-serif;font-size:14px;color:#474545;outline:none;background:#fff;box-sizing:border-box;"
					required
				/>
			</div>

			<div>
				<label for="password" style="font-size:13px;font-weight:600;color:#474545;display:block;margin-bottom:6px;">Password</label>
				<div style="position:relative;">
					<input
						id="password" name="password" type={showPassword ? 'text' : 'password'} autocomplete="current-password"
						onfocus={focusInput}
						onblur={blurInput}
						style="width:100%;height:40px;border:2px solid #EAEAEA;border-radius:8px;padding:0 42px 0 14px;font-family:'Montserrat',sans-serif;font-size:14px;color:#474545;outline:none;background:#fff;box-sizing:border-box;"
						required
					/>
					<button
						type="button"
						onclick={() => showPassword = !showPassword}
						style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#686868;display:flex;padding:0;"
					>
						{#if showPassword}
							<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
						{:else}
							<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>
						{/if}
					</button>
				</div>
			</div>

			{#if (form as { error?: string })?.error}
				<p style="font-size:13px;color:#E53E3E;margin:0;">{(form as { error?: string }).error}</p>
			{/if}

			<button
				type="submit"
				style="width:100%;height:42px;background:#2372B9;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:700;font-family:'Montserrat',sans-serif;cursor:pointer;"
			>Sign In</button>
		</form>
	</div>
</div>
