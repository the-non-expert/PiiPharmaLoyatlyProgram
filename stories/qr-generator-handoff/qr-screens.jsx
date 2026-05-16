// PiiPharma Admin — Bulk QR Generator screens
// Uses palette + primitives from admin-screens.jsx (window globals)
// Each screen is rendered at 1440×900 to match the rest of the admin canvas.

const { useState: useStateQR } = React;

const QC = {
  primary:'#2372B9', primaryDark:'#1a5a99', primaryLight:'#e8f1fb',
  secondary:'#24AEB1', secondaryLight:'#e6f7f7',
  success:'#3d8c1a', successSoft:'#93CB52', successLight:'#f0f9e6',
  error:'#E53E3E', errorLight:'#fde8e8',
  warning:'#F59E0B', warningLight:'#fef3cd',
  body:'#474545', muted:'#686868', white:'#FFFFFF',
  surface:'#F4F6F8', border:'#EAEAEA',
  sidebar:'#141f2e',
};

// ── Tiny SVG icon set ─────────────────────────────────────────────────────
const I = {
  qr: (sz=14, c='currentColor') => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke={c} strokeWidth="2"/>
      <rect x="14" y="3" width="7" height="7" rx="1" stroke={c} strokeWidth="2"/>
      <rect x="3" y="14" width="7" height="7" rx="1" stroke={c} strokeWidth="2"/>
      <path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 19h2M19 14h2" stroke={c} strokeWidth="2" strokeLinecap="square"/>
    </svg>
  ),
  edit: (sz=13, c='currentColor') => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <path d="M12 20h9" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" stroke={c} strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  ),
  download: (sz=14, c='#fff') => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 10l5 5 5-5M12 15V3" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  x: (sz=14, c='currentColor') => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  ),
  check: (sz=14, c='#fff') => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  alert: (sz=14, c='#fff') => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <path d="M12 9v4M12 17h.01" stroke={c} strokeWidth="2.4" strokeLinecap="round"/>
      <path d="M10.3 3.7L2.5 17.2A2 2 0 004.2 20.2h15.6a2 2 0 001.7-3l-7.8-13.5a2 2 0 00-3.4 0z" stroke={c} strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  ),
  info: (sz=14, c='#fff') => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2"/>
      <path d="M12 11v5M12 8h.01" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  ),
  history: (sz=13, c='currentColor') => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <path d="M3 3v5h5M12 7v5l3 2" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

// ── Sample QR code (deterministic pseudo-pattern) ─────────────────────────
// Not a real QR — a placeholder grid that looks like one. Three position markers
// + data area filled from a tiny hash of the input string.
function SampleQR({ seed, size=160 }) {
  const N = 25;
  const px = size / N;
  // Cheap deterministic hash → bit array
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const bit = (r, c) => {
    let x = (r * 91 + c * 53 + h) | 0;
    x = (x ^ (x << 13)) | 0;
    x = (x ^ (x >>> 17)) | 0;
    x = (x ^ (x << 5)) | 0;
    return (x & 7) < 3;
  };
  const inPosMarker = (r, c) => {
    const inBox = (rr, cc) => r >= rr && r < rr + 7 && c >= cc && c < cc + 7;
    return inBox(0, 0) || inBox(0, N - 7) || inBox(N - 7, 0);
  };
  const drawMarker = (rr, cc, k) => {
    const cells = [];
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
      const ring = r === 0 || r === 6 || c === 0 || c === 6;
      const center = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      if (ring || center) {
        cells.push(<rect key={`m${k}-${r}-${c}`} x={(cc + c) * px} y={(rr + r) * px} width={px} height={px} fill="#1a1a1a"/>);
      }
    }
    return cells;
  };
  const cells = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (inPosMarker(r, c)) continue;
      if (bit(r, c)) cells.push(<rect key={`${r}-${c}`} x={c*px} y={r*px} width={px} height={px} fill="#1a1a1a"/>);
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display:'block', background:'#fff', borderRadius:6 }}>
      <rect width={size} height={size} fill="#fff"/>
      {cells}
      {drawMarker(0, 0, 'tl')}
      {drawMarker(0, N - 7, 'tr')}
      {drawMarker(N - 7, 0, 'bl')}
    </svg>
  );
}

