<script lang="ts">
  let { size = 80, color = '#fff' }: { size?: number; color?: string } = $props();
  const sw = $derived(size * 0.06);
</script>

<svg width={size} height={size} viewBox="0 0 100 100" fill="none">
  <!-- 4 corner brackets -->
  <path d="M8 30 L8 12 Q8 8 12 8 L30 8" stroke={color} stroke-width={sw} stroke-linecap="round" fill="none"/>
  <path d="M70 8 L88 8 Q92 8 92 12 L92 30" stroke={color} stroke-width={sw} stroke-linecap="round" fill="none"/>
  <path d="M92 70 L92 88 Q92 92 88 92 L70 92" stroke={color} stroke-width={sw} stroke-linecap="round" fill="none"/>
  <path d="M30 92 L12 92 Q8 92 8 88 L8 70" stroke={color} stroke-width={sw} stroke-linecap="round" fill="none"/>
  <!-- interior dots -->
  <rect x="26" y="26" width="14" height="14" rx="2" fill={color}/>
  <rect x="60" y="26" width="14" height="14" rx="2" fill={color}/>
  <rect x="26" y="60" width="14" height="14" rx="2" fill={color}/>
  <rect x="50" y="50" width="6" height="6" rx="1" fill={color}/>
  <rect x="62" y="56" width="6" height="6" rx="1" fill={color}/>
  <rect x="58" y="68" width="6" height="6" rx="1" fill={color}/>
  <rect x="70" y="62" width="6" height="6" rx="1" fill={color}/>
  <rect x="68" y="76" width="6" height="6" rx="1" fill={color}/>
</svg>
