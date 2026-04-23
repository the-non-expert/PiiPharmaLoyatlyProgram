---
pdf_options:
  format: A4
  margin: 15mm
css: |
  body { font-family: Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #1a1a1a; }
  h1 { font-size: 22px; margin-bottom: 6px; }
  h2 { font-size: 17px; margin-top: 20px; margin-bottom: 8px; page-break-after: avoid; break-after: avoid; }
  h3 { font-size: 14px; margin-top: 16px; margin-bottom: 6px; page-break-after: avoid; break-after: avoid; }
  svg { page-break-inside: avoid; break-inside: avoid; max-width: 100%; display: block; margin: 12px 0; }
  p { margin: 6px 0 10px 0; }
  ul { margin: 6px 0; padding-left: 20px; }
  li { margin-bottom: 4px; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0; }
  td, th { border: 1px solid #e0e0e0; padding: 7px 12px; font-size: 12px; }
  th { background: #f5f5f5; font-weight: 600; }
  hr { border: none; border-top: 1px solid #e0e0e0; margin: 16px 0; }
  code { font-size: 11px; background: #f5f5f5; padding: 1px 4px; border-radius: 3px; }
  strong { font-weight: 700; }
---
# Retailer Loyalty Program — Assessment & Recommendation
**Prepared by:** Ayush Jhunjhunwala &nbsp;|&nbsp; **Date:** April 15, 2026 &nbsp;|&nbsp; **For:** PiiPharma (`piipharma.com`)

---

## 1. Purpose

This report assesses the current state of PiiPharma's retailer loyalty program, identifies operational and regulatory considerations, and recommends a path forward. Findings are based on independent research into current RBI and NPCI guidelines as of April 2026.

---

## 2. Current Workflow

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 345" style="max-width:300px; display:block;">
  <defs>
    <marker id="arr1" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#6B7280"/>
    </marker>
  </defs>
  <rect x="50" y="12" width="200" height="46" rx="23" fill="#D1FAE5" stroke="#10B981" stroke-width="1.5"/>
  <text x="150" y="31" text-anchor="middle" font-family="Arial" font-size="12" font-weight="700" fill="#065F46">Retailer</text>
  <text x="150" y="49" text-anchor="middle" font-family="Arial" font-size="10.5" fill="#065F46">sends coupon via WhatsApp</text>
  <line x1="150" y1="58" x2="150" y2="78" stroke="#6B7280" stroke-width="1.5" marker-end="url(#arr1)"/>
  <rect x="50" y="80" width="200" height="46" rx="8" fill="#DBEAFE" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="150" y="99" text-anchor="middle" font-family="Arial" font-size="12" font-weight="700" fill="#1E3A5F">Company</text>
  <text x="150" y="117" text-anchor="middle" font-family="Arial" font-size="10.5" fill="#1E3A5F">WhatsApp number</text>
  <line x1="150" y1="126" x2="150" y2="146" stroke="#6B7280" stroke-width="1.5" marker-end="url(#arr1)"/>
  <rect x="50" y="148" width="200" height="46" rx="8" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
  <text x="150" y="167" text-anchor="middle" font-family="Arial" font-size="12" font-weight="700" fill="#78350F">Employee</text>
  <text x="150" y="185" text-anchor="middle" font-family="Arial" font-size="10.5" fill="#78350F">manually logs into Excel</text>
  <line x1="150" y1="194" x2="150" y2="214" stroke="#6B7280" stroke-width="1.5" marker-end="url(#arr1)"/>
  <rect x="50" y="216" width="200" height="46" rx="8" fill="#DBEAFE" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="150" y="235" text-anchor="middle" font-family="Arial" font-size="12" font-weight="700" fill="#1E3A5F">Cashfree Dashboard</text>
  <text x="150" y="253" text-anchor="middle" font-family="Arial" font-size="10.5" fill="#1E3A5F">CSV copy-pasted manually</text>
  <line x1="150" y1="262" x2="150" y2="282" stroke="#6B7280" stroke-width="1.5" marker-end="url(#arr1)"/>
  <rect x="50" y="284" width="200" height="46" rx="23" fill="#D1FAE5" stroke="#10B981" stroke-width="1.5"/>
  <text x="150" y="303" text-anchor="middle" font-family="Arial" font-size="12" font-weight="700" fill="#065F46">Retailer</text>
  <text x="150" y="321" text-anchor="middle" font-family="Arial" font-size="10.5" fill="#065F46">receives cashback via UPI</text>
</svg>

**Current program details:**
- 6–7 products, approximately 5,000 physical coupons per product
- Some products require multiple coupons per claim (e.g. 5 coupons = ₹100 cashback)
- Coupon authenticity verified manually by the employee reviewing the WhatsApp photo
- Approximately 1,000 active retailers across the program

---

## 3. The Core Problems

### A. Operational Limitations

The current workflow is fully manual and functions well at present. The limitations are around precision and scale:

- The Excel sheet is the programme's database — if a serial number is entered incorrectly or a row is accidentally deleted, there is no way to recover it. An automated system removes this single point of human error entirely.
- There is no management visibility into redemption trends, top-performing regions, or per-product claim volumes — all of that currently requires manually sifting through the Excel sheet
- As the programme grows, the manual workload on the single employee grows proportionally with it

### B. Regulatory Landscape — Bulk UPI Payouts

RBI and NPCI have introduced significant changes to digital payment infrastructure through 2025–2026:

- **September 2025** — RBI's new Master Direction on Payment Aggregators tightened compliance requirements for all entities facilitating bulk digital disbursals. Platforms without RBI authorisation were required to wind down by February 28, 2026.
- **February 2026** — NPCI deprecated the UPI Collect flow for Person-to-Merchant transactions, a method used in many bulk payout pipelines.
- **April 2026** — All domestic digital payments now require two-factor dynamic authentication, adding operational complexity to automated UPI flows.

Cashfree, as a licensed Payment Aggregator, currently handles this compliance. The risk is not immediate — but the regulatory direction is clear, and having no alternative in place is an exposure worth addressing now rather than reactively.

---

## 4. Recommended Solution

A dedicated loyalty portal at `loyalty.piipharma.com` — a lightweight web application separate from the existing website. The current piipharma.com marketing site remains completely unchanged.

### Retailer Onboarding

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 345" style="max-width:300px; display:block;">
  <defs>
    <marker id="arr2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#6B7280"/>
    </marker>
  </defs>
  <rect x="50" y="12" width="200" height="46" rx="23" fill="#D1FAE5" stroke="#10B981" stroke-width="1.5"/>
  <text x="150" y="31" text-anchor="middle" font-family="Arial" font-size="12" font-weight="700" fill="#065F46">Visit portal</text>
  <text x="150" y="49" text-anchor="middle" font-family="Arial" font-size="10.5" fill="#065F46">loyalty.piipharma.com</text>
  <line x1="150" y1="58" x2="150" y2="78" stroke="#6B7280" stroke-width="1.5" marker-end="url(#arr2)"/>
  <rect x="50" y="80" width="200" height="46" rx="8" fill="#DBEAFE" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="150" y="99" text-anchor="middle" font-family="Arial" font-size="12" font-weight="700" fill="#1E3A5F">Enter mobile number</text>
  <line x1="150" y1="126" x2="150" y2="146" stroke="#6B7280" stroke-width="1.5" marker-end="url(#arr2)"/>
  <rect x="50" y="148" width="200" height="46" rx="8" fill="#DBEAFE" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="150" y="165" text-anchor="middle" font-family="Arial" font-size="12" font-weight="700" fill="#1E3A5F">Receive OTP via WhatsApp</text>
  <text x="150" y="183" text-anchor="middle" font-family="Arial" font-size="10" fill="#9CA3AF">SMS fallback if WhatsApp fails</text>
  <line x1="150" y1="194" x2="150" y2="214" stroke="#6B7280" stroke-width="1.5" marker-end="url(#arr2)"/>
  <rect x="50" y="216" width="200" height="46" rx="8" fill="#DBEAFE" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="150" y="235" text-anchor="middle" font-family="Arial" font-size="12" font-weight="700" fill="#1E3A5F">Enter name and UPI ID</text>
  <text x="150" y="253" text-anchor="middle" font-family="Arial" font-size="10.5" fill="#1E3A5F">Saved for all future claims</text>
  <line x1="150" y1="262" x2="150" y2="282" stroke="#6B7280" stroke-width="1.5" marker-end="url(#arr2)"/>
  <rect x="50" y="284" width="200" height="46" rx="23" fill="#D1FAE5" stroke="#10B981" stroke-width="1.5"/>
  <text x="150" y="303" text-anchor="middle" font-family="Arial" font-size="12" font-weight="700" fill="#065F46">Registered</text>
  <text x="150" y="321" text-anchor="middle" font-family="Arial" font-size="10.5" fill="#065F46">ready to submit claims</text>
</svg>

One-time setup. Under two minutes. No passwords, no documents.

### Coupon Submission

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 220" style="display:block; width:100%;">
  <defs>
    <marker id="arr3" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#6B7280"/>
    </marker>
  </defs>
  <!-- Node 1: Retailer logs in (pill) -->
  <rect x="10" y="67" width="120" height="46" rx="23" fill="#D1FAE5" stroke="#10B981" stroke-width="1.5"/>
  <text x="70" y="94" text-anchor="middle" font-family="Arial" font-size="11.5" font-weight="700" fill="#065F46">Retailer logs in</text>
  <!-- Arrow -->
  <line x1="130" y1="90" x2="148" y2="90" stroke="#6B7280" stroke-width="1.5" marker-end="url(#arr3)"/>
  <!-- Node 2: Selects product -->
  <rect x="150" y="64" width="140" height="52" rx="8" fill="#DBEAFE" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="220" y="84" text-anchor="middle" font-family="Arial" font-size="11.5" font-weight="700" fill="#1E3A5F">Selects product</text>
  <text x="220" y="101" text-anchor="middle" font-family="Arial" font-size="9.5" fill="#1E3A5F">Shows coupons required</text>
  <!-- Arrow -->
  <line x1="290" y1="90" x2="308" y2="90" stroke="#6B7280" stroke-width="1.5" marker-end="url(#arr3)"/>
  <!-- Node 3: Uploads photo + serial -->
  <rect x="310" y="64" width="148" height="52" rx="8" fill="#DBEAFE" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="384" y="84" text-anchor="middle" font-family="Arial" font-size="11.5" font-weight="700" fill="#1E3A5F">Uploads coupon photo</text>
  <text x="384" y="101" text-anchor="middle" font-family="Arial" font-size="9.5" fill="#1E3A5F">Enters serial number(s)</text>
  <!-- Arrow -->
  <line x1="458" y1="90" x2="472" y2="90" stroke="#6B7280" stroke-width="1.5" marker-end="url(#arr3)"/>
  <!-- Diamond: Serial used? center=(530,90) -->
  <polygon points="474,90 530,47 586,90 530,133" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
  <text x="530" y="85" text-anchor="middle" font-family="Arial" font-size="10.5" font-weight="700" fill="#78350F">Serial</text>
  <text x="530" y="100" text-anchor="middle" font-family="Arial" font-size="10.5" font-weight="700" fill="#78350F">used?</text>
  <!-- Yes branch (down) -->
  <line x1="530" y1="133" x2="530" y2="163" stroke="#6B7280" stroke-width="1.5" marker-end="url(#arr3)"/>
  <text x="543" y="152" font-family="Arial" font-size="9.5" fill="#6B7280">Yes</text>
  <rect x="469" y="165" width="122" height="42" rx="8" fill="#FEE2E2" stroke="#EF4444" stroke-width="1.5"/>
  <text x="530" y="182" text-anchor="middle" font-family="Arial" font-size="11" font-weight="700" fill="#7F1D1D">Claim</text>
  <text x="530" y="198" text-anchor="middle" font-family="Arial" font-size="9.5" fill="#7F1D1D">auto-rejected</text>
  <!-- No branch (right) -->
  <line x1="586" y1="90" x2="614" y2="90" stroke="#6B7280" stroke-width="1.5" marker-end="url(#arr3)"/>
  <text x="600" y="82" text-anchor="middle" font-family="Arial" font-size="9.5" fill="#6B7280">No</text>
  <!-- Node 5: Admin queue -->
  <rect x="616" y="67" width="118" height="46" rx="8" fill="#D1FAE5" stroke="#10B981" stroke-width="1.5"/>
  <text x="675" y="83" text-anchor="middle" font-family="Arial" font-size="11" font-weight="700" fill="#065F46">Enters admin</text>
  <text x="675" y="100" text-anchor="middle" font-family="Arial" font-size="9.5" fill="#065F46">review queue</text>
</svg>

### Admin Verification & Payout

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 770 230" style="display:block; width:100%;">
  <defs>
    <marker id="arr4" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#6B7280"/>
    </marker>
  </defs>
  <!-- Row 1: Admin opens dashboard (pill) -->
  <rect x="10" y="55" width="145" height="46" rx="23" fill="#FFEDD5" stroke="#F97316" stroke-width="1.5"/>
  <text x="82" y="72" text-anchor="middle" font-family="Arial" font-size="11" font-weight="700" fill="#7C2D12">Admin opens</text>
  <text x="82" y="88" text-anchor="middle" font-family="Arial" font-size="11" font-weight="700" fill="#7C2D12">dashboard</text>
  <!-- Arrow -->
  <line x1="155" y1="78" x2="173" y2="78" stroke="#6B7280" stroke-width="1.5" marker-end="url(#arr4)"/>
  <!-- Reviews pending claim -->
  <rect x="175" y="52" width="152" height="52" rx="8" fill="#DBEAFE" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="251" y="72" text-anchor="middle" font-family="Arial" font-size="11.5" font-weight="700" fill="#1E3A5F">Reviews pending claim</text>
  <text x="251" y="89" text-anchor="middle" font-family="Arial" font-size="9" fill="#1E3A5F">photo · serial · retailer · product</text>
  <!-- Arrow -->
  <line x1="327" y1="78" x2="343" y2="78" stroke="#6B7280" stroke-width="1.5" marker-end="url(#arr4)"/>
  <!-- Diamond: Decision center=(400,78) -->
  <polygon points="345,78 400,35 455,78 400,121" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
  <text x="400" y="82" text-anchor="middle" font-family="Arial" font-size="12" font-weight="700" fill="#78350F">Decision</text>
  <!-- Reject branch (right) -->
  <line x1="455" y1="78" x2="480" y2="78" stroke="#6B7280" stroke-width="1.5" marker-end="url(#arr4)"/>
  <text x="467" y="70" text-anchor="middle" font-family="Arial" font-size="9.5" fill="#6B7280">Reject</text>
  <!-- Flagged box -->
  <rect x="482" y="55" width="92" height="46" rx="8" fill="#FEE2E2" stroke="#EF4444" stroke-width="1.5"/>
  <text x="528" y="72" text-anchor="middle" font-family="Arial" font-size="11.5" font-weight="700" fill="#7F1D1D">Flagged</text>
  <text x="528" y="88" text-anchor="middle" font-family="Arial" font-size="9.5" fill="#7F1D1D">with reason</text>
  <!-- Approve branch (down) -->
  <line x1="400" y1="121" x2="400" y2="163" stroke="#6B7280" stroke-width="1.5" marker-end="url(#arr4)"/>
  <text x="414" y="145" font-family="Arial" font-size="9.5" fill="#6B7280">Approve</text>
  <!-- Row 2: Payout queue -->
  <rect x="340" y="165" width="120" height="46" rx="8" fill="#D1FAE5" stroke="#10B981" stroke-width="1.5"/>
  <text x="400" y="194" text-anchor="middle" font-family="Arial" font-size="11" font-weight="700" fill="#065F46">Payout queue</text>
  <!-- Arrow -->
  <line x1="460" y1="188" x2="478" y2="188" stroke="#6B7280" stroke-width="1.5" marker-end="url(#arr4)"/>
  <!-- Exports & uploads box -->
  <rect x="480" y="165" width="148" height="46" rx="8" fill="#DBEAFE" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="554" y="183" text-anchor="middle" font-family="Arial" font-size="11" font-weight="700" fill="#1E3A5F">Exports &amp; uploads</text>
  <text x="554" y="200" text-anchor="middle" font-family="Arial" font-size="9.5" fill="#1E3A5F">to Cashfree</text>
  <!-- Arrow -->
  <line x1="628" y1="188" x2="646" y2="188" stroke="#6B7280" stroke-width="1.5" marker-end="url(#arr4)"/>
  <!-- Retailer receives pill -->
  <rect x="648" y="165" width="115" height="46" rx="23" fill="#D1FAE5" stroke="#10B981" stroke-width="1.5"/>
  <text x="705" y="183" text-anchor="middle" font-family="Arial" font-size="11" font-weight="700" fill="#065F46">Retailer receives</text>
  <text x="705" y="200" text-anchor="middle" font-family="Arial" font-size="9.5" fill="#065F46">cashback via UPI</text>
</svg>

**What changes:** The employee no longer types into Excel or copies CSVs. They review claims on a screen — the same verification they do today on WhatsApp, just structured.

**What stays the same:** Cashfree, UPI payouts, the payout frequency — no changes to the payment side.

**Built-in contingency:** If UPI regulations tighten further, the system switches to direct bank transfer (NEFT) via the same Cashfree account with a single configuration change. No rebuild required.

---

## 5. Ongoing Running Costs

The only recurring cost is the OTP service for retailer logins.

| Channel | Cost Per OTP | When Used |
|---------|-------------|-----------|
| WhatsApp (primary) | ₹0.40 approx. | Default — familiar to retailers |
| SMS (fallback) | ₹0.25 approx. | Only if WhatsApp delivery fails |

At 1,000 active retailers logging in once per payout cycle:

| | |
|--|--|
| Monthly OTP cost | ₹300 – ₹400 |
| Annual OTP cost | ₹3,600 – ₹4,800 |

**Hosting: ₹0** — the application will be hosted on Netlify (free tier) with Supabase for the database (free tier). Both are production-grade platforms used by large-scale applications. This traffic level sits comfortably within their free tiers.

---

## 6. Development Cost

**Scope covers:** retailer portal with OTP login, coupon submission with photo upload and serial number entry, admin verification dashboard, product and cashback configuration panel, duplicate serial number detection, and payout file export compatible with Cashfree.

| | |
|--|--|
| Standard rate | ₹550 / hour |
| Family & friends discount | 10% |
| Effective rate | ₹495 / hour |
| Estimated hours | 20 – 25 hours |
| Development cost | ₹9,900 – ₹12,375 |
| AI development tools (1 month) | ~₹2,100 ($23) |
| **Total estimated cost** | **₹11,800 – ₹14,275** |

This is an estimate. Actual hours could be different depending on scope finalisation. A precise quote will be provided after a follow-up discussion.

---

## 7. Summary

| | Today | After |
|--|--|--|
| Coupon submission | WhatsApp photo | Portal upload |
| Data entry | Manual — Excel | Automatic |
| Duplicate detection | Manual review | Automatic |
| Payout file | Manual CSV | One-click export |
| Management visibility | None | Full dashboard |
| Regulatory contingency | None | NEFT fallback built in |
| Hosting cost | — | ₹0 |
| Monthly OTP cost | — | ₹300 – ₹400 |

---

*A follow-up meeting is recommended to address any questions before proceeding. All regulatory references are sourced from RBI and NPCI official communications and are available for review.*
