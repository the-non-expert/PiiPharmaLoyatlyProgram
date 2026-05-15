<script lang="ts">
  let { name, current, total, cashback }: {
    name: string;
    current: number;
    total: number;
    cashback: number;
  } = $props();

  const pct = $derived(Math.min(100, Math.round((current / total) * 100)));
  const done = $derived(current >= total);
</script>

<div
  class="bg-white rounded-xl border border-[#EAEAEA] px-[14px] py-3"
  style="box-shadow: 0 1px 4px rgba(0,0,0,0.04)"
>
  <div class="flex justify-between items-center mb-2">
    <div class="text-[14px] font-bold text-[#474545] truncate mr-2">{name}</div>
    <div class="text-[13px] font-bold shrink-0" style="color: {done ? '#93CB52' : '#2372B9'}">
      {current}<span class="font-semibold text-[#686868]"> / {total}</span>
    </div>
  </div>
  <div class="h-[6px] bg-[#EAEAEA] rounded-full overflow-hidden mb-[6px]">
    <div
      class="h-full rounded-full transition-all duration-500"
      style="width: {pct}%; background: {done ? '#93CB52' : '#2372B9'}"
    ></div>
  </div>
  <div class="text-[11px] text-[#686868]">
    {done ? `Complete — ₹${cashback} claim created` : `₹${cashback} cashback when complete`}
  </div>
</div>
