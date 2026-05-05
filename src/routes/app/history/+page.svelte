<script lang="ts">
  import type { PageData } from './$types';
  import BottomNav from '$lib/components/BottomNav.svelte';

  let { data }: { data: PageData } = $props();

  let expandedId = $state<string | null>(null);

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  const statusMap: Record<string, { bg: string; color: string; dot: string; label: string }> = {
    pending:  { bg: '#fef3cd', color: '#92640a', dot: '#F59E0B', label: 'Pending' },
    approved: { bg: '#f0f9e6', color: '#3d6e10', dot: '#93CB52', label: 'Approved' },
    rejected: { bg: '#fde8e8', color: '#9b2626', dot: '#E53E3E', label: 'Rejected' },
    paid:     { bg: '#e8f1fb', color: '#14407a', dot: '#2372B9', label: 'Paid' },
  };

  function badge(status: string) {
    return statusMap[status] ?? { bg: '#F4F6F8', color: '#686868', dot: '#686868', label: status };
  }
</script>

<main class="min-h-screen bg-[#F4F6F8] flex flex-col font-[Montserrat]">
  <div class="max-w-lg mx-auto w-full flex flex-col flex-1 pb-[72px]">

    <!-- Header -->
    <div class="bg-white border-b border-[#EAEAEA] px-5 pt-3 pb-4 shrink-0">
      <h1 class="text-[22px] font-bold text-[#474545]">My Claims</h1>
    </div>

    <!-- Claim list -->
    <div class="flex-1 overflow-y-auto px-4 py-4">
      {#if data.claims.length === 0}
        <!-- Empty state -->
        <div class="flex flex-col items-center justify-center pt-20 gap-4">
          <div
            class="w-[90px] h-[90px] rounded-xl flex items-center justify-center border-2 border-dashed border-[#EAEAEA] bg-[#F4F6F8]"
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#EAEAEA" stroke-width="2"/>
              <path d="M7 8h10M7 12h10M7 16h6" stroke="#EAEAEA" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="text-center">
            <p class="text-[16px] font-bold text-[#474545] mb-1">No claims yet</p>
            <p class="text-[14px] text-[#686868]">Submit coupons to create your first claim.</p>
          </div>
          <a
            href="/app"
            class="mt-2 bg-[#2372B9] text-white rounded-lg px-8 py-3 text-[14px] font-bold"
          >
            Submit Your First Coupon
          </a>
        </div>

      {:else}
        <div class="flex flex-col gap-[10px]">
          {#each data.claims as claim}
            {@const b = badge(claim.status)}
            <div
              class="bg-white rounded-xl border border-[#EAEAEA] px-4 py-4"
              style="box-shadow: 0 1px 6px rgba(0,0,0,0.04)"
            >
              <!-- Top row -->
              <div class="flex justify-between items-start mb-1.5">
                <div class="flex-1 min-w-0 mr-3">
                  <div class="text-[15px] font-bold text-[#474545] mb-0.5">{claim.product_name}</div>
                  <div class="text-[12px] text-[#686868]">#{claim.id.slice(0,8).toUpperCase()} · {formatDate(claim.created_at)}</div>
                </div>
                <!-- Badge -->
                <span
                  class="inline-flex items-center gap-[5px] px-[10px] py-1 rounded-full text-[12px] font-bold shrink-0"
                  style="background:{b.bg}; color:{b.color}"
                >
                  <span class="w-1.5 h-1.5 rounded-full shrink-0" style="background:{b.dot}"></span>
                  {b.label}
                </span>
              </div>

              <!-- Bottom row -->
              <div class="flex justify-between items-center mt-2">
                <span
                  class="text-[16px] font-bold"
                  style="color: {claim.status === 'approved' || claim.status === 'paid' ? '#93CB52' : '#474545'}"
                >
                  {#if claim.status === 'approved' || claim.status === 'paid'}
                    ✓ ₹{claim.cashback_amount} cashback
                  {:else if claim.status === 'pending'}
                    <span class="text-[13px] font-semibold text-[#92640a]">Under review</span>
                  {/if}
                </span>
                {#if claim.status === 'rejected' && claim.rejection_reason}
                  <button
                    type="button"
                    onclick={() => expandedId = expandedId === claim.id ? null : claim.id}
                    class="flex items-center gap-1 text-[13px] font-semibold text-[#E53E3E]"
                  >
                    View reason
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d={expandedId === claim.id ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'}
                        stroke="#E53E3E"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                {/if}
              </div>

              <!-- Expanded rejection reason -->
              {#if claim.status === 'rejected' && claim.rejection_reason && expandedId === claim.id}
                <div
                  class="mt-3 rounded-lg p-3 border border-[#E53E3E] bg-[#fde8e8]"
                >
                  <div class="text-[12px] font-bold text-[#9b2626] mb-1">Rejection Reason</div>
                  <div class="text-[13px] text-[#474545] leading-relaxed">{claim.rejection_reason}</div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>

  </div>

  <BottomNav active="claims" />
</main>
