// PiiPharma Admin Dashboard — 8 Screen Components
// Design tokens from retailer-screens.jsx (single source of truth)

const { useState } = React;

const AC = {
  primary:'#2372B9', primaryDark:'#1a5a99', primaryLight:'#e8f1fb',
  secondary:'#24AEB1', secondaryLight:'#e6f7f7',
  success:'#93CB52', successLight:'#f0f9e6',
  error:'#E53E3E', errorLight:'#fde8e8',
  warning:'#F59E0B', warningLight:'#fef3cd',
  body:'#474545', muted:'#686868', white:'#FFFFFF',
  surface:'#F4F6F8', border:'#EAEAEA',
  sidebar:'#141f2e',
};

// ── Sidebar ──────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id:'dashboard', label:'Dashboard', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg> },
  { id:'claims',    label:'Claims',    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M8 7h8M8 11h8M8 15h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
  { id:'retailers', label:'Retailers', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.85" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
  { id:'products',  label:'Products',  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg> },
  { id:'payouts',   label:'Payouts',   icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M2 10h20" stroke="currentColor" strokeWidth="2"/></svg> },
];

function Sidebar({ active }) {
  return (
    <div style={{ width:220, height:900, background:AC.sidebar, display:'flex', flexDirection:'column', flexShrink:0 }}>
      <div style={{ padding:'22px 18px 18px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, background:AC.primary, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ fontSize:12, fontWeight:900, color:'#fff', fontFamily:'Montserrat', letterSpacing:'-0.5px' }}>Pii</span>
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'#fff', fontFamily:'Montserrat', lineHeight:1.2 }}>PiiPharma</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontFamily:'Montserrat' }}>Admin Portal</div>
          </div>
        </div>
      </div>
      <nav style={{ flex:1, padding:'10px 8px' }}>
        {NAV_ITEMS.map(n => {
          const on = n.id === active;
          return (
            <div key={n.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:7, marginBottom:1, background: on ? AC.primary : 'transparent', cursor:'pointer' }}>
              <span style={{ color: on ? '#fff' : 'rgba(255,255,255,0.45)', display:'flex', flexShrink:0 }}>{n.icon}</span>
              <span style={{ fontSize:13, fontWeight: on ? 700 : 500, color: on ? '#fff' : 'rgba(255,255,255,0.6)', fontFamily:'Montserrat' }}>{n.label}</span>
              {n.id === 'claims' && !on && (
                <span style={{ marginLeft:'auto', background:'rgba(245,158,11,0.18)', color:'#F59E0B', borderRadius:99, padding:'1px 7px', fontSize:11, fontWeight:700, fontFamily:'Montserrat' }}>47</span>
              )}
            </div>
          );
        })}
      </nav>
      <div style={{ padding:'14px 16px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(255,255,255,0.14)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ fontSize:11, fontWeight:700, color:'#fff', fontFamily:'Montserrat' }}>SA</span>
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:'#fff', fontFamily:'Montserrat' }}>Sneha Agarwal</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontFamily:'Montserrat' }}>Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Layout shell ──────────────────────────────────────────────────────────
function AdminLayout({ children, active }) {
  return (
    <div style={{ width:1440, height:900, display:'flex', background:AC.surface, fontFamily:'Montserrat', overflow:'hidden' }}>
      <Sidebar active={active}/>
      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>{children}</div>
    </div>
  );
}

// ── Shared primitives ─────────────────────────────────────────────────────
function THead({ cols }) {
  return (
    <thead>
      <tr>
        {cols.map((c,i) => (
          <th key={i} style={{ padding:'9px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:AC.muted, textTransform:'uppercase', letterSpacing:'0.06em', borderBottom:`2px solid ${AC.border}`, background:AC.white, whiteSpace:'nowrap', fontFamily:'Montserrat' }}>{c}</th>
        ))}
      </tr>
    </thead>
  );
}

function TR({ children }) {
  return <tr style={{ borderBottom:`1px solid ${AC.border}`, background:AC.white }}>{children}</tr>;
}

function TD({ children, style={} }) {
  return <td style={{ padding:'10px 14px', fontSize:13, color:AC.body, fontFamily:'Montserrat', verticalAlign:'middle', ...style }}>{children}</td>;
}

function ABadge({ status }) {
  const m = {
    Pending:  { bg:'#fef3cd', color:'#92640a', dot:AC.warning },
    Approved: { bg:AC.successLight, color:'#3d6e10', dot:AC.success },
    Rejected: { bg:AC.errorLight, color:'#9b2626', dot:AC.error },
    Paid:     { bg:AC.primaryLight, color:'#14407a', dot:AC.primary },
  }[status] || { bg:AC.surface, color:AC.muted, dot:AC.muted };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:99, background:m.bg, color:m.color, fontSize:11, fontWeight:700, fontFamily:'Montserrat', whiteSpace:'nowrap' }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:m.dot, flexShrink:0 }}/>
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background:AC.white, borderRadius:10, border:`1px solid ${AC.border}`, padding:'18px 20px', flex:1, boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ fontSize:11, fontWeight:700, color:AC.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8, fontFamily:'Montserrat' }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:700, color: accent||AC.body, fontFamily:'Montserrat', lineHeight:1, marginBottom:sub?6:0 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:AC.muted, fontFamily:'Montserrat' }}>{sub}</div>}
    </div>
  );
}