// ── Toggle Switch ─────────────────────────────────────────────────────────
function Toggle({ on=true, sz=18 }) {
  return (
    <div style={{ width:sz*1.9, height:sz, borderRadius:99, background: on ? QC.success : '#cdd0d4', position:'relative', flexShrink:0 }}>
      <div style={{ width:sz-4, height:sz-4, borderRadius:'50%', background:'#fff', position:'absolute', top:2, left: on ? sz*1.9 - sz + 2 : 2, boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
    </div>
  );
}

// ── Segmented control ─────────────────────────────────────────────────────
function Segment({ options, value }) {
  return (
    <div style={{ display:'inline-flex', background:QC.surface, padding:3, borderRadius:8, border:`1px solid ${QC.border}` }}>
      {options.map(o => {
        const on = o === value;
        return (
          <div key={o} style={{ padding:'7px 14px', fontSize:12, fontWeight:on?700:600, color:on?QC.primary:QC.muted, background:on?QC.white:'transparent', borderRadius:6, boxShadow:on?'0 1px 3px rgba(0,0,0,0.08)':'none', cursor:'pointer', fontFamily:'Montserrat' }}>{o}</div>
        );
      })}
    </div>
  );
}

// ── Form field ────────────────────────────────────────────────────────────
function Field({ label, hint, error, children, required, optional }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
        <label style={{ fontSize:12, fontWeight:700, color:QC.body, fontFamily:'Montserrat' }}>
          {label}
          {required && <span style={{ color:QC.error, marginLeft:3 }}>*</span>}
          {optional && <span style={{ fontWeight:500, color:QC.muted, marginLeft:6 }}>Optional</span>}
        </label>
        {hint && !error && <span style={{ fontSize:10, color:QC.muted, fontFamily:'Montserrat' }}>{hint}</span>}
      </div>
      {children}
      {error && <span style={{ fontSize:10.5, color:QC.error, fontWeight:600, fontFamily:'Montserrat', display:'flex', alignItems:'center', gap:4 }}>
        <span style={{ width:11, height:11, borderRadius:'50%', background:QC.error, color:'#fff', fontSize:8, fontWeight:700, display:'inline-flex', alignItems:'center', justifyContent:'center' }}>!</span>
        {error}
      </span>}
    </div>
  );
}

function Inp({ value, placeholder, prefix, readOnly, error, mono }) {
  return (
    <div style={{ display:'flex', alignItems:'stretch', height:38, border:`1.5px solid ${error?QC.error:QC.border}`, borderRadius:7, overflow:'hidden', background: readOnly ? QC.surface : QC.white, boxShadow: error ? `0 0 0 3px ${QC.errorLight}` : 'none' }}>
      {prefix && <span style={{ padding:'0 11px', display:'flex', alignItems:'center', fontSize:13, fontWeight:700, color:QC.muted, fontFamily:'monospace', background:QC.surface, borderRight:`1px solid ${QC.border}` }}>{prefix}</span>}
      <input readOnly defaultValue={value} placeholder={placeholder}
        style={{ flex:1, padding:'0 12px', border:'none', outline:'none', fontFamily: mono?'monospace':'Montserrat', fontSize:13, color: readOnly ? QC.muted : QC.body, background:'transparent', minWidth:0 }}/>
    </div>
  );
}

// ── Modal Shell (fills the screen, content swappable) ─────────────────────
function ModalShell({ children, sidebarActive='products', dimmedScreen }) {
  return (
    <AdminLayout active={sidebarActive}>
      {/* The dim screen behind the modal — products page in background */}
      <div style={{ flex:1, overflow:'hidden', position:'relative' }}>
        <div style={{ position:'absolute', inset:0, opacity:0.55, filter:'blur(0.5px)', pointerEvents:'none' }}>
          {dimmedScreen}
        </div>
        <div style={{ position:'absolute', inset:0, background:'rgba(20,31,46,0.42)' }}/>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px' }}>
          {children}
        </div>
      </div>
    </AdminLayout>
  );
}

// ── Background — Products page (a slimmer version of the real one) ────────
function ProductsBackdrop({ highlightIdx=-1 }) {
  const rows = [
    { name:'Amoxicillin 500mg',   req:5, cash:100, sub:300, claims:60, active:true  },
    { name:'Paracetamol 650mg',   req:5, cash:60,  sub:340, claims:68, active:true  },
    { name:'Metformin 500mg',     req:5, cash:80,  sub:195, claims:39, active:true  },
    { name:'Azithromycin 500mg',  req:5, cash:120, sub:120, claims:24, active:true  },
    { name:'Ciprofloxacin 500mg', req:5, cash:90,  sub:70,  claims:14, active:false },
    { name:'Atorvastatin 10mg',   req:5, cash:150, sub:40,  claims:8,  active:true  },
  ];
  return (
    <div style={{ flex:1, overflowY:'auto', padding:'32px 36px', background:QC.surface, fontFamily:'Montserrat' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:QC.body }}>Products</h1>
        <div style={{ display:'flex', gap:10 }}>
          <button style={{ background:QC.white, color:QC.body, border:`1.5px solid ${QC.border}`, borderRadius:7, padding:'8px 14px', fontSize:13, fontWeight:700, fontFamily:'Montserrat', display:'inline-flex', alignItems:'center', gap:6 }}>
            <span style={{ color:QC.body, display:'flex' }}>{I.qr(13, QC.body)}</span> View All Batches
          </button>
          <button style={{ background:QC.primary, color:'#fff', border:'none', borderRadius:7, padding:'8px 14px', fontSize:13, fontWeight:700, fontFamily:'Montserrat' }}>+ Add Product</button>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18 }}>
        {rows.map((p,i) => (
          <ProductCard key={i} {...p} highlighted={i===highlightIdx}/>
        ))}
      </div>
    </div>
  );
}