function Btn({ children, variant='primary', size='md', style={} }) {
  const bg   = {primary:AC.primary,success:'#3d8c1a',danger:AC.error,ghost:'transparent',outline:AC.white}[variant];
  const col  = {primary:'#fff',success:'#fff',danger:'#fff',ghost:AC.primary,outline:AC.body}[variant];
  const brd  = {primary:'none',success:'none',danger:'none',ghost:`1.5px solid ${AC.primary}`,outline:`1.5px solid ${AC.border}`}[variant];
  const pad  = {sm:'5px 11px',md:'8px 14px',lg:'11px 20px'}[size];
  const fs   = {sm:11,md:13,lg:14}[size];
  return <button style={{ background:bg,color:col,border:brd,borderRadius:7,padding:pad,fontSize:fs,fontWeight:700,fontFamily:'Montserrat',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:5,whiteSpace:'nowrap',...style }}>{children}</button>;
}

function Pagination({ page=1, total=47 }) {
  const pages = Math.ceil(total/8);
  const show = Math.min(pages, 6);
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 16px', borderTop:`1px solid ${AC.border}`, background:AC.white }}>
      <span style={{ fontSize:12, color:AC.muted, fontFamily:'Montserrat' }}>Showing {(page-1)*8+1}–{Math.min(page*8,total)} of {total} results</span>
      <div style={{ display:'flex', gap:4 }}>
        <div style={{ height:27, padding:'0 10px', display:'flex', alignItems:'center', borderRadius:6, border:`1.5px solid ${AC.border}`, fontSize:12, fontWeight:500, color:AC.muted, cursor:'pointer', fontFamily:'Montserrat', background:AC.white }}>← Prev</div>
        {Array.from({length:show},(_,i)=>i+1).map(p => (
          <div key={p} style={{ width:27, height:27, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', background:p===page?AC.primary:AC.white, border:`1.5px solid ${p===page?AC.primary:AC.border}`, fontSize:12, fontWeight:p===page?700:500, color:p===page?'#fff':AC.body, cursor:'pointer', fontFamily:'Montserrat' }}>{p}</div>
        ))}
        <div style={{ height:27, padding:'0 10px', display:'flex', alignItems:'center', borderRadius:6, border:`1.5px solid ${AC.border}`, fontSize:12, fontWeight:500, color:AC.body, cursor:'pointer', fontFamily:'Montserrat', background:AC.white }}>Next →</div>
      </div>
    </div>
  );
}

function ASelect({ value, width }) {
  return (
    <div style={{ height:32, border:`1.5px solid ${AC.border}`, borderRadius:7, padding:'0 10px', fontFamily:'Montserrat', fontSize:13, color:AC.body, background:AC.white, display:'flex', alignItems:'center', gap:8, width:width||'auto', cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
      <span style={{ flex:1 }}>{value}</span>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke={AC.muted} strokeWidth="2" strokeLinecap="round"/></svg>
    </div>
  );
}

function AInput({ placeholder, width }) {
  return <input readOnly placeholder={placeholder} style={{ height:32, border:`1.5px solid ${AC.border}`, borderRadius:7, padding:'0 11px', fontFamily:'Montserrat', fontSize:13, color:AC.muted, background:AC.white, outline:'none', width:width||'auto', flexShrink:0 }}/>;
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Admin Login
// ════════════════════════════════════════════════════════════════════════════
function AdminScreen1Login() {
  return (
    <div style={{ width:1440, height:900, background:AC.surface, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Montserrat', backgroundImage:'radial-gradient(circle at 1px 1px, rgba(35,114,185,0.06) 1px, transparent 0)', backgroundSize:'28px 28px' }}>
      <div style={{ width:420, background:AC.white, borderRadius:14, border:`1px solid ${AC.border}`, padding:'48px 44px', boxShadow:'0 8px 48px rgba(0,0,0,0.08)' }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:36 }}>
          <div style={{ width:52, height:52, background:AC.primary, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14, boxShadow:`0 6px 20px rgba(35,114,185,0.3)` }}>
            <span style={{ fontSize:20, fontWeight:900, color:'#fff', fontFamily:'Montserrat', letterSpacing:'-0.5px' }}>Pii</span>
          </div>
          <div style={{ fontSize:17, fontWeight:700, color:AC.body }}>PiiPharma Admin</div>
          <div style={{ fontSize:12, color:AC.muted, marginTop:3 }}>loyalty.piipharma.com/admin</div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:18, marginBottom:24 }}>
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:AC.body, display:'block', marginBottom:6 }}>Email address</label>
            <input readOnly defaultValue="admin@piipharma.com" style={{ width:'100%', height:40, border:`2px solid ${AC.primary}`, borderRadius:8, padding:'0 14px', fontFamily:'Montserrat', fontSize:14, color:AC.body, boxShadow:`0 0 0 3px ${AC.primaryLight}`, outline:'none', background:AC.white }}/>
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:AC.body, display:'block', marginBottom:6 }}>Password</label>
            <div style={{ position:'relative' }}>
              <input readOnly defaultValue="••••••••••" style={{ width:'100%', height:40, border:`2px solid ${AC.border}`, borderRadius:8, padding:'0 42px 0 14px', fontFamily:'Montserrat', fontSize:16, color:AC.body, outline:'none', background:AC.white }}/>
              <div style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', cursor:'pointer' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={AC.muted} strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke={AC.muted} strokeWidth="2"/></svg>
              </div>
            </div>
          </div>
        </div>
        <button style={{ width:'100%', height:42, background:AC.primary, color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:700, fontFamily:'Montserrat', cursor:'pointer' }}>Sign In</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Overview Dashboard
// ════════════════════════════════════════════════════════════════════════════
function AdminScreen2Dashboard() {
  const stats = [
    { label:'Pending Claims',      value:'47',        sub:'Awaiting review',         accent:AC.warning },
    { label:'Approved This Cycle', value:'124',       sub:'Since 1 Apr 2025',        accent:AC.success },
    { label:'Total Retailers',     value:'312',       sub:'+8 registered this week', accent:AC.primary },
    { label:'Coupon Submissions',  value:'1,843',     sub:'All time total',          accent:AC.secondary },
    { label:'Cashback Queued',     value:'₹3,84,200', sub:'Ready for payout',        accent:AC.error },
  ];
  const products = [
    { name:'Amoxicillin 500mg',    required:5, pending:18, approved:42, submitted:300 },
    { name:'Paracetamol 650mg',    required:5, pending:12, approved:56, submitted:340 },
    { name:'Metformin 500mg',      required:5, pending:8,  approved:31, submitted:195 },
    { name:'Azithromycin 500mg',   required:5, pending:5,  approved:19, submitted:120 },
    { name:'Ciprofloxacin 500mg',  required:5, pending:3,  approved:11, submitted:70  },
    { name:'Atorvastatin 10mg',    required:5, pending:1,  approved:7,  submitted:40  },
  ];
  return (
    <AdminLayout active="dashboard">
      <div style={{ flex:1, overflowY:'auto', padding:'32px 36px' }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:AC.body, marginBottom:24 }}>Dashboard</h1>
        <div style={{ display:'flex', gap:16, marginBottom:28 }}>
          {stats.map((s,i) => <StatCard key={i} {...s}/>)}
        </div>
        <div style={{ background:AC.white, borderRadius:10, border:`1px solid ${AC.border}`, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ padding:'13px 18px', borderBottom:`1px solid ${AC.border}` }}>
            <h2 style={{ fontSize:14, fontWeight:700, color:AC.body }}>By Product</h2>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <THead cols={['Product','Coupons Required','Pending Claims','Approved Claims','Total Coupons Submitted']}/>
            <tbody>
              {products.map((p,i) => (
                <TR key={i}>
                  <TD style={{ fontWeight:600 }}>{p.name}</TD>
                  <TD>{p.required}</TD>
                  <TD><span style={{ color:p.pending>10?AC.warning:AC.body, fontWeight:p.pending>10?700:400 }}>{p.pending}</span></TD>
                  <TD><span style={{ color:AC.success, fontWeight:600 }}>{p.approved}</span></TD>
                  <TD>{p.submitted.toLocaleString('en-IN')}</TD>
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
// SCREEN 3 — Claims Queue (Pending)
// ════════════════════════════════════════════════════════════════════════════
const CLAIMS_PENDING = [
  { id:'CLM-0891', retailer:'Rajesh Kumar',    mobile:'98765 43210', product:'Amoxicillin 500mg',   date:'23 Apr 2025', amount:'₹100' },
  { id:'CLM-0890', retailer:'Sunita Devi',     mobile:'87654 32109', product:'Paracetamol 650mg',   date:'22 Apr 2025', amount:'₹60'  },
  { id:'CLM-0889', retailer:'Mohammad Ali',    mobile:'76543 21098', product:'Metformin 500mg',     date:'22 Apr 2025', amount:'₹80'  },
  { id:'CLM-0888', retailer:'Priya Sharma',    mobile:'96543 21087', product:'Amoxicillin 500mg',   date:'21 Apr 2025', amount:'₹100' },
  { id:'CLM-0887', retailer:'Deepa Nair',      mobile:'95432 10976', product:'Azithromycin 500mg',  date:'21 Apr 2025', amount:'₹120' },
  { id:'CLM-0886', retailer:'Vikram Singh',    mobile:'94321 09865', product:'Ciprofloxacin 500mg', date:'20 Apr 2025', amount:'₹90'  },
  { id:'CLM-0885', retailer:'Kavitha Rajan',   mobile:'93210 98754', product:'Paracetamol 650mg',   date:'20 Apr 2025', amount:'₹60'  },
  { id:'CLM-0884', retailer:'Amit Patel',      mobile:'92109 87643', product:'Atorvastatin 10mg',   date:'19 Apr 2025', amount:'₹150' },
];

function ClaimsTabBar({ active }) {
  return (
    <div style={{ display:'flex', borderBottom:`2px solid ${AC.border}`, marginBottom:18 }}>
      {[{id:'pending',label:'Pending',badge:'47'},{id:'all',label:'All Claims'}].map(t => {
        const on = t.id === active;
        return (
          <div key={t.id} style={{ padding:'8px 20px', fontSize:13, fontWeight:on?700:500, color:on?AC.primary:AC.muted, borderBottom:on?`2px solid ${AC.primary}`:'2px solid transparent', marginBottom:-2, cursor:'pointer', fontFamily:'Montserrat', display:'flex', alignItems:'center', gap:7 }}>
            {t.label}
            {t.badge && <span style={{ background:'#fef3cd', color:'#92640a', borderRadius:99, padding:'1px 7px', fontSize:11, fontWeight:700 }}>{t.badge}</span>}
          </div>
        );
      })}
    </div>
  );
}

function AdminScreen3Claims() {
  return (
    <AdminLayout active="claims">
      <div style={{ flex:1, overflowY:'auto', padding:'32px 36px' }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:AC.body, marginBottom:16 }}>Claims</h1>
        <ClaimsTabBar active="pending"/>
        <div style={{ display:'flex', gap:10, marginBottom:16, alignItems:'center' }}>
          <ASelect value="All Products" width={180}/>
          <ASelect value="Newest First" width={160}/>
          <div style={{ flex:1 }}/>
          <span style={{ fontSize:12, color:AC.muted }}>47 pending claims</span>
        </div>
        <div style={{ background:AC.white, borderRadius:10, border:`1px solid ${AC.border}`, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <THead cols={['Claim ID','Retailer Name','Mobile','Product','Date Created','Cashback Amount','Action']}/>
            <tbody>
              {CLAIMS_PENDING.map((c,i) => (
                <TR key={i}>
                  <TD><span style={{ fontFamily:'monospace', fontSize:12, color:AC.primary, fontWeight:700 }}>{c.id}</span></TD>
                  <TD style={{ fontWeight:600 }}>{c.retailer}</TD>
                  <TD style={{ color:AC.muted, fontSize:12, fontFamily:'monospace' }}>{c.mobile}</TD>
                  <TD>{c.product}</TD>
                  <TD style={{ color:AC.muted, fontSize:12 }}>{c.date}</TD>
                  <TD style={{ fontWeight:700 }}>{c.amount}</TD>
                  <TD><Btn size="sm">Review</Btn></TD>
                </TR>
              ))}
            </tbody>
          </table>
          <Pagination page={1} total={47}/>
        </div>
      </div>
    </AdminLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Claim Detail (showing Reject state open)
// ════════════════════════════════════════════════════════════════════════════
function AdminScreen4ClaimDetail() {
  const fields = [
    ['Retailer','Rajesh Kumar'],
    ['Mobile','98765 43210'],
    ['City','Indore'],
    ['State','Madhya Pradesh'],
    ['UPI ID','rajesh.kumar@upi'],
    ['Product','Amoxicillin 500mg'],
    ['Cashback Amount','₹100'],
    ['Coupons Required','5'],
    ['Date Created','23 Apr 2025, 10:42 AM'],
  ];
  const serials = ['AMX-001234','AMX-001235','AMX-001236','AMX-001237','AMX-001238'];
  return (
    <AdminLayout active="claims">
      <div style={{ flex:1, overflowY:'auto', padding:'28px 36px' }}>
        {/* Back */}
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:18, cursor:'pointer' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l7-7M5 12l7 7" stroke={AC.primary} strokeWidth="2.2" strokeLinecap="round"/></svg>
          <span style={{ fontSize:13, fontWeight:600, color:AC.primary, fontFamily:'Montserrat' }}>Back to Claims</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:22 }}>
          <h1 style={{ fontSize:21, fontWeight:700, color:AC.body, fontFamily:'Montserrat' }}>Claim #CLM-0891</h1>
          <ABadge status="Pending"/>
        </div>
        <div style={{ display:'flex', gap:20 }}>
          {/* Left — coupon photos */}
          <div style={{ flex:1.65 }}>
            <div style={{ background:AC.white, borderRadius:10, border:`1px solid ${AC.border}`, padding:'18px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize:13, fontWeight:700, color:AC.body, marginBottom:14 }}>
                Coupon Photos&ensp;<span style={{ fontSize:12, fontWeight:500, color:AC.muted }}>5 of 5 required</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10 }}>
                {serials.map((s,i) => (
                  <div key={i}>
                    <div style={{ aspectRatio:'3/4', background:'repeating-linear-gradient(45deg,#f3f3f3,#f3f3f3 5px,#ebebeb 5px,#ebebeb 10px)', borderRadius:7, border:`1px solid ${AC.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'zoom-in', marginBottom:6, position:'relative', overflow:'hidden' }}>
                      <span style={{ fontSize:8, color:'#bbb', fontFamily:'monospace', textAlign:'center', lineHeight:1.5 }}>coupon<br/>photo</span>
                      <div style={{ position:'absolute', bottom:4, right:4, background:'rgba(35,114,185,0.8)', borderRadius:4, padding:'2px 5px', fontSize:8, color:'#fff', fontFamily:'Montserrat', fontWeight:600 }}>View</div>
                    </div>
                    <div style={{ fontSize:8, color:AC.muted, fontFamily:'monospace', textAlign:'center', lineHeight:1.4, wordBreak:'break-all' }}>{s}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Right — details + actions */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:14 }}>
            {/* Details */}
            <div style={{ background:AC.white, borderRadius:10, border:`1px solid ${AC.border}`, padding:'16px 18px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize:13, fontWeight:700, color:AC.body, marginBottom:10 }}>Claim Details</div>
              {fields.map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'5px 0', borderBottom:`1px solid ${AC.border}` }}>
                  <span style={{ fontSize:11, color:AC.muted, fontFamily:'Montserrat', flexShrink:0 }}>{k}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:AC.body, fontFamily:'Montserrat', textAlign:'right', marginLeft:8 }}>{v}</span>
                </div>
              ))}
            </div>
            {/* Actions — Reject state open */}
            <div style={{ background:AC.white, borderRadius:10, border:`1px solid ${AC.border}`, padding:'16px 18px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
              <button style={{ width:'100%', background:'#3d8c1a', color:'#fff', border:'none', borderRadius:7, padding:'10px', fontSize:13, fontWeight:700, fontFamily:'Montserrat', cursor:'pointer', marginBottom:10, opacity:0.35 }}>✓ Approve Claim</button>
              <div style={{ border:`2px solid ${AC.error}`, borderRadius:8, padding:'13px', background:AC.errorLight }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#9b2626', fontFamily:'Montserrat', marginBottom:6 }}>Rejection reason (required)</div>
                <textarea readOnly defaultValue="Coupon serial numbers could not be verified. Please resubmit with a clearer photo of the barcode." style={{ width:'100%', height:72, border:`1.5px solid ${AC.error}`, borderRadius:6, padding:'8px', fontFamily:'Montserrat', fontSize:12, color:AC.body, resize:'none', outline:'none', background:AC.white, lineHeight:1.5 }}/>
                <div style={{ display:'flex', gap:8, marginTop:10 }}>
                  <button style={{ flex:1, background:AC.error, color:'#fff', border:'none', borderRadius:6, padding:'8px', fontSize:12, fontWeight:700, fontFamily:'Montserrat', cursor:'pointer' }}>Confirm Rejection</button>
                  <button style={{ flex:1, background:AC.white, color:AC.body, border:`1.5px solid ${AC.border}`, borderRadius:6, padding:'8px', fontSize:12, fontWeight:600, fontFamily:'Montserrat', cursor:'pointer' }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — All Claims
// ════════════════════════════════════════════════════════════════════════════
const CLAIMS_ALL = [
  { id:'CLM-0891', retailer:'Rajesh Kumar',   mobile:'98765 43210', product:'Amoxicillin 500mg',   date:'23 Apr 2025', amount:'₹100', status:'Pending'  },
  { id:'CLM-0887', retailer:'Deepa Nair',     mobile:'95432 10976', product:'Azithromycin 500mg',  date:'21 Apr 2025', amount:'₹120', status:'Pending'  },
  { id:'CLM-0882', retailer:'Anita Menon',    mobile:'90123 45678', product:'Paracetamol 650mg',   date:'19 Apr 2025', amount:'₹60',  status:'Approved' },
  { id:'CLM-0879', retailer:'Suresh Babu',    mobile:'89012 34567', product:'Metformin 500mg',     date:'18 Apr 2025', amount:'₹80',  status:'Approved' },
  { id:'CLM-0876', retailer:'Kavitha Rajan',  mobile:'93210 98754', product:'Ciprofloxacin 500mg', date:'17 Apr 2025', amount:'₹90',  status:'Rejected' },
  { id:'CLM-0872', retailer:'Mohammad Ali',   mobile:'76543 21098', product:'Amoxicillin 500mg',   date:'16 Apr 2025', amount:'₹100', status:'Paid'     },
  { id:'CLM-0869', retailer:'Priya Sharma',   mobile:'96543 21087', product:'Atorvastatin 10mg',   date:'15 Apr 2025', amount:'₹150', status:'Approved' },
  { id:'CLM-0866', retailer:'Vikram Singh',   mobile:'94321 09865', product:'Paracetamol 650mg',   date:'14 Apr 2025', amount:'₹60',  status:'Paid'     },
];

function AdminScreen5AllClaims() {
  return (
    <AdminLayout active="claims">
      <div style={{ flex:1, overflowY:'auto', padding:'32px 36px' }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:AC.body, marginBottom:16 }}>Claims</h1>
        <ClaimsTabBar active="all"/>
        <div style={{ display:'flex', gap:8, marginBottom:16, alignItems:'center', flexWrap:'wrap' }}>
          <ASelect value="All Products" width={170}/>
          <ASelect value="All Statuses" width={150}/>
          <div style={{ display:'flex', alignItems:'center', gap:6, border:`1.5px solid ${AC.border}`, borderRadius:7, padding:'0 10px', height:32, background:AC.white, flexShrink:0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke={AC.muted} strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke={AC.muted} strokeWidth="2" strokeLinecap="round"/></svg>
            <span style={{ fontSize:12, color:AC.muted, fontFamily:'Montserrat' }}>1 Apr 2025</span>
          </div>
          <span style={{ fontSize:12, color:AC.muted }}>→</span>
          <div style={{ display:'flex', alignItems:'center', gap:6, border:`1.5px solid ${AC.border}`, borderRadius:7, padding:'0 10px', height:32, background:AC.white, flexShrink:0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke={AC.muted} strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke={AC.muted} strokeWidth="2" strokeLinecap="round"/></svg>
            <span style={{ fontSize:12, color:AC.muted, fontFamily:'Montserrat' }}>23 Apr 2025</span>
          </div>
          <ASelect value="Newest First" width={150}/>
          <div style={{ flex:1 }}/>
          <span style={{ fontSize:12, color:AC.muted }}>288 total claims</span>
        </div>
        <div style={{ background:AC.white, borderRadius:10, border:`1px solid ${AC.border}`, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <THead cols={['Claim ID','Retailer Name','Mobile','Product','Date','Cashback','Status','Action']}/>
            <tbody>
              {CLAIMS_ALL.map((c,i) => (
                <TR key={i}>
                  <TD><span style={{ fontFamily:'monospace', fontSize:12, color:AC.primary, fontWeight:700 }}>{c.id}</span></TD>
                  <TD style={{ fontWeight:600 }}>{c.retailer}</TD>
                  <TD style={{ color:AC.muted, fontSize:12, fontFamily:'monospace' }}>{c.mobile}</TD>
                  <TD>{c.product}</TD>
                  <TD style={{ color:AC.muted, fontSize:12 }}>{c.date}</TD>
                  <TD style={{ fontWeight:700 }}>{c.amount}</TD>
                  <TD><ABadge status={c.status}/></TD>
                  <TD>{c.status==='Pending' && <Btn size="sm">Review</Btn>}</TD>
                </TR>
              ))}
            </tbody>
          </table>
          <Pagination page={1} total={288}/>
        </div>
      </div>
    </AdminLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 6 — Retailers
// ════════════════════════════════════════════════════════════════════════════
const RETAILERS = [
  { name:'Rajesh Kumar',   mobile:'98765 43210', city:'Indore',     state:'MP',          upi:'rajesh.kumar@upi',  reg:'12 Jan 2025', claims:8,  cashback:'₹640'   },
  { name:'Sunita Devi',    mobile:'87654 32109', city:'Patna',      state:'Bihar',       upi:'sunita.d@oksbi',    reg:'15 Jan 2025', claims:5,  cashback:'₹380'   },
  { name:'Mohammad Ali',   mobile:'76543 21098', city:'Lucknow',    state:'UP',          upi:'mali123@paytm',     reg:'18 Jan 2025', claims:12, cashback:'₹1,040' },
  { name:'Priya Sharma',   mobile:'96543 21087', city:'Jaipur',     state:'Rajasthan',   upi:'priya.s@upi',       reg:'22 Jan 2025', claims:6,  cashback:'₹520'   },
  { name:'Deepa Nair',     mobile:'95432 10976', city:'Kochi',      state:'Kerala',      upi:'deepan@ybl',        reg:'28 Jan 2025', claims:9,  cashback:'₹860'   },
  { name:'Vikram Singh',   mobile:'94321 09865', city:'Chandigarh', state:'Punjab',      upi:'vikram.s@hdfc',     reg:'2 Feb 2025',  claims:3,  cashback:'₹240'   },
  { name:'Kavitha Rajan',  mobile:'93210 98754', city:'Coimbatore', state:'Tamil Nadu',  upi:'kavitha.r@upi',     reg:'8 Feb 2025',  claims:7,  cashback:'₹560'   },
  { name:'Amit Patel',     mobile:'92109 87643', city:'Ahmedabad',  state:'Gujarat',     upi:'amit.p@oksbi',      reg:'14 Feb 2025', claims:4,  cashback:'₹380'   },
];

function AdminScreen6Retailers() {
  return (
    <AdminLayout active="retailers">
      <div style={{ flex:1, overflowY:'auto', padding:'32px 36px' }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:AC.body, marginBottom:20 }}>Retailers</h1>
        <div style={{ marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', border:`1.5px solid ${AC.border}`, borderRadius:8, background:AC.white, overflow:'hidden', width:340 }}>
            <div style={{ padding:'0 12px', display:'flex', alignItems:'center', flexShrink:0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke={AC.muted} strokeWidth="2"/><path d="M21 21l-4-4" stroke={AC.muted} strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <input readOnly placeholder="Search by name or mobile number" style={{ flex:1, height:34, border:'none', outline:'none', fontFamily:'Montserrat', fontSize:13, color:AC.body, background:'transparent' }}/>
          </div>
        </div>
        <div style={{ background:AC.white, borderRadius:10, border:`1px solid ${AC.border}`, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <THead cols={['Name','Mobile','City','State','UPI ID','Registered On','Total Claims','Cashback Earned']}/>
            <tbody>
              {RETAILERS.map((r,i) => (
                <TR key={i}>
                  <TD style={{ fontWeight:600 }}>{r.name}</TD>
                  <TD style={{ fontSize:12, fontFamily:'monospace', color:AC.muted }}>{r.mobile}</TD>
                  <TD>{r.city}</TD>
                  <TD style={{ color:AC.muted }}>{r.state}</TD>
                  <TD style={{ fontSize:11, fontFamily:'monospace', color:AC.muted }}>{r.upi}</TD>
                  <TD style={{ color:AC.muted, fontSize:12 }}>{r.reg}</TD>
                  <TD style={{ fontWeight:600, textAlign:'center' }}>{r.claims}</TD>
                  <TD style={{ fontWeight:700 }}>{r.cashback}</TD>
                </TR>
              ))}
            </tbody>
          </table>
          <Pagination page={1} total={312}/>
        </div>
      </div>
    </AdminLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 7 — Products (card index 1 = edit mode)
// ════════════════════════════════════════════════════════════════════════════
const PRODUCTS_DATA = [
  { name:'Amoxicillin 500mg',   required:5, cashback:100, submitted:300, claims:60 },
  { name:'Paracetamol 650mg',   required:5, cashback:60,  submitted:340, claims:68 },
  { name:'Metformin 500mg',     required:5, cashback:80,  submitted:195, claims:39 },
  { name:'Azithromycin 500mg',  required:5, cashback:120, submitted:120, claims:24 },
  { name:'Ciprofloxacin 500mg', required:5, cashback:90,  submitted:70,  claims:14 },
  { name:'Atorvastatin 10mg',   required:5, cashback:150, submitted:40,  claims:8  },
];

function AdminScreen7Products() {
  return (
    <AdminLayout active="products">
      <div style={{ flex:1, overflowY:'auto', padding:'32px 36px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <h1 style={{ fontSize:22, fontWeight:700, color:AC.body }}>Products</h1>
          <Btn variant="primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
            Add Product
          </Btn>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18 }}>
          {PRODUCTS_DATA.map((p,i) => {
            const editing = i === 1;
            return (
              <div key={i} style={{ background:AC.white, borderRadius:10, border:`${editing?2:1}px solid ${editing?AC.primary:AC.border}`, padding:'18px 20px', boxShadow:editing?`0 0 0 3px ${AC.primaryLight}`:'0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:AC.body, lineHeight:1.3 }}>{p.name}</div>
                  {!editing && <Btn size="sm" variant="outline">Edit</Btn>}
                  {editing && <span style={{ fontSize:11, fontWeight:700, color:AC.primary, fontFamily:'Montserrat', background:AC.primaryLight, padding:'3px 8px', borderRadius:99 }}>Editing</span>}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
                  <div style={{ background:AC.surface, borderRadius:7, padding:'10px 12px' }}>
                    <div style={{ fontSize:9, fontWeight:700, color:AC.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>Coupons Req.</div>
                    {editing
                      ? <input defaultValue={p.required} style={{ width:'100%', border:`2px solid ${AC.primary}`, borderRadius:6, padding:'4px 8px', fontFamily:'Montserrat', fontSize:16, fontWeight:700, color:AC.body, outline:'none', background:AC.white }}/>
                      : <div style={{ fontSize:18, fontWeight:700, color:AC.body }}>{p.required}</div>
                    }
                  </div>
                  <div style={{ background:AC.surface, borderRadius:7, padding:'10px 12px' }}>
                    <div style={{ fontSize:9, fontWeight:700, color:AC.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>Cashback (₹)</div>
                    {editing
                      ? <input defaultValue={p.cashback} style={{ width:'100%', border:`2px solid ${AC.primary}`, borderRadius:6, padding:'4px 8px', fontFamily:'Montserrat', fontSize:16, fontWeight:700, color:AC.primary, outline:'none', background:AC.white }}/>
                      : <div style={{ fontSize:18, fontWeight:700, color:AC.primary }}>₹{p.cashback}</div>
                    }
                  </div>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:editing?14:0 }}>
                  <div>
                    <div style={{ fontSize:9, color:AC.muted, textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:700 }}>Coupons Submitted</div>
                    <div style={{ fontSize:14, fontWeight:600, color:AC.body, marginTop:3 }}>{p.submitted}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:9, color:AC.muted, textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:700 }}>Claims Triggered</div>
                    <div style={{ fontSize:14, fontWeight:600, color:AC.body, marginTop:3 }}>{p.claims}</div>
                  </div>
                </div>
                {editing && (
                  <div style={{ display:'flex', gap:8 }}>
                    <button style={{ flex:1, background:'#3d8c1a', color:'#fff', border:'none', borderRadius:7, padding:'9px', fontSize:12, fontWeight:700, fontFamily:'Montserrat', cursor:'pointer' }}>Save</button>
                    <button style={{ flex:1, background:AC.white, color:AC.body, border:`1.5px solid ${AC.border}`, borderRadius:7, padding:'9px', fontSize:12, fontWeight:600, fontFamily:'Montserrat', cursor:'pointer' }}>Cancel</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 8 — Payouts
// ════════════════════════════════════════════════════════════════════════════
const PAYOUT_CLAIMS = [
  { id:'CLM-0882', retailer:'Anita Menon',      upi:'anita.m@oksbi',   product:'Paracetamol 650mg',   amount:'₹60',  approved:'19 Apr 2025' },
  { id:'CLM-0879', retailer:'Suresh Babu',      upi:'suresh.b@upi',    product:'Metformin 500mg',     amount:'₹80',  approved:'18 Apr 2025' },
  { id:'CLM-0869', retailer:'Priya Sharma',     upi:'priya.s@upi',     product:'Atorvastatin 10mg',   amount:'₹150', approved:'15 Apr 2025' },
  { id:'CLM-0863', retailer:'Nandita Roy',      upi:'nandita.r@hdfc',  product:'Amoxicillin 500mg',   amount:'₹100', approved:'13 Apr 2025' },
  { id:'CLM-0857', retailer:'Ravi Teja',        upi:'ravi.t@paytm',    product:'Azithromycin 500mg',  amount:'₹120', approved:'11 Apr 2025' },
  { id:'CLM-0851', retailer:'Sunita Devi',      upi:'sunita.d@oksbi',  product:'Amoxicillin 500mg',   amount:'₹100', approved:'9 Apr 2025'  },
  { id:'CLM-0844', retailer:'Mohan Lal',        upi:'mohan.l@upi',     product:'Ciprofloxacin 500mg', amount:'₹90',  approved:'7 Apr 2025'  },
  { id:'CLM-0838', retailer:'Vijaya Lakshmi',   upi:'vijaya.l@ybl',    product:'Paracetamol 650mg',   amount:'₹60',  approved:'5 Apr 2025'  },
];

const PAYOUT_HISTORY = [
  { date:'31 Mar 2025', claims:24, total:'₹2,14,800', file:'payout_20250331.csv' },
  { date:'28 Feb 2025', claims:18, total:'₹1,62,000', file:'payout_20250228.csv' },
  { date:'31 Jan 2025', claims:12, total:'₹98,400',   file:'payout_20250131.csv' },
];

function AdminScreen8Payouts() {
  return (
    <AdminLayout active="payouts">
      <div style={{ flex:1, overflowY:'auto', padding:'32px 36px' }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:AC.body, marginBottom:18 }}>Payouts</h1>
        {/* Summary bar */}
        <div style={{ background:AC.primaryLight, border:`1.5px solid ${AC.primary}`, borderRadius:10, padding:'13px 18px', marginBottom:18, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:13, fontWeight:600, color:AC.primaryDark, fontFamily:'Montserrat' }}>
            124 approved claims ready for payout — Total:&ensp;<strong style={{ fontSize:16 }}>₹3,84,200</strong>
          </span>
          <ABadge status="Approved"/>
        </div>
        {/* Export button + note */}
        <div style={{ marginBottom:20 }}>
          <button style={{ background:AC.primary, color:'#fff', border:'none', borderRadius:8, padding:'12px 22px', fontSize:14, fontWeight:700, fontFamily:'Montserrat', cursor:'pointer', boxShadow:`0 4px 16px rgba(35,114,185,0.28)`, display:'inline-flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><path d="M7 10l5 5 5-5M12 15V3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Export CSV for Cashfree
          </button>
          <div style={{ fontSize:12, color:AC.muted, fontFamily:'Montserrat' }}>After uploading to Cashfree, claims will be marked as Paid and removed from this list.</div>
        </div>
        {/* Payouts table */}
        <div style={{ background:AC.white, borderRadius:10, border:`1px solid ${AC.border}`, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', marginBottom:28 }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding:'9px 14px', width:40, borderBottom:`2px solid ${AC.border}`, background:AC.white }}>
                  <input type="checkbox" defaultChecked style={{ cursor:'pointer', width:14, height:14 }}/>
                </th>
                {['Claim ID','Retailer Name','UPI ID','Product','Cashback Amount','Approved On'].map(h => (
                  <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:AC.muted, textTransform:'uppercase', letterSpacing:'0.06em', borderBottom:`2px solid ${AC.border}`, background:AC.white, fontFamily:'Montserrat', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PAYOUT_CLAIMS.map((c,i) => (
                <TR key={i}>
                  <TD><input type="checkbox" defaultChecked style={{ cursor:'pointer', width:14, height:14 }}/></TD>
                  <TD><span style={{ fontFamily:'monospace', fontSize:12, color:AC.primary, fontWeight:700 }}>{c.id}</span></TD>
                  <TD style={{ fontWeight:600 }}>{c.retailer}</TD>
                  <TD style={{ fontSize:11, fontFamily:'monospace', color:AC.muted }}>{c.upi}</TD>
                  <TD>{c.product}</TD>
                  <TD style={{ fontWeight:700 }}>{c.amount}</TD>
                  <TD style={{ color:AC.muted, fontSize:12 }}>{c.approved}</TD>
                </TR>
              ))}
            </tbody>
          </table>
          <Pagination page={1} total={124}/>
        </div>
        {/* Payout History */}
        <h2 style={{ fontSize:15, fontWeight:700, color:AC.body, fontFamily:'Montserrat', marginBottom:14 }}>Payout History</h2>
        <div style={{ background:AC.white, borderRadius:10, border:`1px solid ${AC.border}`, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <THead cols={['Export Date','Claims in Batch','Total Amount','Download']}/>
            <tbody>
              {PAYOUT_HISTORY.map((h,i) => (
                <TR key={i}>
                  <TD style={{ fontWeight:600 }}>{h.date}</TD>
                  <TD>{h.claims}</TD>
                  <TD style={{ fontWeight:700 }}>{h.total}</TD>
                  <TD>
                    <a href="#" style={{ color:AC.primary, fontWeight:600, fontSize:12, fontFamily:'Montserrat', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:5 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={AC.primary} strokeWidth="2" strokeLinecap="round"/><path d="M7 10l5 5 5-5M12 15V3" stroke={AC.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Download CSV
                    </a>
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

// Export all
Object.assign(window, {
  AdminScreen1Login, AdminScreen2Dashboard, AdminScreen3Claims,
  AdminScreen4ClaimDetail, AdminScreen5AllClaims, AdminScreen6Retailers,
  AdminScreen7Products, AdminScreen8Payouts,
});