function ProductCard({ name, req, cash, sub, claims, active, highlighted }) {
  return (
    <div style={{ background:QC.white, borderRadius:10, border:`${highlighted?2:1}px solid ${highlighted?QC.primary:QC.border}`, padding:'18px 20px', boxShadow: highlighted ? `0 0 0 3px ${QC.primaryLight}, 0 6px 18px rgba(35,114,185,0.18)` : '0 1px 4px rgba(0,0,0,0.04)', position:'relative' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12, gap:10 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:700, color:QC.body, lineHeight:1.3, marginBottom:4 }}>{name}</div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <Toggle on={active} sz={16}/>
            <span style={{ fontSize:11, fontWeight:600, color: active?QC.success:QC.muted, fontFamily:'Montserrat' }}>{active?'Active':'Inactive'}</span>
          </div>
        </div>
      </div>
      {/* Stats — compact 2-up */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
        <div style={{ background:QC.surface, borderRadius:7, padding:'8px 10px' }}>
          <div style={{ fontSize:9, fontWeight:700, color:QC.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3 }}>Coupons Req.</div>
          <div style={{ fontSize:17, fontWeight:700, color:QC.body }}>{req}</div>
        </div>
        <div style={{ background:QC.surface, borderRadius:7, padding:'8px 10px' }}>
          <div style={{ fontSize:9, fontWeight:700, color:QC.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3 }}>Cashback</div>
          <div style={{ fontSize:17, fontWeight:700, color:QC.primary }}>₹{cash}</div>
        </div>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14, fontSize:11 }}>
        <span style={{ color:QC.muted }}>Coupons in: <strong style={{ color:QC.body, fontWeight:700 }}>{sub}</strong></span>
        <span style={{ color:QC.muted }}>Claims: <strong style={{ color:QC.body, fontWeight:700 }}>{claims}</strong></span>
      </div>
      {/* Actions — non-intrusive row */}
      <div style={{ display:'flex', gap:6, alignItems:'center', borderTop:`1px solid ${QC.border}`, paddingTop:12 }}>
        <button style={{ flex:1, background: highlighted ? QC.primary : QC.primaryLight, color: highlighted ? '#fff' : QC.primary, border: highlighted ? 'none' : `1.5px solid ${QC.primary}`, borderRadius:7, padding:'7px 10px', fontSize:12, fontWeight:700, fontFamily:'Montserrat', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6, cursor:'pointer' }}>
          {I.qr(13, highlighted?'#fff':QC.primary)} Generate QR
        </button>
        <button title="Edit" style={{ width:34, height:32, background:QC.white, color:QC.muted, border:`1.5px solid ${QC.border}`, borderRadius:7, display:'inline-flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          {I.edit(13, QC.muted)}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Product list row with Generate QR trigger
// ════════════════════════════════════════════════════════════════════════════
function QRScreen1Trigger() {
  return (
    <AdminLayout active="products">
      <ProductsBackdrop highlightIdx={0}/>
    </AdminLayout>
  );
}

// ── Modal Card (used by 2/3/4/6) ──────────────────────────────────────────
function ModalCard({ children, w=720 }) {
  return (
    <div style={{ width:w, maxWidth:'90%', maxHeight:'85%', background:QC.white, borderRadius:14, boxShadow:'0 24px 60px rgba(0,0,0,0.28), 0 4px 12px rgba(0,0,0,0.12)', overflow:'hidden', display:'flex', flexDirection:'column', fontFamily:'Montserrat' }}>
      {children}
    </div>
  );
}

function ModalHeader({ title, subtitle, status }) {
  return (
    <div style={{ padding:'18px 24px 16px', borderBottom:`1px solid ${QC.border}`, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, minWidth:0 }}>
        <div style={{ width:36, height:36, background:QC.primaryLight, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          {I.qr(18, QC.primary)}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:15, fontWeight:700, color:QC.body, lineHeight:1.2 }}>{title}</div>
          <div style={{ fontSize:11.5, color:QC.muted, marginTop:2 }}>{subtitle}</div>
        </div>
      </div>
      {status}
      <button style={{ width:28, height:28, background:'transparent', border:'none', borderRadius:6, cursor:'pointer', color:QC.muted, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        {I.x(16, QC.muted)}
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Generator panel (default / form state)
// ════════════════════════════════════════════════════════════════════════════
function GeneratorForm({ batchId='MAY-2026-A', qty='10000', prefix='PP-', format='PDF sheet', cta='Generate & Download', error=null }) {
  const sampleSerial = `${prefix||''}000001`;
  const payload = `https://piipharma.in/q/${sampleSerial}?b=${batchId}&p=amx500&h=a1f3b9c7`;
  return (
    <div style={{ padding:'22px 24px', overflow:'auto', display:'grid', gridTemplateColumns:'1fr 220px', gap:24 }}>
      {/* LEFT — form fields */}
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <Field label="Product">
          <Inp value="Amoxicillin 500mg" readOnly/>
        </Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Batch ID" required hint="Used to label this print run"
            error={error==='batchId' ? "Batch ID 'MAY-2026-A' already exists for this product" : null}>
            <Inp value={batchId} placeholder="e.g. MAY-2026-A" error={error==='batchId'}/>
          </Field>
          <Field label="Quantity" required hint="1 – 10,000">
            <Inp value={qty} placeholder="1000"/>
          </Field>
        </div>
        <Field label="Serial prefix" optional hint={`Serials become ${sampleSerial} … ${(prefix||'')+String(parseInt(qty||'0',10)||0).padStart(6,'0')}`}>
          <Inp value={prefix} placeholder="PP-" mono/>
        </Field>
        <Field label="Output format" required>
          <div style={{ marginTop:2 }}>
            <Segment options={['PDF sheet','ZIP of PNGs']} value={format}/>
          </div>
          <div style={{ fontSize:10.5, color:QC.muted, marginTop:6, lineHeight:1.5 }}>
            {format==='PDF sheet'
              ? 'A4 sheet, 35 stickers per page (5 × 7 grid, 38 × 38 mm each). Print-ready.'
              : 'One 600 × 600 px PNG per code, named by serial. ZIP archive.'}
          </div>
        </Field>
      </div>
      {/* RIGHT — sample preview */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <div style={{ fontSize:10, fontWeight:700, color:QC.muted, textTransform:'uppercase', letterSpacing:'0.08em' }}>Sample preview</div>
        <div style={{ background:QC.surface, borderRadius:10, border:`1px solid ${QC.border}`, padding:14, display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
          <div style={{ padding:10, background:QC.white, borderRadius:8, border:`1px solid ${QC.border}` }}>
            <SampleQR seed={payload} size={156}/>
          </div>
          <div style={{ fontFamily:'monospace', fontSize:11, fontWeight:700, color:QC.body }}>{sampleSerial}</div>
        </div>
        <div style={{ background:QC.surface, borderRadius:7, padding:'8px 10px', border:`1px solid ${QC.border}` }}>
          <div style={{ fontSize:9, fontWeight:700, color:QC.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>Encoded payload</div>
          <div style={{ fontFamily:'monospace', fontSize:9.5, color:QC.body, wordBreak:'break-all', lineHeight:1.5 }}>{payload}</div>
        </div>
      </div>
    </div>
  );
}

function ModalFooter({ children, leftNote }) {
  return (
    <div style={{ padding:'14px 24px', borderTop:`1px solid ${QC.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, background:'#fbfbfc' }}>
      <div style={{ fontSize:11, color:QC.muted, fontFamily:'Montserrat' }}>{leftNote}</div>
      <div style={{ display:'flex', gap:8 }}>{children}</div>
    </div>
  );
}

function QRScreen2Modal() {
  return (
    <ModalShell dimmedScreen={<ProductsBackdrop highlightIdx={0}/>}>
      <ModalCard>
        <ModalHeader title="Generate QR Codes — Amoxicillin 500mg" subtitle="Each sticker encodes a unique serial + batch + signed HMAC."/>
        <GeneratorForm/>
        <ModalFooter leftNote="Stickers can be reprinted any time from Batch History.">
          <button style={{ background:QC.white, color:QC.body, border:`1.5px solid ${QC.border}`, borderRadius:7, padding:'9px 16px', fontSize:13, fontWeight:600, fontFamily:'Montserrat', cursor:'pointer' }}>Cancel</button>
          <button style={{ background:QC.primary, color:'#fff', border:'none', borderRadius:7, padding:'9px 20px', fontSize:13, fontWeight:700, fontFamily:'Montserrat', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:7, boxShadow:'0 2px 8px rgba(35,114,185,0.3)' }}>
            {I.qr(14, '#fff')} Generate &amp; Download
          </button>
        </ModalFooter>
      </ModalCard>
    </ModalShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Generation in-progress
// ════════════════════════════════════════════════════════════════════════════
function QRScreen3Progress() {
  const done = 6420, total = 10000;
  const pct = Math.round((done/total)*100);
  return (
    <ModalShell dimmedScreen={<ProductsBackdrop/>}>
      <ModalCard w={560}>
        <ModalHeader title="Generating QR codes…" subtitle="Amoxicillin 500mg · Batch MAY-2026-A"/>
        <div style={{ padding:'30px 36px 24px', display:'flex', flexDirection:'column', alignItems:'center', gap:20 }}>
          {/* Pulsing QR */}
          <div style={{ position:'relative', width:140, height:140, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ position:'absolute', inset:-6, borderRadius:18, border:`2px solid ${QC.primary}`, opacity:0.18 }}/>
            <div style={{ position:'absolute', inset:-14, borderRadius:22, border:`2px solid ${QC.primary}`, opacity:0.08 }}/>
            <div style={{ padding:10, background:QC.white, borderRadius:10, border:`1px solid ${QC.border}`, boxShadow:'0 4px 14px rgba(35,114,185,0.18)' }}>
              <SampleQR seed="generating" size={100}/>
            </div>
          </div>
          {/* Stats row */}
          <div style={{ width:'100%', display:'flex', alignItems:'baseline', justifyContent:'center', gap:10 }}>
            <div style={{ fontSize:34, fontWeight:700, color:QC.body, fontFamily:'Montserrat', letterSpacing:'-0.02em' }}>{done.toLocaleString('en-IN')}</div>
            <div style={{ fontSize:18, fontWeight:600, color:QC.muted, fontFamily:'Montserrat' }}>/ {total.toLocaleString('en-IN')}</div>
          </div>
          {/* Progress bar */}
          <div style={{ width:'100%' }}>
            <div style={{ width:'100%', height:8, background:QC.border, borderRadius:99, overflow:'hidden' }}>
              <div style={{ width:`${pct}%`, height:'100%', background:`linear-gradient(90deg, ${QC.primary} 0%, ${QC.secondary} 100%)`, borderRadius:99, transition:'width 0.4s' }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
              <span style={{ fontSize:11.5, color:QC.muted, fontFamily:'Montserrat', display:'inline-flex', alignItems:'center', gap:6 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:QC.primary, animation:'qrpulse 1.2s ease-in-out infinite' }}/>
                Signing &amp; rendering codes
              </span>
              <span style={{ fontSize:11.5, fontWeight:700, color:QC.primary, fontFamily:'Montserrat' }}>{pct}% · ~4 s left</span>
            </div>
          </div>
          <div style={{ fontSize:11, color:QC.muted, fontFamily:'Montserrat', textAlign:'center', maxWidth:340, lineHeight:1.6 }}>
            Keep this window open. The file will start downloading automatically when ready.
          </div>
        </div>
        <ModalFooter leftNote="Cancelling discards all generated codes.">
          <button style={{ background:QC.white, color:QC.body, border:`1.5px solid ${QC.border}`, borderRadius:7, padding:'9px 16px', fontSize:13, fontWeight:600, fontFamily:'Montserrat', cursor:'pointer' }}>Cancel generation</button>
        </ModalFooter>
      </ModalCard>
    </ModalShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Success / download-ready
// ════════════════════════════════════════════════════════════════════════════
function QRScreen4Success() {
  return (
    <ModalShell dimmedScreen={<ProductsBackdrop/>}>
      <ModalCard w={560}>
        <ModalHeader
          title="Batch ready"
          subtitle="10,000 QR codes generated and signed."
          status={
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:99, background:QC.successLight, color:'#3d6e10', fontSize:11, fontWeight:700, fontFamily:'Montserrat', whiteSpace:'nowrap' }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:QC.success }}/>
              Ready to download
            </span>
          }
        />
        <div style={{ padding:'24px 28px', display:'flex', flexDirection:'column', gap:18 }}>
          {/* Big success state */}
          <div style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 18px', background:QC.successLight, borderRadius:10, border:`1px solid ${QC.successSoft}` }}>
            <div style={{ width:44, height:44, borderRadius:'50%', background:QC.success, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              {I.check(22, '#fff')}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:700, color:'#2d5f12', fontFamily:'Montserrat' }}>piipharma_amoxicillin-500mg_MAY-2026-A.pdf</div>
              <div style={{ fontSize:11, color:'#3d6e10', fontFamily:'Montserrat', marginTop:2 }}>286 pages · 8.4 MB · expires in 7 days</div>
            </div>
          </div>
          {/* Summary */}
          <div style={{ background:QC.surface, borderRadius:10, border:`1px solid ${QC.border}`, padding:'14px 16px' }}>
            <div style={{ fontSize:10, fontWeight:700, color:QC.muted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Summary</div>
            {[
              ['Product', 'Amoxicillin 500mg'],
              ['Batch ID', 'MAY-2026-A'],
              ['Quantity', '10,000 stickers'],
              ['Serial range', 'PP-000001 → PP-010000'],
              ['Format', 'PDF sheet · A4 · 35 per page'],
              ['Generated', '15 May 2026, 3:42 PM IST · by Sneha Agarwal'],
            ].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${QC.border}`, fontFamily:'Montserrat' }}>
                <span style={{ fontSize:11.5, color:QC.muted }}>{k}</span>
                <span style={{ fontSize:12, fontWeight:600, color:QC.body, fontFamily: k==='Serial range'?'monospace':'Montserrat' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0' }}>
            {I.info(13, QC.primary)}
            <span style={{ fontSize:11, color:QC.muted, fontFamily:'Montserrat' }}>
              You can re-download this batch any time from <strong style={{ color:QC.primary, fontWeight:700 }}>Batch History</strong>.
            </span>
          </div>
        </div>
        <ModalFooter leftNote="">
          <button style={{ background:QC.white, color:QC.body, border:`1.5px solid ${QC.border}`, borderRadius:7, padding:'9px 16px', fontSize:13, fontWeight:600, fontFamily:'Montserrat', cursor:'pointer' }}>Generate another</button>
          <button style={{ background:QC.primary, color:'#fff', border:'none', borderRadius:7, padding:'9px 20px', fontSize:13, fontWeight:700, fontFamily:'Montserrat', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:7, boxShadow:'0 2px 8px rgba(35,114,185,0.3)' }}>
            {I.download(14, '#fff')} Download PDF
          </button>
        </ModalFooter>
      </ModalCard>
    </ModalShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Batch history per product (full screen, product detail view)
// ════════════════════════════════════════════════════════════════════════════
const BATCHES = [
  { id:'MAY-2026-A', qty:10000, date:'15 May 2026, 3:42 PM', by:'Sneha Agarwal',  fmt:'PDF',  size:'8.4 MB',  range:'PP-000001 → PP-010000', status:'Active' },
  { id:'APR-2026-C', qty:5000,  date:'28 Apr 2026, 11:08 AM', by:'Sneha Agarwal', fmt:'PDF',  size:'4.2 MB',  range:'PP-040001 → PP-045000', status:'Active' },
  { id:'APR-2026-B', qty:5000,  date:'12 Apr 2026, 5:21 PM',  by:'Rohit Verma',   fmt:'ZIP',  size:'62.0 MB', range:'PP-035001 → PP-040000', status:'Active' },
  { id:'APR-2026-A', qty:2500,  date:'02 Apr 2026, 9:15 AM',  by:'Rohit Verma',   fmt:'PDF',  size:'2.1 MB',  range:'PP-032501 → PP-035000', status:'Active' },
  { id:'MAR-2026-B', qty:5000,  date:'21 Mar 2026, 2:47 PM',  by:'Sneha Agarwal', fmt:'PDF',  size:'4.2 MB',  range:'PP-027501 → PP-032500', status:'Active' },
  { id:'MAR-2026-A', qty:7500,  date:'04 Mar 2026, 10:30 AM', by:'Sneha Agarwal', fmt:'ZIP',  size:'94.0 MB', range:'PP-020001 → PP-027500', status:'Archived' },
];

function BatchTab({ active, label, count }) {
  return (
    <div style={{ padding:'8px 18px', fontSize:13, fontWeight:active?700:500, color:active?QC.primary:QC.muted, borderBottom:active?`2px solid ${QC.primary}`:'2px solid transparent', marginBottom:-2, cursor:'pointer', fontFamily:'Montserrat', display:'flex', alignItems:'center', gap:7 }}>
      {label}
      {count != null && <span style={{ background:active?QC.primaryLight:QC.surface, color:active?QC.primary:QC.muted, borderRadius:99, padding:'1px 7px', fontSize:11, fontWeight:700 }}>{count}</span>}
    </div>
  );
}

function QRScreen5History() {
  return (
    <AdminLayout active="products">
      <div style={{ flex:1, overflowY:'auto', padding:'28px 36px', background:QC.surface, fontFamily:'Montserrat' }}>
        {/* Breadcrumb */}
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:16 }}>
          <span style={{ fontSize:12, fontWeight:600, color:QC.primary, cursor:'pointer' }}>Products</span>
          <span style={{ fontSize:12, color:QC.muted }}>/</span>
          <span style={{ fontSize:12, fontWeight:600, color:QC.body }}>Amoxicillin 500mg</span>
        </div>
        {/* Title row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
          <h1 style={{ fontSize:22, fontWeight:700, color:QC.body, fontFamily:'Montserrat' }}>Amoxicillin 500mg</h1>
          <button style={{ background:QC.primary, color:'#fff', border:'none', borderRadius:7, padding:'9px 16px', fontSize:13, fontWeight:700, fontFamily:'Montserrat', display:'inline-flex', alignItems:'center', gap:7, cursor:'pointer', boxShadow:'0 2px 8px rgba(35,114,185,0.25)' }}>
            {I.qr(14, '#fff')} Generate new batch
          </button>
        </div>
        <div style={{ fontSize:12, color:QC.muted, marginBottom:18 }}>5 coupons required · ₹100 cashback · 32,500 stickers in market · 6 batches printed</div>
        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:`2px solid ${QC.border}`, marginBottom:18 }}>
          <BatchTab label="Overview"/>
          <BatchTab label="Batches" count={6} active/>
          <BatchTab label="Settings"/>
        </div>
        {/* KPI strip */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:18 }}>
          {[
            { label:'Total stickers printed', value:'35,000',    accent:QC.primary,    sub:'across 6 batches' },
            { label:'In market',              value:'32,500',    accent:QC.body,       sub:'93% of printed' },
            { label:'Scanned at least once',  value:'18,420',    accent:QC.success,    sub:'56% of in-market' },
            { label:'Last batch',             value:'15 May',    accent:QC.warning,    sub:'10,000 codes' },
          ].map((s,i) => (
            <div key={i} style={{ background:QC.white, borderRadius:10, border:`1px solid ${QC.border}`, padding:'14px 16px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize:10.5, fontWeight:700, color:QC.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:7 }}>{s.label}</div>
              <div style={{ fontSize:22, fontWeight:700, color:s.accent, lineHeight:1, marginBottom:5 }}>{s.value}</div>
              <div style={{ fontSize:11, color:QC.muted }}>{s.sub}</div>
            </div>
          ))}
        </div>
        {/* Toolbar */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          <h2 style={{ fontSize:14, fontWeight:700, color:QC.body, fontFamily:'Montserrat' }}>Batch history</h2>
          <span style={{ fontSize:12, color:QC.muted }}>6 batches</span>
          <div style={{ flex:1 }}/>
          <div style={{ display:'flex', alignItems:'center', border:`1.5px solid ${QC.border}`, borderRadius:7, padding:'0 10px', height:32, background:QC.white }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke={QC.muted} strokeWidth="2"/><path d="M21 21l-4-4" stroke={QC.muted} strokeWidth="2" strokeLinecap="round"/></svg>
            <input readOnly placeholder="Search batch ID" style={{ width:140, height:30, border:'none', outline:'none', fontFamily:'Montserrat', fontSize:12, color:QC.muted, background:'transparent', marginLeft:6 }}/>
          </div>
        </div>
        {/* Table */}
        <div style={{ background:QC.white, borderRadius:10, border:`1px solid ${QC.border}`, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <THead cols={['Batch ID','Quantity','Serial Range','Format','Generated','By','Status','Actions']}/>
            <tbody>
              {BATCHES.map((b,i) => (
                <TR key={i}>
                  <TD><span style={{ fontFamily:'monospace', fontSize:12, color:QC.primary, fontWeight:700 }}>{b.id}</span></TD>
                  <TD style={{ fontWeight:700 }}>{b.qty.toLocaleString('en-IN')}</TD>
                  <TD style={{ fontFamily:'monospace', fontSize:11, color:QC.muted }}>{b.range}</TD>
                  <TD>
                    <span style={{ fontSize:10, fontWeight:700, fontFamily:'Montserrat', padding:'2px 7px', borderRadius:4, background: b.fmt==='PDF'?QC.errorLight:QC.primaryLight, color: b.fmt==='PDF'?'#9b2626':'#14407a' }}>{b.fmt} · {b.size}</span>
                  </TD>
                  <TD style={{ fontSize:12, color:QC.muted }}>{b.date}</TD>
                  <TD style={{ fontSize:12 }}>{b.by}</TD>
                  <TD>
                    {b.status==='Active'
                      ? <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:99, background:QC.successLight, color:'#3d6e10', fontSize:11, fontWeight:700, fontFamily:'Montserrat' }}><span style={{ width:5, height:5, borderRadius:'50%', background:QC.success }}/>Active</span>
                      : <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:99, background:QC.surface, color:QC.muted, fontSize:11, fontWeight:700, fontFamily:'Montserrat' }}><span style={{ width:5, height:5, borderRadius:'50%', background:QC.muted }}/>Archived</span>
                    }
                  </TD>
                  <TD>
                    <div style={{ display:'flex', gap:4 }}>
                      <button style={{ background:QC.white, color:QC.primary, border:`1.5px solid ${QC.border}`, borderRadius:6, padding:'5px 10px', fontSize:11, fontWeight:700, fontFamily:'Montserrat', display:'inline-flex', alignItems:'center', gap:5, cursor:'pointer' }}>
                        {I.download(11, QC.primary)} Re-download
                      </button>
                      <button title="More" style={{ background:QC.white, color:QC.muted, border:`1.5px solid ${QC.border}`, borderRadius:6, width:28, height:26, display:'inline-flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>⋯</button>
                    </div>
                  </TD>
                </TR>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 6 — Error state (serial range collision)
// ════════════════════════════════════════════════════════════════════════════
function QRScreen6Error() {
  return (
    <ModalShell dimmedScreen={<ProductsBackdrop/>}>
      <ModalCard w={620}>
        <ModalHeader
          title="Couldn't generate batch"
          subtitle="Amoxicillin 500mg · attempted MAY-2026-A"
          status={
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:99, background:QC.errorLight, color:'#9b2626', fontSize:11, fontWeight:700, fontFamily:'Montserrat', whiteSpace:'nowrap' }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:QC.error }}/>
              Generation failed
            </span>
          }
        />
        <div style={{ padding:'22px 24px', display:'flex', flexDirection:'column', gap:16 }}>
          {/* Error block */}
          <div style={{ display:'flex', gap:14, padding:'14px 16px', background:QC.errorLight, borderRadius:10, border:`1px solid ${QC.error}`, borderLeftWidth:4 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:QC.error, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              {I.alert(16, '#fff')}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#9b2626', fontFamily:'Montserrat', marginBottom:3 }}>Serial range collision</div>
              <div style={{ fontSize:12, color:QC.body, fontFamily:'Montserrat', lineHeight:1.55 }}>
                Serials <span style={{ fontFamily:'monospace', fontWeight:700 }}>PP-000001 → PP-010000</span> overlap with an existing batch.
                Choose a different serial prefix or let the system auto-assign the next available range.
              </div>
            </div>
          </div>
          {/* Conflict detail */}
          <div style={{ background:QC.surface, borderRadius:10, border:`1px solid ${QC.border}`, padding:'12px 14px' }}>
            <div style={{ fontSize:10, fontWeight:700, color:QC.muted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Conflicts with</div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', background:QC.white, borderRadius:7, border:`1px solid ${QC.border}` }}>
              <div>
                <div style={{ fontSize:12.5, fontWeight:700, color:QC.body, fontFamily:'monospace' }}>APR-2026-C</div>
                <div style={{ fontSize:11, color:QC.muted, marginTop:2 }}>5,000 codes · printed 28 Apr 2026 · serials PP-000001 → PP-005000</div>
              </div>
              <button style={{ background:'transparent', color:QC.primary, border:'none', fontSize:12, fontWeight:700, fontFamily:'Montserrat', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:5 }}>
                {I.history(12, QC.primary)} View batch
              </button>
            </div>
          </div>
          {/* Suggested fix */}
          <div style={{ display:'flex', gap:12, padding:'12px 14px', background:QC.primaryLight, borderRadius:10, border:`1px solid ${QC.primary}` }}>
            <div style={{ width:24, height:24, borderRadius:'50%', background:QC.primary, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
              {I.info(13, '#fff')}
            </div>
            <div style={{ flex:1, fontSize:12, color:QC.body, lineHeight:1.6, fontFamily:'Montserrat' }}>
              <strong style={{ color:'#14407a' }}>Suggested: </strong>
              Use next available range <span style={{ fontFamily:'monospace', fontWeight:700, color:'#14407a' }}>PP-045001 → PP-055000</span>, or change prefix to e.g. <span style={{ fontFamily:'monospace', fontWeight:700, color:'#14407a' }}>PP-MAY-</span>.
            </div>
          </div>
          <div style={{ fontSize:10.5, color:QC.muted, fontFamily:'monospace' }}>
            Error code: <span style={{ color:QC.body }}>QR_SERIAL_COLLISION</span> · trace: <span style={{ color:QC.body }}>req_8c4a91e2</span>
          </div>
        </div>
        <ModalFooter leftNote="No codes were generated. No charges or changes to inventory.">
          <button style={{ background:QC.white, color:QC.body, border:`1.5px solid ${QC.border}`, borderRadius:7, padding:'9px 16px', fontSize:13, fontWeight:600, fontFamily:'Montserrat', cursor:'pointer' }}>Edit values</button>
          <button style={{ background:QC.primary, color:'#fff', border:'none', borderRadius:7, padding:'9px 18px', fontSize:13, fontWeight:700, fontFamily:'Montserrat', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:7, boxShadow:'0 2px 8px rgba(35,114,185,0.3)' }}>
            Use next available range
          </button>
        </ModalFooter>
      </ModalCard>
    </ModalShell>
  );
}

// Export
Object.assign(window, {
  QRScreen1Trigger, QRScreen2Modal, QRScreen3Progress,
  QRScreen4Success, QRScreen5History, QRScreen6Error,
});
