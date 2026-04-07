
import { useState, useEffect, useRef } from "react";

// ── Brand & Config ─────────────────────────────────────────────────────────────
const NAV = "#1C428A";
const GOLD = "#F5A623";
const RED = "#E01530";
const ADMIN_PW = "YDI2026";
const LOGO = "https://lamonte-dot.github.io/YDI-BATTLE-ROYALE/YDI_NewLogo_2026_WhiteBG.png";

// ── localStorage helpers ───────────────────────────────────────────────────────
const LS = {
  get: k => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del: k => { try { localStorage.removeItem(k); } catch {} }
};

// ── Default Users (pre-loaded) ─────────────────────────────────────────────────
const DEFAULT_USERS = [
  { id:"u1", name:"Joey",      role:"experienced_producer", locked:false, overrides:{}, createdAt:new Date().toISOString() },
  { id:"u2", name:"Melissa",   role:"new_producer",         locked:false, overrides:{}, createdAt:new Date().toISOString() },
  { id:"u3", name:"Stephanie", role:"new_producer",         locked:false, overrides:{}, createdAt:new Date().toISOString() },
  { id:"u4", name:"Kim",       role:"new_producer",         locked:false, overrides:{}, createdAt:new Date().toISOString() },
  { id:"u5", name:"Tia",       role:"csr",                  locked:false, overrides:{}, createdAt:new Date().toISOString() },
];

// ── Roles ─────────────────────────────────────────────────────────────────────
const ROLES = {
  new_producer:         { label:"New Producer",         emoji:"🌱", desc:"Full 5-day curriculum", days:[0,1,2,3] },
  experienced_producer: { label:"Experienced Producer", emoji:"⭐", desc:"Days 2–4 advanced track", days:[1,2,3] },
  csr:                  { label:"CSR",                  emoji:"🎧", desc:"Days 1, 3 & 4", days:[0,2,3] },
};

// ── Days & Modules ─────────────────────────────────────────────────────────────
const DAYS = [
  { id:0, num:1, title:"Day 1: Foundation", sub:"Personal Lines + ISL Hook", color:"#2563EB", emoji:"🏠", modules:[
    { id:"pl_lesson",   title:"Personal Lines 101",      type:"lesson",   emoji:"📚", xp:100, mins:20 },
    { id:"pl_quiz",     title:"Personal Lines Quiz",     type:"quiz",     emoji:"✅", xp:150, mins:10, req:"pl_lesson" },
    { id:"hook_lesson", title:"ISL Step 1: The Hook",    type:"lesson",   emoji:"🪝", xp:100, mins:20 },
    { id:"hook_quiz",   title:"Hook Knowledge Check",    type:"quiz",     emoji:"❓", xp:150, mins:10, req:"hook_lesson" },
    { id:"hook_drill",  title:"Hook Objections Roleplay",type:"scenario", emoji:"🎭", xp:250, mins:25, req:"hook_quiz" },
  ]},
  { id:1, num:2, title:"Day 2: Script Mastery + Commercial", sub:"ISL Steps 2–5 + Commercial + CA FAIR Plan", color:"#7C3AED", emoji:"💼", modules:[
    { id:"value_lesson",      title:"ISL Step 2: Building Value",         type:"lesson",   emoji:"📈", xp:100, mins:20 },
    { id:"cost_lesson",       title:"ISL Steps 3–4: Multi-Line + Cost",   type:"lesson",   emoji:"💰", xp:100, mins:15 },
    { id:"value_drill",       title:"Building Value Roleplay",            type:"scenario", emoji:"🎭", xp:200, mins:20, req:"value_lesson" },
    { id:"close_drill",       title:"Closing Objections Drill",           type:"scenario", emoji:"🛡️", xp:250, mins:25, req:"cost_lesson" },
    { id:"cl_products",       title:"ISL Commercial: The 9 Products",    type:"lesson",   emoji:"🏢", xp:120, mins:25 },
    { id:"cl_quiz",           title:"Commercial Products Quiz",           type:"quiz",     emoji:"✅", xp:150, mins:10, req:"cl_products" },
    { id:"cl_process",        title:"ISL Commercial: 3-Step Sales Process",type:"lesson", emoji:"🔑", xp:120, mins:20, req:"cl_products" },
    { id:"cl_prospect",       title:"ISL Commercial: Prospecting & Lead Gen",type:"lesson",emoji:"🎯",xp:100, mins:20 },
    { id:"cl_quote",          title:"ISL Commercial: Quoting & Underwriters",type:"lesson",emoji:"📋",xp:100, mins:20 },
    { id:"fairplan_lesson",   title:"CA FAIR Plan: Quote & Place",        type:"lesson",   emoji:"🔥", xp:120, mins:20 },
    { id:"fairplan_quiz",     title:"CA FAIR Plan Quiz",                  type:"quiz",     emoji:"✅", xp:150, mins:10, req:"fairplan_lesson" },
    { id:"cl_prospect_drill", title:"Commercial Prospecting Call Roleplay",type:"scenario",emoji:"📞",xp:250, mins:25, req:"cl_process" },
    { id:"cl_quote_drill",    title:"Commercial Quote Presentation Roleplay",type:"scenario",emoji:"💼",xp:300,mins:30,req:"cl_prospect_drill"},
  ]},
  { id:2, num:3, title:"Day 3: Systems & Technology", sub:"CTM Platform + Calendly + Customer Service", color:"#059669", emoji:"💻", modules:[
    { id:"ctm_dash",      title:"CTM: Dashboard Navigation",    type:"scenario", emoji:"🖥️", xp:150, mins:15 },
    { id:"ctm_calls",     title:"CTM: Answering & Logging Calls",type:"scenario",emoji:"📞", xp:150, mins:15, req:"ctm_dash" },
    { id:"ctm_scripts",   title:"CTM: Using Call Scripts",       type:"scenario",emoji:"📋", xp:150, mins:15, req:"ctm_calls" },
    { id:"ctm_transfer",  title:"CTM: Transferring Calls",       type:"scenario",emoji:"🔄", xp:150, mins:15, req:"ctm_scripts" },
    { id:"ctm_filters",   title:"CTM: Filters & Reports",        type:"scenario",emoji:"🔍", xp:150, mins:15, req:"ctm_transfer" },
    { id:"ctm_sms",       title:"CTM: SMS & Follow-Up",          type:"scenario",emoji:"💬", xp:200, mins:20, req:"ctm_filters" },
    { id:"calendly_lesson",title:"Calendly: Scheduling Automation",type:"lesson",emoji:"📅", xp:100, mins:15 },
    { id:"cs_lesson",     title:"Customer Service Excellence",   type:"lesson",   emoji:"🤝", xp:120, mins:20 },
    { id:"cs_drill",      title:"Customer Service Roleplay",     type:"scenario", emoji:"🎭", xp:200, mins:20, req:"cs_lesson" },
  ]},
  { id:3, num:4, title:"Day 4: Mock Calls + Certification", sub:"Scored Mock Calls + Final Exam", color:"#DC2626", emoji:"🏆", modules:[
    { id:"followup_lesson",  title:"Lead Follow-Up Blueprint",           type:"lesson",   emoji:"📬", xp:100, mins:15 },
    { id:"dash_lesson",      title:"YDI Dashboard Training",             type:"lesson",   emoji:"📊", xp:100, mins:15 },
    { id:"mock_auto",        title:"Mock Call: Auto Lead (Scored /15)",  type:"scenario", emoji:"🚗", xp:300, mins:30 },
    { id:"mock_home",        title:"Mock Call: Home Lead (Scored /15)",  type:"scenario", emoji:"🏡", xp:300, mins:30, req:"mock_auto" },
    { id:"mock_commercial",  title:"Mock Call: Commercial Lead (Scored /15)",type:"scenario",emoji:"🏢",xp:350,mins:35,req:"mock_home" },
    { id:"final_exam",       title:"YDI Certification Exam",             type:"quiz",     emoji:"🎓", xp:500, mins:25 },
  ]},
];

const ALL_MODS = DAYS.flatMap(d => d.modules);
const TOTAL_XP = ALL_MODS.reduce((a,m) => a + m.xp, 0);

// ── Badges ─────────────────────────────────────────────────────────────────────
const ALL_BADGES = [
  { id:"first_step",      name:"First Step",       emoji:"👣", desc:"Completed your first module",           check:p=>p.done.length>=1 },
  { id:"hook_master",     name:"Hook Master",      emoji:"🪝", desc:"Mastered The Hook",                     check:p=>p.done.includes("hook_lesson")&&p.done.includes("hook_quiz") },
  { id:"objection_crusher",name:"Objection Crusher",emoji:"🛡️",desc:"Completed an objection drill",          check:p=>p.done.includes("hook_drill")||p.done.includes("close_drill") },
  { id:"scholar",         name:"Insurance Scholar",emoji:"📚", desc:"Scored 100% on a quiz",                 check:p=>Object.values(p.scores||{}).some(s=>s>=100) },
  { id:"commercial_expert",name:"Commercial Expert",emoji:"🏢",desc:"Completed all commercial lessons",       check:p=>["cl_products","cl_process","cl_prospect","cl_quote"].every(id=>p.done.includes(id)) },
  { id:"fair_plan_ready", name:"FAIR Plan Ready",  emoji:"🔥", desc:"Completed CA FAIR Plan training",       check:p=>p.done.includes("fairplan_lesson")&&p.done.includes("fairplan_quiz") },
  { id:"ctm_pro",         name:"CTM Pro",          emoji:"💻", desc:"Completed all CTM modules",             check:p=>["ctm_dash","ctm_calls","ctm_scripts","ctm_transfer","ctm_filters","ctm_sms"].every(id=>p.done.includes(id)) },
  { id:"service_star",    name:"Service Star",     emoji:"🌟", desc:"Completed customer service training",   check:p=>p.done.includes("cs_lesson")&&p.done.includes("cs_drill") },
  { id:"closer",          name:"One-Call Closer",  emoji:"🤝", desc:"Completed a full mock call",            check:p=>p.done.includes("mock_auto")||p.done.includes("mock_home") },
  { id:"triple_threat",   name:"Triple Threat",    emoji:"🔱", desc:"Completed all 3 mock calls",            check:p=>["mock_auto","mock_home","mock_commercial"].every(id=>p.done.includes(id)) },
  { id:"certified",       name:"YDI Certified",    emoji:"🏆", desc:"Passed the certification exam",         check:p=>p.done.includes("final_exam") },
];

const LEVELS = [
  { min:0,    name:"Rookie",     color:"#9CA3AF" },
  { min:500,  name:"Associate",  color:"#3B82F6" },
  { min:1500, name:"Producer",   color:"#8B5CF6" },
  { min:3000, name:"Closer",     color:GOLD },
  { min:5000, name:"Elite",      color:"#EF4444" },
  { min:7500, name:"YDI Legend", color:"#10B981" },
];

function getLevel(xp) {
  let lvl = LEVELS[0], idx = 0;
  LEVELS.forEach((l,i) => { if (xp >= l.min) { lvl = l; idx = i; } });
  const next = LEVELS[idx+1];
  return { ...lvl, idx, next:next?.min, nextName:next?.name, pct: next ? Math.min(100,Math.round(((xp-lvl.min)/(next.min-lvl.min))*100)) : 100 };
}

function checkNewBadges(p) { return ALL_BADGES.filter(b => !p.badges.includes(b.id) && b.check(p)); }
function isUnlocked(mod, prog, user) {
  if ((user?.overrides||{})[mod.id]===false) return false;
  if (!mod.req) return true;
  return prog.done.includes(mod.req);
}

const INIT_PROG = { xp:0, done:[], scores:{}, badges:[], lastActive:null };
const btn = (s={}) => ({ border:"none", borderRadius:10, padding:"10px 24px", cursor:"pointer", fontWeight:700, fontSize:14, ...s });

// ── Lesson Content ─────────────────────────────────────────────────────────────
const LESSONS = {
pl_lesson:{ title:"Personal Lines Insurance 101", sects:[
  { h:"🚗 Auto Insurance — Key Coverages", txt:`**Bodily Injury Liability (BI)** — Covers injuries YOU cause to others. Standard 50/100. ISL upgrade: 50/100 → 100/300.\n\nGap story: Two people you hit need surgery — bills exceed $50K each. Geico pays their $50K limit. You owe the rest personally.\n\n**Property Damage Liability (PD)** — Standard $50K. Gap: you total a $70K Tesla — carrier pays $50K, you owe $20K.\n\n**Collision** — Repairs YOUR car after hitting something. Subject to deductible.\n\n**Comprehensive** — Non-collision damage: theft, vandalism, weather, animals.\n\n**UM/UIM** — Protects YOU when the at-fault driver has no insurance. Nearly 1 in 6 CA drivers are uninsured.\n\n**ISL Gap Fillers:** Rental Reimbursement, Towing & Roadside, Glass Deductible Buyback — Farmers windshield for just $100 instead of full deductible.` },
  { h:"🏠 Homeowners — The 6 Coverages", txt:`**Coverage A — Dwelling**: Rebuilds your home. Always quote Replacement Cost, NOT market value.\n\n**Coverage B — Other Structures**: Detached garage, shed, fence (10% of A).\n\n**Coverage C — Personal Property**: Furniture, electronics, clothing. Replacement Cost vs. ACV (ACV subtracts depreciation).\n\n**Coverage D — Loss of Use**: Hotel + living expenses while home is repaired.\n\n**Coverage E — Personal Liability**: If someone is injured on your property ($100K-$300K).\n\n**Coverage F — Medical Payments**: Guest injuries ($1K-$5K).\n\n**ISL Home Gaps:** Water Loss (cap at $10K vs full Coverage A) — Service Line — Equipment Breakdown — Roof RC vs ACV (story: $20K roof, carrier paid $3K ACV; with Farmers — full replacement cost).` },
  { h:"🏡 Renters + ☂️ Umbrella", txt:`**Renters — 3 ISL selling points:**\n1. "Someone breaks into your car and steals your laptop — covered under renters, NOT auto."\n2. "Your landlord's insurance covers the building, NOT your stuff."\n3. "Bundled with auto, you often pay the same or LESS than auto alone."\n\n**Umbrella:** Fatal accident story → $1M lawsuit → auto pays $100K → you owe $900K personally → assets seized OR 25% wage garnishment. An umbrella prevents ALL of that for $15-30/month.` },
]},
value_lesson:{ title:"ISL Step 2: Building Value vs Selling On Price", sects:[
  { h:"💡 The 3-Part Framework", txt:`1. **Check for Understanding** — "Do you know what coverage you have? How did you pick it? Besides price, what matters most?"\n2. **2-3 Similarities** first (creates comfort)\n3. **2-3 Gaps** where you're BETTER — always: Identify Gap → Be the Hero → Trial Close → WHY Statement\n\n**WHY Statement:** "We do that so you're not financially burdened after an accident and have to pay thousands out of pocket because you had a gap in your coverage."` },
  { h:"🚗 Auto Gaps + 🏠 Home Gaps", txt:`**Similarities first:** "I see you have Comp and Collision at $500 deductible — those stay the same here."\n\n**Auto Gaps:** BI ($50K/person → $100K/person) — PD ($50K → $100K, you total a $70K Tesla) — Rental (paid out of pocket → covered) — Roadside (flat tire on 10 freeway → just call us) — Glass ($500 deductible → $100 with us).\n\n**Home Gaps:** Water Loss ($10K sublimit → full Coverage A) — Service Line (underground pipes not standard → covered) — Equipment Breakdown (AC failure → covered) — Roof RC vs ACV ($20K roof, ACV carrier paid $3K → full RC with Farmers).` },
]},
cost_lesson:{ title:"ISL Steps 3–4: Multi-Lining + Cost Presentation", sects:[
  { h:"🔗 Step 3: Multi-Lining", txt:`Add policies BEFORE price. **Renters:** laptop story + landlord story. **Umbrella:** Fatal accident → $1M lawsuit → $900K gap → "An umbrella gives you $1M more for about $15-20/month." **Life (Home calls):** "What mortgage payoff protection do you have? If something happened to you, your spouse could pay off the mortgage and still have money left over."` },
  { h:"💰 Step 4: Cost Presentation — The #1 Rule", txt:`**NEVER pause after price.** Reveal price → discounts → savings → ask for sale. One fluid motion.\n\n"[Name], after finalizing your discounts, your rate came back REALLY good! After applying [multi-car, good driver, homeowner, occupation] discounts, your rate is only [$X]/month. That saves you [$X] a year. [Immediately ask for payment — 'I just need your Visa or Mastercard to get you set up right now.']"\n\nNo pause. No 'what do you think?' Just go.` },
]},
cl_products:{ title:"ISL Commercial: The 9 Core Products", sects:[
  { h:"🏢 Products 1–3: BOP, GL, Commercial Property", txt:`**1. BOP (Business Owner's Policy)** — Your #1 commercial product. Bundles GL + Commercial Property, usually cheaper than buying separately. Who needs it: restaurants, barbershops, salons, retail, food trucks, offices, contractors.\n\n**2. GL (standalone)** — Covers customer injury, property damage you cause, advertising injury, product liability. Common when property is elsewhere or client just needs GL for a license/contract.\n\n**3. Commercial Property (standalone)** — Covers building (if owned), equipment, inventory. Also covers business income loss during a covered shutdown.` },
  { h:"⚕️ Products 4–6: Workers Comp, Commercial Auto, E&O", txt:`**4. Workers Compensation** — REQUIRED BY LAW in CA for ANY business with 1+ employees. No exceptions. Covers: medical bills, lost wages, disability, death benefits. Your pipeline gut-check: every business owner with employees is either compliant (needs rate review) or non-compliant (legal emergency).\n\n**5. Commercial Auto** — Personal auto does NOT cover business use. Required for business vehicles. Key add-on: **HNOA (Hired & Non-Owned Auto)** — covers employees using personal vehicles for business errands. Most owners don't know they need it.\n\n**6. Professional Liability (E&O)** — Covers professional mistakes. GL covers physical injury. E&O covers the QUALITY of professional work. Required for: contractors, electricians, solar companies, consultants.` },
  { h:"🔧 Products 7–9: Umbrella, EPLI, Inland Marine + Specialty", txt:`**7. Commercial Umbrella** — Excess liability above GL, commercial auto, and employer's liability. Many contractor agreements REQUIRE a $2M umbrella. You're not just selling insurance — you're protecting their ability to get work.\n\n**8. EPLI (Employment Practices Liability)** — Covers wrongful termination, discrimination, harassment claims from employees. CA is the most litigious state for employment claims. Any business with 5+ employees should consider EPLI.\n\n**9. Inland Marine / Equipment Floater** — Covers tools and equipment that travel off-site. Standard commercial property ONLY covers property at the listed location. Contractor's tools stolen from a jobsite truck — not covered without Inland Marine.\n\n**Kraft Lake specialty:** Liquor Liability, Habitational (5+ units), Cyber Liability, Contractor's Pollution Liability.` },
]},
cl_process:{ title:"ISL Commercial: 3-Step Sales Process", sects:[
  { h:"🔑 The ISL Commercial Framework", txt:`ISL's Commercial Masterclass teaches a 3-step process built specifically for commercial lines. Key mindset shift: in personal lines, the lead already raised their hand. In commercial, YOU position yourself as a CONSULTANT.\n\n**The Commercial Positioning Statement:**\n"The way I work with business owners is different from how most agents work. Instead of just sending you a quote, I do a Coverage Review — I look at what you have, identify any gaps, and show you your options. Most business owners I work with find gaps they didn't know existed. Takes about 15 minutes. Would that be valuable to you?"` },
  { h:"📋 Step 1: The Exposure Interview", txt:`**10 Key Questions:**\n① What does your business do specifically?\n② How many employees? FT vs PT?\n③ Do you own or lease your building?\n④ What equipment or inventory does your business rely on?\n⑤ Do any employees drive for business? Their own vehicles?\n⑥ Do you currently carry business insurance? With whom?\n⑦ **When does your current policy renew?** ← THE X-DATE (most important)\n⑧ Any claims in the last 5 years?\n⑨ Any contracts requiring specific insurance limits?\n⑩ Do you have employees or 1099 contractors?\n\n**The X-Date:** "Your policy renews on [date]. Would it be OK if I put together a proposal before then so you have something to compare?" Almost no one says no.` },
  { h:"🤝 Step 2: Proposal + Step 3: Close", txt:`**Proposal = Coverage Review, not a quote:**\n1. "Here's what your current policy covers..." (current)\n2. "Here are 2-3 gaps I found..." (gaps with consequences)\n3. "Here's what I'm recommending..." (solution)\n4. "The investment for everything comes to [$X]" (price)\n\n**Gap examples:** "You have 8 employees and no Workers Comp — in CA, that's a legal violation. The state can fine you $10,000+ AND you're personally liable for any workplace injury." "One of your GC contracts requires a $2M umbrella. Your current policy only has $1M GL. You're in breach of that contract today."\n\n**Close:** "I can have your new policies bound by [date]. All I need from you is [signed application + payment + dec page]."\n\n**Onboarding:** Schedule 30-min call 7-10 days after binding to review policy, cross-sell (life, EPLI, umbrella), and ask for referrals.` },
]},
cl_prospect:{ title:"ISL Commercial: Prospecting & Lead Generation", sects:[
  { h:"🎯 Your 6 Commercial Lead Sources", txt:`**1. Existing Personal Lines Clients** — At EVERY onboarding: "Do you or anyone in your household own a business?"\n\n**2. Google Places / CSLB Prospecting** — YDI_PlacesLeadMachine.gs targets contractors across 45+ CA cities. CSLB contractors are legally required to carry GL — most are underinsured.\n\n**3. Referral Partners** — Commercial RE brokers, CPAs, business attorneys, GC contractors, IE Chamber of Commerce.\n\n**4. Walk-In Prospecting** — Restaurants, barbershops, salons. Visit during slow hours with a Coverage Review offer.\n\n**5. Non-Renewals** — Every standard market non-renewal you see is a Kraft Lake or FAIR Plan opportunity.\n\n**6. LinkedIn / Social** — Target business owners in the IE. Your 4 YDI social handles: @youngdouglasinsurance (IG/Pinterest), @YoungDouglasIns (Twitter/X), Google Business: "Farmers Insurance - Young Douglas".` },
  { h:"📞 Cold Call Scripts + X-Date Follow-Up", txt:`**Cold Call:**\n"Hi, may I speak with the owner? Hi [Name], this is [Your Name] from Farmers Young Douglas Agency in Ontario. I work specifically with [their industry] in the Inland Empire. I'm calling because a lot of [barbershop/restaurant/contractor] owners I talk to have gaps in their coverage they didn't know about. I do a complimentary 15-minute Coverage Review — no obligation. Would that be worth 15 minutes of your time this week?"\n\n**If happy with current insurance:** "That's great! Most of my clients were happy before we found the gaps. I'm not asking you to switch — just to make sure you're not exposed. Morning or afternoon this week?"\n\n**X-Date Follow-Up (60 days before renewal):** "Hi [Name], your policy renews in about 60 days. I want to reach out now so I have time to put together a proper proposal for you to compare. Can we schedule 15 minutes?"\n\n**Top IE niches:** 🪒 Barbershops — 🍕 Restaurants — 🔨 Contractors — ⚡ Solar/Electrical — 🚚 Food Trucks — 🏘️ Landlords (5+ units → Kraft Lake habitational)` },
]},
cl_quote:{ title:"ISL Commercial: Quoting & Working with Underwriters", sects:[
  { h:"📋 ACORD Applications", txt:`Every commercial quote starts with ACORD forms:\n- **ACORD 125** — Commercial Insurance Application (master)\n- **ACORD 126** — Commercial General Liability\n- **ACORD 130** — Workers Compensation\n- **ACORD 137** — Commercial Auto\n\n**What UWs need (gather in Exposure Interview):** Business name/address/years in operation, exact operations description, annual revenue (gross), payroll by class, # of employees (FT/PT), square footage, vehicle info, **5-year loss runs**, current dec page, any certificate or contract requirements.\n\n**The cleaner your submission, the better your rate.** An incomplete application = conservative (expensive) rate or a declination.` },
  { h:"🤝 Farmers vs Kraft Lake + Narrative Submissions", txt:`**Farmers AgencyLink:** Best for straightforward accounts — restaurants, barbershops, salons, small offices, simple contractors. Most BOP and GL accounts can be quoted and bound without a direct UW conversation.\n\n**Kraft Lake (E&S):** When Farmers declines or is uncompetitive. Higher-risk operations: habitational, restaurants with bars, contractors with large payrolls, prior claims, specialty endorsements.\n\n**Narrative submission (always beats a bare ACORD form):**\n"Hi [UW], I have an account I'd like to discuss. It's a [type of business], [# years], [revenue], [# employees], [clean loss history]. They need [list]. Here's what's unique: [story]. This is a great account because [X]."\n\nUnderwriters want to write good business. Give them context and they'll give you better rates and faster turnaround.` },
]},
fairplan_lesson:{ title:"CA FAIR Plan: How to Quote & Place", sects:[
  { h:"🔥 What Is the CA FAIR Plan?", txt:`The **California FAIR Plan** (Fair Access to Insurance Requirements) was established by the CA legislature in 1968 as the **insurer of last resort** for properties that cannot get coverage in the standard market.\n\nIt is NOT a state agency — it's a **syndicated fire insurance pool** backed by every property insurer doing business in California.\n\nWith wildfire risk skyrocketing across the IE and SoCal, FAIR Plan applications have exploded. Neighborhoods near the Jurupa Hills, Box Springs, and areas adjacent to the San Bernardino National Forest are prime FAIR Plan territory — and these are YOUR clients.\n\n**Every standard market non-renewal is a potential FAIR Plan + DIC package sale.**\n\n**Agent portal:** fairplan.org/for-agents — requires your CA license number.` },
  { h:"📋 When to Use It + What It Covers", txt:`**Primary triggers:**\n- Standard market declined or non-renewed the property\n- Property in a high wildfire hazard severity zone (CAL FIRE maps)\n- Prior fire/smoke/weather claims in recent years\n- Old wood shake roof that standard carriers won't insure\n- Brush exposure within 100 feet of unmanaged vegetation\n- Two or more prior claims (any type) in 3-5 years\n\n**Eligibility rule:** If a CA-licensed inspector can physically access the property, FAIR Plan will generally insure it.\n\n**FAIR Plan covers (BROAD form — always choose Broad):**\n✅ Fire, Lightning, Internal Explosion, Smoke, Windstorm/Hail, Aircraft, Vehicles, Riot, Volcanic Eruption\n✅ Dwelling up to $3M residential / $20M commercial\n\n**FAIR Plan does NOT cover:**\n❌ Theft ❌ Personal Liability ❌ Medical Payments ❌ Water damage ❌ Other structures (Coverage B) ❌ Earthquake ❌ Flood ❌ Loss of Use (limited)` },
  { h:"📝 The DIC Policy — Your Partner Product", txt:`**The FAIR Plan alone leaves critical gaps. Always pair it with a DIC (Difference in Conditions) policy.**\n\n- **FAIR Plan** = covers fire (broadly)\n- **DIC** = covers everything else (theft, liability, water, additional living expenses, other structures)\n- Together = near-complete homeowner protection\n\n**Where to get DIC:**\n- **Kraft Lake** — first stop for residential DIC\n- **Burns & Wilcox** — commercial property + FAIR Plan combos\n\n**Commission:** You earn on BOTH the FAIR Plan AND the DIC. This is a **double-commission opportunity** on every FAIR Plan referral.\n\n**Client talking point:** "Your home still needs to be covered. We do this with a two-policy package — the FAIR Plan covers fire, and a companion policy covers everything else. I handle both, so you have one agent and complete coverage."` },
  { h:"🖥️ How to Quote — Step by Step", txt:`**Step 1: Gather property info**\nAddress, county, year built, square footage, construction type, roof type + year installed, # of stories, prior claims (5 years), desired Coverage A replacement cost value.\n\n**Step 2: Agent portal** → fairplan.org → Log in → New Application → Residential or Commercial\n\n**Step 3: Complete the application**\n- Select **BROAD form** (not Basic)\n- Set Coverage A to full replacement cost (use same RC as standard quote)\n- Add: Coverage C (personal property), additional living expense if available\n\n**Step 4: Submit** — FAIR Plan issues a binder immediately for most accounts. Inspection scheduled within 30-60 days. If property fails inspection → FAIR Plan may cancel or require remediation.\n\n**Step 5: Quote the DIC** — Once FAIR Plan binder confirmed → submit to Kraft Lake with the FAIR Plan dec page. Give client TOTAL package price.\n\n**Pricing reality:** FAIR Plan is more expensive than standard. Acknowledge it directly: "The premium is higher, but given what's happening with wildfires in our area and the fact that standard carriers are leaving California, this is the right solution — and we get it done in one appointment."` },
]},
calendly_lesson:{ title:"Calendly: Scheduling Automation at YDI", sects:[
  { h:"📅 What Is Calendly and Why YDI Uses It", txt:`Calendly eliminates phone tag on appointment scheduling.\n\nInstead of 5 back-and-forth texts ("Are you free Tuesday?" → "Wednesday?" → "2pm?" → "Can we do 3?"), you send ONE link and the client books themselves.\n\nWhen they book:\n- Both you and the client receive automatic calendar invitations\n- Google Calendar updates instantly\n- CTM reminder can be set before the call\n\n**YDI Calendly event types:**\n- 30-min Auto/Home Consultation\n- 15-min Commercial Coverage Review (key commercial closing step)\n- 60-min Onboarding/Policy Review Appointment\n- 30-min X-Date Review Call (commercial follow-up)\n\n**The result:** More appointments booked, fewer no-shows, zero scheduling friction on your end.` },
  { h:"⚙️ Setting Up Your Account", txt:`**Step 1: Log in** — calendly.com — use your YDI Google account (ask LaMonte for access)\n\n**Step 2: Set your availability** → Availability → Working Hours\n- Recommended: Mon–Fri 9am–6pm, Sat 10am–2pm\n- Add **15-minute buffers** between appointments (Settings → Buffer Time) — gives you time to log CTM notes and prep for the next call\n\n**Step 3: Create 3 event types:**\n1. "Auto/Home Consultation" — 30 min\n2. "Business Coverage Review" — 15 min\n3. "Policy Onboarding Review" — 60 min\nFor each: clear name, description, your phone number in the Location field\n\n**Step 4: Connect Google Calendar** → Settings → Calendar Connection → Connect Google Calendar\nCalendly checks your calendar for conflicts and blocks off already-booked times automatically.` },
  { h:"🔗 Using Calendly in CTM Texts + Follow-Up", txt:`**Your link format:** calendly.com/ydi-[yourfirstname]/coverage-review\n\n**Where to use your Calendly link:**\n\n**CTM text template (Day 2 follow-up):**\n"Hi [Name]! I've been working on your quote. Here's a link to pick a time that works for you: [Calendly link]. Takes about 15 minutes and I'll walk you through everything."\n\n**Commercial follow-up after X-Date call:**\n"Hi [Name], great chatting! Here's a link to book a time for me to walk through your Coverage Review results: [Calendly link]"\n\n**Email signature:** Add "Book a time with me → [Calendly link]" under your name.\n\n**Voicemail:** "...or visit [your link] to book a time that works for you."\n\n**Logging in CTM:** When a Calendly booking comes in, immediately log a CTM note: "Calendly appt booked — [Name] — [date/time] — [type]." Tag the contact with "appointment-scheduled." Set a callback reminder 15 min before the appointment.\n\n**No-shows:** If they don't show → log in CTM as "no-show" → add to 10-call follow-up sequence immediately.` },
]},
cs_lesson:{ title:"Customer Service Excellence", sects:[
  { h:"🤝 The Service Call is a Sales Opportunity", txt:`Every client who calls in has something on their mind. Your job: **solve it first, then look for more.**\n\n**The 3 Rules of a Service Call:**\n1. Solve the problem first — don't pitch until the reason they called is fully resolved\n2. Build the relationship — a service call means they trust you with real concerns\n3. Introduce the opportunity naturally — at the end, never forced\n\n**The math:** An existing client who calls in converts at **3–5x the rate** of a cold lead. They trust you. You have their information. The only obstacle is your confidence in pivoting.\n\n**The mindset shift:** Stop thinking "this is an interruption." Start thinking "this is a warm lead who called ME."` },
  { h:"📞 Billing, Policy Changes + Renewals", txt:`**Billing Questions:**\n- "Let me pull up your account right now." → look it up → explain specifically what changed and why\n- If rate increased: be specific. "Your rate adjusted because [territory surcharge / claim impact / loss of discount]."\n- Never blame "inflation" or "the market" without specifics\n- If threatening to leave: "I understand. Let me do a quick review right now to see if there's anything I can adjust." → ISL value-building pivot\n\n**Policy Changes (Endorsements):**\n- Adding a vehicle: VIN, year/make/model, primary driver, garaging address → run in AgencyLink → confirm payment change\n- Address change: update in AgencyLink, check for rating territory change\n- Always close with: "While I have you — is there anything else on your account you've been wanting to review?"\n\n**Renewals:**\n- DO NOT apologize for the rate. DO say: "I understand — let me take a look at your full account and see what I can do."\n- Review all discounts: multi-policy, loyalty, payment method, occupation\n- If you can't beat it on price → build value (ISL Step 2): "Here's what's still better about your coverage..."\n- Last resort: check Kraft Lake for alternative pricing` },
  { h:"🚨 Claims — What to Say and What NOT to Say", txt:`**When a client calls to report a claim:**\n\n✅ **ALWAYS say:**\n- "I'm so sorry to hear that. Let me help you get this started right now."\n- "The Farmers claims line is 1-800-435-7764. A specialist who handles exactly this type of claim will be in touch within [24-48 hours]."\n- Log the call in CTM with disposition "Claim Reported" + claim type + date\n- Follow up 5-7 days later: "I wanted to check in and see how the claim process is going."\n\n❌ **NEVER say:**\n- "Don't worry, you're covered" — you don't have full details of the loss\n- "That should be covered" — same reason\n- "Their insurance will pay for it" — you don't know that\n- "This won't affect your rate" — you don't know that\n- "Just file a claim, that's what insurance is for" — claim frequency can cause non-renewal\n\n**Why this matters:** If you tell a client they're covered and the claim is denied — they'll blame you personally and potentially pursue an E&O claim. Always defer to the claims team. Your job: be empathetic, log the call, and make the referral.` },
  { h:"🔄 The Service-to-Sales Pivot + CTM Logging", txt:`**The Pivot Script (after fully resolving their issue):**\n"[Name], before I let you go — while I have you on the line, there's one thing I've been meaning to bring up. [Have you ever thought about adding an umbrella policy? / I noticed you don't have life insurance on your account — is that something you've ever looked into? / Did you know we also help business owners with their commercial insurance?]"\n\nIf they're in a rush: "No worries. I'll send you a quick text later this week with some info about [topic]. Take care!" → set CTM callback tagged "service-to-sales follow-up."\n\n**Never force it.** If the client is upset about a claim or angry about a rate increase — resolve THAT completely before any mention of other products.\n\n**Logging every service call in CTM (required — no exceptions):**\n- Open contact record immediately after (before next call)\n- Disposition: Billing/Service, Policy Change, Claim Reported, Renewal Saved, Service-to-Sales\n- Notes: what they called about → what you did → next step\n- If follow-up needed: set a CTM scheduled callback with date and context\n\n**Never leave a service call unlogged.** It's part of the client's permanent record and protects you in an E&O situation.` },
]},
followup_lesson:{ title:"Lead Follow-Up Blueprint", sects:[
  { h:"📊 The Stats That Should Change How You Work", txt:`- **80% of sales happen on the 5th-12th contact**\n- 50% of sales happen AFTER the 5th call\n- 48% of salespeople never follow up at all\n- 44% give up after ONE follow-up\n- 60% of customers say NO 4 times before saying YES\n\n**New Lead Schedule:** Day 1: Call immediately + again within 30 min. Days 2-10: 1 call/day, double dial. Texts: Days 1-5 after every voicemail.\n\n**Old Lead Schedule:** 6 calls, Days 1-6, double dial, 2 texts.\n\n**Commercial X-Date:** 6 calls starting 60 days before renewal.` },
  { h:"📞 Scripts That Work", txt:`**VM 1:** "Hi [Name]! This is [Your Name] from Farmers Young Douglas Agency. I just got your request for a [car/home] quote. I've started working on it and would love to connect. Call me back before 5pm at (909) 303-3722."\n\n**Breakup VM (Day 10):** "Hi [Name], this is my last attempt. The quote I prepared will be recycled today. Call me before 5pm at (909) 303-3722."\n\n**Day 1 Text:** "Hi [Name]! This is [Your Name] from Farmers Young Douglas. Got your request. What time can we connect today to go over your discounts and final price?"\n**Day 2:** "Hi [Name]! Just called. How much are you currently paying for insurance?"\n**Day 5:** "Is this still [Name]'s phone number?"` },
]},
dash_lesson:{ title:"YDI Dashboard & Agency Systems", sects:[
  { h:"🏆 YDI Battle Royale Leaderboard", txt:`**URL:** lamonte-dot.github.io/YDI-BATTLE-ROYALE (Admin password: YDI2026)\n\n**What it shows:** Individual producer rankings, total policies by type (auto, home, commercial, life), monthly and weekly performance stats.\n\n**Producers tracked:** Joey, Melissa, Stephanie, Kim Reese (Tia = overflow)\n\n**Your job:** Log every bound policy the SAME DAY you write it. Accurate data = fair rankings. Leaderboard resets monthly.` },
  { h:"📊 Your Full Tech Stack", txt:`**Farmers AgencyLink** — Primary quoting for Farmers personal and commercial lines.\n\n**Kraft Lake Portal** — E&S lines for specialty, hard-to-place commercial, habitational.\n\n**Burns & Wilcox** — Surplus lines for complex commercial risks.\n\n**CTM — (909) 303-3722** — Phone system, SMS, lead tracking, call recording. Everything inbound runs through CTM.\n\n**Calendly** — Scheduling automation. Use for consultations, Coverage Reviews, onboarding appointments.\n\n**YDI Universal Quote Form** — youngdouglasinsurance.com/pages/get-a-free-insurance-quote-california. Leads route through CTM FormReactor.\n\n**Google Sheets** — Each producer's tracking sheet linked to Battle Royale. Keep current daily.` },
]},
};

// ── Quiz Content ───────────────────────────────────────────────────────────────
const QUIZZES = {
pl_quiz:[
  { q:"What does Coverage A on a homeowners policy represent?", opts:["Personal Property","Dwelling — cost to rebuild the home","Personal Liability","Medical Payments"], ans:1, exp:"Coverage A = Dwelling. Always quote Replacement Cost — NOT market value." },
  { q:"Which auto coverage pays when YOU cause injuries to someone else?", opts:["Collision","Comprehensive","Bodily Injury Liability (BI)","Uninsured Motorist"], ans:2, exp:"BI covers injuries you cause to others. ISL upgrade: 50/100 → 100/300." },
  { q:"Someone breaks into your client's car and steals their laptop. What covers it?", opts:["Auto Comprehensive","Auto Collision","Renters or Homeowners Insurance","Auto Liability"], ans:2, exp:"Personal belongings stolen from a car are covered under Renters or Homeowners — NOT auto. ISL's #1 renters selling point!" },
  { q:"An umbrella policy primarily provides:", opts:["Roof coverage","Extra liability above your auto/home limits","Renters insurance","Only medical bills"], ans:1, exp:"Umbrella gives $1M+ extra liability on top of auto and home." },
  { q:"UM/UIM coverage protects:", opts:["Damage you cause to others","Your car in a non-collision event","YOU when an uninsured driver causes the accident","The other driver"], ans:2, exp:"UM/UIM protects YOU when the at-fault driver has no insurance. Nearly 1 in 6 CA drivers are uninsured." },
],
hook_quiz:[
  { q:"What is the primary goal of The Hook in the first 30 seconds?", opts:["Give them the price immediately","Get 3 'Yes' responses to build rapport and establish authority","Find out their current carrier first","Determine their budget"], ans:1, exp:"3 'Yes' responses creates psychological consistency. You establish authority because you have THEIR quote." },
  { q:"A prospect says 'I'm really busy, can't talk.' ISL says to:", opts:["Give the price quickly","Hang up and call back","Acknowledge/Agree → schedule callback → get back in script with one quick question","Read the full script fast"], ans:2, exp:"Acknowledge/Agree: 'Oh I'm sorry — when's better? Today or tomorrow morning?' Then: 'Really quick before I let you go...' → back in script." },
  { q:"What is THE most important question to ask during The Hook?", opts:["How much are you paying?","What coverage do you have?","Besides getting a better price, what made you shop today?","How did you find us?"], ans:2, exp:"This is your golden ticket. Their real motivation personalizes your close in Step 5." },
  { q:"After The Hook, you always transition to:", opts:["Step 4: Cost Presentation","Step 5: Asking For The Sale","Step 2: Building Value","Step 3: Multi-Lining"], ans:2, exp:"ALWAYS go to Step 2: Building Value. NEVER jump to price after The Hook." },
],
cl_quiz:[
  { q:"What does a BOP bundle together?", opts:["Workers Comp + Commercial Auto","General Liability + Commercial Property","Professional Liability + Inland Marine","Umbrella + GL"], ans:1, exp:"BOP = GL + Commercial Property. Your most common commercial cross-sell." },
  { q:"In California, Workers Comp is legally required for:", opts:["Businesses with 10+ employees","Businesses with 5+ employees","Any business with 1 or more employees — no exceptions","Only high-risk industries"], ans:2, exp:"CA law requires Workers Comp for ANY business with 1+ employees. No exceptions. This is a legal emergency for non-compliant clients." },
  { q:"A contractor's tools get stolen from their truck at a jobsite. What covers this?", opts:["Commercial Property","General Liability","Inland Marine / Equipment Floater","Commercial Auto"], ans:2, exp:"Standard Commercial Property only covers property at the listed location. Inland Marine follows the tools wherever they go." },
  { q:"A business client has employees using personal vehicles for deliveries. What do they need?", opts:["Personal Auto for each employee","Commercial Auto with HNOA (Hired & Non-Owned Auto)","Workers Compensation","GL endorsement"], ans:1, exp:"HNOA covers employees using personal vehicles for business. Without it, accidents during business use aren't covered by either policy." },
  { q:"When would you use Kraft Lake instead of Farmers?", opts:["When Farmers is more expensive","For specialty or hard-to-place risks Farmers won't write (E&S market)","For any restaurant account","Kraft Lake is only for personal lines"], ans:1, exp:"Kraft Lake is your E&S backstop — habitational, restaurants with liquor, hard-to-place commercial, anything Farmers declines." },
  { q:"What is the X-Date in commercial prospecting?", opts:["The date the business was founded","The policy renewal/expiration date","The last date to submit a quote","The underwriter's deadline"], ans:1, exp:"The X-Date is the renewal date. Getting it tells you exactly when to bring your proposal so you're competing at renewal." },
],
fairplan_quiz:[
  { q:"The CA FAIR Plan is best described as:", opts:["A state-funded insurance program","A syndicated fire insurance pool backed by CA-admitted insurers — the insurer of last resort","A Kraft Lake specialty product","A federal wildfire program"], ans:1, exp:"The FAIR Plan is NOT a state agency. It's a syndicated pool backed by all insurers doing business in California." },
  { q:"The FAIR Plan BROAD form covers:", opts:["Theft, fire, liability","Fire, lightning, explosion, smoke, wind, hail, aircraft, vehicles, riot","Everything a standard HO-3 covers","Earthquake and flood"], ans:1, exp:"FAIR Plan BROAD form covers fire-related and named perils. It does NOT cover theft, liability, water damage, earthquake, or flood." },
  { q:"When should you ALWAYS pair the FAIR Plan with a DIC policy?", opts:["Only if the client asks","Only for commercial properties","Always — DIC covers everything the FAIR Plan doesn't (theft, liability, water, etc.)","Only if the FAIR Plan premium is over $3,000"], ans:2, exp:"Always pair FAIR Plan with DIC. FAIR Plan = fire. DIC = everything else. Together they create near-complete protection. You also earn commission on both." },
  { q:"Where do you submit a CA FAIR Plan application?", opts:["Kraft Lake portal","Farmers AgencyLink","fairplan.org/for-agents — requires your CA license number","Burns & Wilcox direct"], ans:2, exp:"The FAIR Plan agent portal is at fairplan.org. You submit directly using your CA license number." },
  { q:"When quoting the FAIR Plan, you should always select:", opts:["Basic form — most affordable","BROAD form — covers the most named perils","Named peril only","All-risk form"], ans:1, exp:"Always select BROAD form. Basic form is too limited and most clients need the broader named-peril coverage including smoke, wind, and vehicles." },
  { q:"The FAIR Plan does NOT cover:", opts:["Fire damage to the dwelling","Smoke damage","Windstorm damage","Theft of personal property from the home"], ans:3, exp:"Theft is NOT covered by the FAIR Plan — it must be covered by the companion DIC policy. This is one of the key gaps the DIC fills." },
],
final_exam:[
  { q:"A prospect says 'I just renewed my policy.' Your FIRST words are:", opts:["'OK call us when it's up'","'But our rates are lower'","'Ah, got it — did you pay in full or monthly?' (Acknowledge/Agree first)","'Let me give you a quote anyway'"], ans:2, exp:"Always Acknowledge/Agree FIRST. Then: 'You can switch and your old carrier sends you a prorated refund.' Then back in the script." },
  { q:"In Step 2, the correct sequence after Check for Understanding is:", opts:["Gaps → Similarities → Price","2-3 Similarities first → 2-3 Gaps (Be the Hero each time)","WHY Statement → Multi-line → Close","Price → Objections → Ask"], ans:1, exp:"ALWAYS Similarities first (creates comfort), then Gaps with Be the Hero + WHY Statement. Starting with gaps feels like an attack." },
  { q:"After presenting price in Step 4, you should:", opts:["Pause and ask 'What do you think?'","Wait for their reaction","Immediately go into asking for the sale — no pause","Repeat the price twice"], ans:2, exp:"NEVER pause after price. Reveal price → discounts → savings → ask for payment. One fluid motion." },
  { q:"A prospect says 'Your price is too high.' ISL says to:", opts:["Offer lower coverage","Lower your voice, share an underinsurance story, explain your philosophy, ask for the sale again","Try to match their carrier's price","Thank them and suggest they shop around"], ans:1, exp:"Lower your voice. Share an underinsurance story. 'We decided it's better to explain price once than apologize when you file a claim.' Then ask for the sale again." },
  { q:"In CTM, a warm transfer means:", opts:["Transferring as fast as possible","Putting caller on hold","Conference in the agent, introduce caller with full context, THEN drop off","Send to voicemail with a note"], ans:2, exp:"Warm transfer: conference in agent, introduce with name/vehicle/carrier/motivation, THEN drop off. Prospect is NEVER left alone." },
  { q:"For a barbershop with 4 employees, you recommend:", opts:["Personal auto + renters","BOP + Workers Compensation","Umbrella only","Standard homeowners"], ans:1, exp:"BOP covers space, equipment, GL. Workers Comp is required by CA law for any business with employees. Both are mandatory." },
  { q:"When should you NEVER say 'you're covered' to a client reporting a claim?", opts:["Never — always defer to the claims team","Only for auto claims","Only if you're not sure","Always — it calms the client"], ans:0, exp:"NEVER say 'you're covered' on a claim call. You don't have full details of the loss. Always defer to the claims team. Personal E&O liability follows from making coverage determinations." },
  { q:"ISL says 80% of sales happen on which contact attempt?", opts:["1st-2nd","3rd-4th","5th-12th contact","Only the first call"], ans:2, exp:"80% of sales on the 5th-12th contact. 48% of salespeople never follow up at all. Your follow-up discipline IS your competitive advantage." },
],
};

// ── Scenario Content ───────────────────────────────────────────────────────────
const SCENARIOS = {
hook_drill:{ label:"Hook Objections Roleplay", intro:"I'll throw a random Hook objection at you. Use the ISL Acknowledge/Agree framework — validate, agree briefly, then pivot back with a question. I'll score you out of 10.",
  system:`You are a prospect receiving a call from a new Farmers Young Douglas Agency producer practicing ISL One-Call Close Hook objections.

Start IMMEDIATELY with ONE random opening objection: "I'm really busy don't have time" OR "Can you just email me the quote?" OR "I didn't request a quote" OR "I'm not interested" OR "I already have insurance" OR "I just renewed my policy" OR "Give me your price first"

Evaluate against ISL Acknowledge/Agree: Did they ACKNOWLEDGE? Did they AGREE briefly? Did they PIVOT with a question back into the script?

After 3-4 exchanges, SCORE OUT OF 10 with specific ISL coaching — what they did well, what they missed, and the exact ISL phrase they should have used.

Start IMMEDIATELY with your objection. Just be the prospect picking up the phone.`},
value_drill:{ label:"Building Value Roleplay", intro:"I'm Maria — your State Farm prospect. Walk me through Step 2 and I'll score you.",
  system:`You are Maria Gonzalez, homeowner in Rancho Cucamonga CA. State Farm: auto (50/100/50, $500 deductibles, no rental, no roadside — 2021 Toyota Camry), home ($300K Coverage A, ACV roof, no equipment breakdown). $165/month auto, $1,300/year home.

Producer is practicing ISL Step 2: Building Value.

Start: "OK so I have full coverage with State Farm but honestly I'm not totally sure what that all means..."

React authentically: Compelling gap stories → "Wow, I didn't know that!". Weak/vague → "Uh huh..." (flat). If they skip similarities and jump to gaps → "Wait, so what does my current policy actually cover?"

After 6-8 exchanges, score out of 10 on: Check for Understanding, Similarities first, Gaps with Be the Hero, WHY statement, trial closes.`},
close_drill:{ label:"Closing Objections Drill", intro:"You just presented your quote. I have an objection ready. Handle it ISL-style and ask for the sale again.",
  system:`You are a prospect who just heard a full insurance presentation. Pick ONE random closing objection: "I want to think about it" OR "Your price is too high" OR "Email me the quote" OR "I need to talk to my spouse first" OR "I want to shop this around"

After 2-3 exchanges, SCORE OUT OF 10 with specific ISL coaching. Start immediately with your objection.`},
cs_drill:{ label:"Customer Service Roleplay", intro:"I'm an existing client calling in with a service issue. Handle it by YDI standards — solve it first, then pivot. I'll score you.",
  system:`You are an existing Farmers Young Douglas client. Pick ONE random service scenario:

SCENARIO A — Billing upset: Your name is Patricia Chen. You're calling upset because your auto rate went up $28/month. You renewed 2 weeks ago and already paid. You want an explanation and you're considering switching to Progressive. You'll calm down significantly if the producer is specific about WHY it increased (CA wildfire surcharge + you turned 25 which moved you off the youth discount tier) and offers to look at your full account. Curveball: You also mention you just got married and want to add your husband's 2020 Ford F-150 to the policy.

SCENARIO B — Claim call: Your name is Marcus Williams. Your home had a water pipe burst last night. Your kitchen and living room have significant water damage. You're panicked. You need calm, empathetic guidance. Curveball: You ask "Am I covered?" — evaluate whether the producer answers this correctly (they should NOT say yes or no — they should refer to the claims team and get you the number).

SCENARIO C — Renewal threat: Your name is Angela Davis. Your homeowners just renewed with a 22% increase. You're threatening to switch to State Farm. You found their quote online at $180/year less. You'll respond well if the producer reviews your coverage intelligently and builds value. If they just apologize — you hang up.

After 5-6 exchanges, SCORE OUT OF 10:
1. Greeted warmly and pulled up account immediately ✓/✗
2. Solved the primary issue completely before any pivot ✓/✗
3. Was empathetic and never defensive ✓/✗
4. Specific about facts (not vague) ✓/✗
5. Handled claims correctly (NEVER said "you're covered" if claim scenario) ✓/✗
6. Used the service-to-sales pivot naturally at the end ✓/✗
7. Said they would log a CTM follow-up ✓/✗
8. Maintained professional upbeat tone throughout ✓/✗
Plus 2 bonus points for exceptional handling.

Show SCORE /10 and coaching. Begin as the client calling in: "Hi, I need to speak with someone about my account."
`},
cl_prospect_drill:{ label:"Commercial Prospecting Call Roleplay", intro:"I'm Carlos — 6-employee electrical contractor in Rancho Cucamonga. You're calling me cold. Try to book a Coverage Review. Scored out of 10.",
  system:`You are Carlos Reyes, owner of Reyes Electrical Solutions in Rancho Cucamonga CA. 6 employees, ~$850K annual revenue, 3 company trucks. With Nationwide for 4 years, ~$14,000/year total. Policy renews in 73 days. Clean loss history.

Missing: Equipment Floater, E&O, Commercial Umbrella (some GC contracts require $2M umbrella — you're not sure if you have it).

Skeptical of insurance calls. Warm up if the producer sounds knowledgeable about contractor insurance.

SCORE OUT OF 10:
1. Used Coverage Review language (not just "quote") ✓/✗
2. Personalized to contractor / IE market ✓/✗
3. Got the renewal/X-date ✓/✗
4. Handled "happy with current insurance" objection ✓/✗
5. Mentioned at least one specific gap ✓/✗
6. Asked to book the 15-minute call ✓/✗
7. Overcame at least one pushback ✓/✗
8. Sounded confident and consultative ✓/✗
Plus 2 bonus points for exceptional approach.

Start as Carlos: "Reyes Electrical, this is Carlos."`},
cl_quote_drill:{ label:"Commercial Quote Presentation Roleplay", intro:"I'm Carlos — ready to hear my Coverage Review results. Present ISL-style. Scored out of 10.",
  system:`You are Carlos Reyes from Reyes Electrical Solutions. You had a Coverage Review call last week. You're ready to hear results.

Current coverage: GL $1M/$2M (Nationwide), Workers Comp, 3 commercial autos. Missing: Equipment Floater, Umbrella (one GC contract requires $2M umbrella — you're in breach of it right now!), E&O.

Hardest-landing gap: "Carlos, I checked and one of your GC contracts requires a $2M commercial umbrella. Your current policy only has $1M in GL limits. If something happened on that job right now — the GC could terminate the contract AND you'd be personally liable above your policy limit."

SCORE OUT OF 10:
1. Opened with current coverage review ✓/✗
2. Presented gaps with specific financial/legal consequences ✓/✗
3. Mentioned umbrella contract compliance gap ✓/✗
4. Used a story or concrete example ✓/✗
5. Presented pricing confidently ✓/✗
6. Included investment breakdown clearly ✓/✗
7. Asked for the business directly ✓/✗
8. Offered to bind immediately / explained next steps ✓/✗
Plus 2 bonus points for exceptional consultative presentation.

Start as Carlos: "Hey, good to talk to you again. I've been thinking about what we discussed — what did you find?"`},
ctm_dash:{ label:"CTM Dashboard Training", intro:"Welcome to CTM! Let's walk through the main dashboard together like we're on a screen share.",
  system:`You are a CTM (CallTrackingMetrics) trainer for Farmers Young Douglas Agency (CTM account: 419278, main number: (909) 303-3722).

Teach the main CTM dashboard through interactive Q&A — like a live screen share.

Dashboard elements: Activity Feed (center — all calls/texts/emails in real time), Numbers (left sidebar — all tracking numbers, main is (909) 303-3722), Contacts (full history per contact), Reports (Call Volume, Agent Performance, Missed Calls — check every morning!, Source Reports), Active Calls panel (top right — managers can whisper or barge), Notification bell (clear it constantly).

After 5-6 exchanges, quiz on 2-3 things and score out of 10. Start: "Welcome to CTM! When you first log in, the first thing you'll see is..."`},
ctm_calls:{ label:"CTM: Answering & Logging Calls", intro:"Let's master inbound call handling in CTM — from the notification to the post-call note.",
  system:`You are a CTM trainer for Farmers Young Douglas Agency.

Teach: Inbound call notification (pop-up showing caller info, which number they dialed, lead source), what to check BEFORE answering (contact history, prior notes), the 5-minute rule (9x higher contact rate on missed callbacks), call recording (ALL calls auto-recorded — do not mention to callers), post-call notes (log BEFORE next call — disposition, policies discussed, next action), missed calls (red icon, always first priority).

Practice 3 scenarios. Score out of 10. Start: "OK let's talk about the most important skill in CTM..."`},
ctm_scripts:{ label:"CTM: Using Call Scripts", intro:"Scripts in CTM are your roadmap. Let's find them and practice using them without sounding like you're reading.",
  system:`You are a CTM trainer for Farmers Young Douglas Agency.

Teach: Where scripts live (left sidebar → Scripts, also accessible in contact record during active call), library categories (New Auto Lead, New Homeowner Lead, Old Lead/X-Date, Cross-Selling, Objection Responses, Commercial Prospecting), how to use during calls (guide, not word-for-word), branching logic (IF/THEN), golden rule (know it so well you only glance), ONLY LaMonte updates the master library.

Practice: "New auto internet lead calling right now — walk me through how you pull up the correct script." Score out of 10.`},
ctm_transfer:{ label:"CTM: Transferring Calls", intro:"A bad transfer loses the prospect. Let's master the YDI warm transfer standard.",
  system:`You are a CTM trainer for Farmers Young Douglas Agency.

WARM TRANSFER (YDI standard): Stay on line → click Conference/Transfer → dial receiving agent → wait for them to answer → introduce: "Hey [Agent], I have [Prospect] on the line — [car/address], [carrier], [paying $X/month], shopping because [motivation]. Take it from here!" → drop off. Prospect NEVER left alone.

Practice: "You've gathered all Hook info from Carlos — 2020 Silverado, Progressive, $145/month, rate went up. Need to warm transfer to Joey. Walk me through your EXACT process." Score out of 10.`},
ctm_filters:{ label:"CTM: Filters & Reports", intro:"Filters and reports keep zero leads falling through the cracks. Let's navigate them.",
  system:`You are a CTM trainer for Farmers Young Douglas Agency (CTM account 419278, main number: (909) 303-3722).

Teach: Activity Feed filters (date range, agent, tracking number, call direction, disposition — combinable), contact tags ("auto lead", "home lead", "commercial lead", "quoted", "sold", "not interested", "callback scheduled", "x-date"), Reports (Call Volume, Agent Performance, Missed Call Report — check EVERY MORNING before anything else, Source Report), permissions (LaMonte sees ALL — producers see only their own).

Practice: "LaMonte asks Monday morning to pull all missed calls from Friday between 3-5pm on the main (909) 303-3722 number. Walk me through exactly how you'd filter for that." Score out of 10.`},
ctm_sms:{ label:"CTM: SMS & Follow-Up Features", intro:"SMS can double your contact rate — when done correctly AND legally. Let's cover both.",
  system:`You are a CTM trainer for Farmers Young Douglas Agency. Main texting number: (909) 303-3722.

Teach: Sending texts (open contact → SMS tab → send, texts come from (909) 303-3722), text templates (ISL Day 1-5 scripts under Settings → Templates), two-way texting (replies appear in thread), TCPA Compliance — CRITICAL: ONLY text leads who opted in via YDI website quote form — NEVER cold-text — violations = up to $1,500 per text — federal law, automated drip sequences (Automation → Sequences), voicemail drops (CTM dialer → "Leave Voicemail"), CTM chat widget (website chats → route into CTM → respond within 2 minutes).

Practice: "New lead came in at 4:55pm — too late to call today. Walk me through your complete text follow-up plan for the next 5 days." Score out of 10.`},
mock_auto:{ label:"Full Mock Call — Auto Lead (Scored /15)", intro:"I'm David Chen. Scored out of 15 on the ISL Client Experience Checklist. This is as real as it gets — make the call!",
  system:`You are David Chen, 34, homeowner in Rancho Cucamonga CA. Online auto quote for 2021 Toyota RAV4. Also have 2018 Honda Civic — not on form. Geico, $145/month. DOB March 15 1991. Nurse at Kaiser. Real motivation: Geico raised rate $30 last month. Geico coverage: 50/100/50, $500 deductibles, no rental, no roadside. Politely skeptical. On lunch break.

Throw in AT LEAST ONE closing objection — "your price is too high" OR "I want to think about it."

SCORE /15:
1. Got "Yes" 3x in first 30 seconds ✓/✗
2. Asked motivation for shopping ✓/✗
3. Checked for understanding on current coverage ✓/✗
4. Discussed 2-3 similarities ✓/✗
5. Filled 2-3 gaps using Be the Hero pattern ✓/✗
6. Used the WHY statement ✓/✗
7. Offered multi-line (umbrella or home) ✓/✗
8. Presented cost without pausing after price ✓/✗
9. Asked for payment info directly ✓/✗
10. Overcame at least 1 closing objection ✓/✗
11. Asked for a referral ✓/✗
12. No dead air longer than 5 seconds ✓/✗
13. Upbeat enthusiastic tone throughout ✓/✗
14. Mentioned life insurance ✓/✗
15. Asked 2 open-ended questions not related to insurance ✓/✗

Show checklist, TOTAL /15, coaching. Answer the phone: "Hello?"`},
mock_home:{ label:"Full Mock Call — Home Lead (Scored /15)", intro:"I'm Sandra Martinez. Scored out of 15. There are a couple of twists in this one.",
  system:`You are Sandra Martinez, 52, homeowner in Ontario CA. Submitted homeowners quote online. Property: 2002 build, 1,800 sq ft, good condition, no pool. Roof replaced 2015. No solar. Mortgage with Wells Fargo, owe ~$180,000. Pay through escrow.

Current carrier: Allstate. REAL motivation (don't volunteer): Allstate sent non-renewal notice last week. You're stressed.

Auto: 2019 Nissan Altima, also Allstate, $165/month.

Spouse curveball: When producer tries to close, say "Oh, I should probably talk to my husband Robert about this." If they handle it correctly, admit "Well, I handle most of our bills actually..." → move forward.

Also throw in "I want to think about it" OR "You're not saving me enough on the auto."

SCORE /15 (same checklist as auto mock). Also note: Did they uncover the real motivation? Offer to bundle the auto? Handle the husband objection per ISL?

Answer: "Hello, this is Sandra."`},
mock_commercial:{ label:"Full Mock Call — Commercial Lead — Marcus (Scored /15)", intro:"I'm Marcus Johnson — barbershop owner, 3 employees, referred by Derrick. Walk me through a commercial coverage review call. Scored out of 15.",
  system:`You are Marcus Johnson, 41, owner of Sharp Cutz Barbershop at 1204 E Holt Ave, Ontario CA. 3 barbers (W-2 employees). Shop open 5 years. Own equipment (chairs, clippers, dryers — worth ~$15,000). Lease the space (landlord requires GL). Revenue ~$240,000.

Current insurance: Very basic GL only — $1M GL, $300/year. No Workers Comp (didn't know you needed it), no commercial property, no EPLI.

Heard about YDI from mortgage broker Derrick. Agreed to a call but think your insurance is fine.

Personality: Friendly, community-oriented, business-savvy. Respond well if treated like a business owner who deserves real information.

Hidden urgency: Grand re-opening event next weekend with a DJ and a few hundred people expected. NO event liability. Reveal if they build enough rapport or ask about upcoming events.

SCORE /15:
1. Used Coverage Review positioning, not just "quote" ✓/✗
2. Mentioned the referral from Derrick ✓/✗
3. Asked exposure interview questions ✓/✗
4. Identified Workers Comp gap + explained legally required in CA ✓/✗
5. Identified equipment/property coverage gap ✓/✗
6. Uncovered the grand re-opening event + mentioned event liability ✓/✗
7. Got the X-date or scheduled follow-up ✓/✗
8. Treated Marcus like a business owner (consultative) ✓/✗
9. Knowledgeable about barbershop-specific needs ✓/✗
10. Asked more than told ✓/✗
11. Upbeat engaging tone ✓/✗
12. No dead air ✓/✗
13. Built genuine rapport ✓/✗
14. Asked 2 non-insurance questions ✓/✗
15. Asked for referral OR Google review ✓/✗

Show numbered checklist, TOTAL /15, specific coaching.

Answer: "Sharp Cutz, this is Marcus."`},
};

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("loading");
  const [userId, setUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [progress, setProgress] = useState(INIT_PROG);
  const [current, setCurrent] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [xpFlash, setXpFlash] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    let stored = LS.get("ydi_users");
    if (!stored || stored.length === 0) { stored = DEFAULT_USERS; LS.set("ydi_users", stored); }
    setUsers(stored);
    const sess = LS.get("ydi_session");
    if (sess) {
      const u = stored.find(x => x.id === sess);
      if (u && !u.locked) { setUserId(u.id); loadProgress(u.id); setScreen("dashboard"); return; }
    }
    setScreen("login");
  }, []);

  const loadProgress = (uid) => {
    const p = LS.get(`ydi_prog_${uid}`) || { ...INIT_PROG };
    setProgress(p);
    return p;
  };

  const saveUsers = (us) => { setUsers(us); LS.set("ydi_users", us); };

  const login = (uid) => {
    const u = users.find(x => x.id === uid);
    if (!u || u.locked) return;
    setUserId(uid);
    loadProgress(uid);
    LS.set("ydi_session", uid);
    setScreen("dashboard");
  };

  const logout = () => {
    LS.del("ydi_session");
    setUserId(null);
    setProgress(INIT_PROG);
    setCurrent(null);
    setScreen("login");
  };

  const complete = (modId, xp, score = null) => {
    setProgress(prev => {
      const nd = prev.done.includes(modId) ? prev.done : [...prev.done, modId];
      const ns = score !== null ? { ...prev.scores, [modId]: score } : prev.scores;
      const np = { ...prev, xp: prev.xp + xp, done: nd, scores: ns, lastActive: new Date().toISOString() };
      const earned = checkNewBadges(np);
      if (earned.length) { np.badges = [...np.badges, ...earned.map(b => b.id)]; setToasts(earned); setTimeout(() => setToasts([]), 4500); }
      LS.set(`ydi_prog_${userId}`, np);
      return np;
    });
    setXpFlash(xp); setTimeout(() => setXpFlash(null), 2500);
  };

  const go = (mod) => { setCurrent(mod); setScreen(mod.type); };
  const back = () => { setCurrent(null); setScreen("dashboard"); };

  const currentUser = users.find(u => u.id === userId);

  if (screen === "loading") return <Splash />;
  if (adminOpen) return <AdminPanel users={users} onSave={saveUsers} onClose={() => setAdminOpen(false)} loadProgress={uid => LS.get(`ydi_prog_${uid}`) || INIT_PROG} />;
  if (guideOpen) return <UserGuide onClose={() => setGuideOpen(false)} />;
  if (screen === "login") return <LoginScreen users={users} onLogin={login} onAdmin={() => setAdminOpen(true)} />;
  if (screen === "lesson" && current) return <LessonScreen mod={current} lesson={LESSONS[current.id]} done={progress.done.includes(current.id)} onComplete={() => { complete(current.id, current.xp); back(); }} onBack={back} />;
  if (screen === "quiz" && current) return <QuizScreen mod={current} quiz={QUIZZES[current.id]} done={progress.done.includes(current.id)} onComplete={(s) => { complete(current.id, current.xp, s); back(); }} onBack={back} />;
  if (screen === "scenario" && current) return <ScenarioScreen mod={current} scenario={SCENARIOS[current.id]} done={progress.done.includes(current.id)} onComplete={() => { complete(current.id, current.xp); back(); }} onBack={back} />;

  const lvl = getLevel(progress.xp);
  const userDays = ROLES[currentUser?.role]?.days || [0,1,2,3];
  const overrides = currentUser?.overrides || {};

  return (
    <div style={{ minHeight:"100vh", background:"#EEF2FF", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background:NAV, padding:"0 20px", height:58, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 8px rgba(0,0,0,0.15)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <img src={LOGO} alt="YDI" style={{ height:38, background:"white", borderRadius:8, padding:"3px 6px", objectFit:"contain" }} onError={e => e.target.style.display="none"} />
          <div>
            <div style={{ color:GOLD, fontWeight:900, fontSize:14, letterSpacing:0.5 }}>Training Academy</div>
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:10 }}>Farmers Young Douglas Agency • Ontario, CA</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {xpFlash && <div style={{ background:GOLD, color:NAV, padding:"3px 10px", borderRadius:20, fontWeight:900, fontSize:12, animation:"pop 0.3s ease" }}>+{xpFlash} XP!</div>}
          <div style={{ textAlign:"right" }}>
            <div style={{ color:"white", fontSize:12, fontWeight:700 }}>{currentUser?.name}</div>
            <div style={{ fontSize:10, fontWeight:700, color:lvl.color }}>{lvl.name} • {progress.xp.toLocaleString()} XP</div>
          </div>
          <button onClick={() => setGuideOpen(true)} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"white", borderRadius:8, padding:"5px 10px", cursor:"pointer", fontSize:12 }}>📖 Guide</button>
          <button onClick={() => setAdminOpen(true)} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"white", borderRadius:8, padding:"5px 10px", cursor:"pointer", fontSize:12 }}>⚙ Admin</button>
          <button onClick={logout} style={{ background:"rgba(255,255,255,0.08)", border:"none", color:"rgba(255,255,255,0.5)", borderRadius:8, padding:"5px 10px", cursor:"pointer", fontSize:12 }}>← Logout</button>
        </div>
      </div>
      {/* XP Bar */}
      <div style={{ background:NAV, padding:"4px 20px 8px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
          <span style={{ color:"rgba(255,255,255,0.35)", fontSize:10 }}>{lvl.name}</span>
          {lvl.next && <span style={{ color:"rgba(255,255,255,0.35)", fontSize:10 }}>{(lvl.next-progress.xp).toLocaleString()} XP → {lvl.nextName}</span>}
        </div>
        <div style={{ background:"rgba(255,255,255,0.12)", borderRadius:6, height:6 }}>
          <div style={{ background:GOLD, width:`${lvl.pct}%`, height:"100%", borderRadius:6, transition:"width 0.6s ease" }} />
        </div>
      </div>
      {/* Stats Row */}
      <div style={{ maxWidth:900, margin:"0 auto", padding:"16px 16px 0" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, minmax(0,1fr))", gap:8, marginBottom:16 }}>
          {[
            { label:"Total XP", val:progress.xp.toLocaleString(), emoji:"⚡", color:GOLD },
            { label:"Completed", val:`${progress.done.length}/${ALL_MODS.length}`, emoji:"✅", color:"#10B981" },
            { label:"Badges", val:progress.badges.length, emoji:"🏅", color:"#8B5CF6" },
            { label:"Level", val:lvl.name, emoji:"🎯", color:lvl.color },
          ].map(s => (
            <div key={s.label} style={{ background:"white", borderRadius:12, padding:"10px 14px", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
              <div style={{ fontSize:18 }}>{s.emoji}</div>
              <div style={{ fontSize:18, fontWeight:900, color:s.color }}>{s.val}</div>
              <div style={{ fontSize:10, color:"#9CA3AF", fontWeight:600, textTransform:"uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>
        {/* Badges */}
        {progress.badges.length > 0 && (
          <div style={{ background:"white", borderRadius:12, padding:"12px 16px", marginBottom:14, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize:10, fontWeight:700, color:"#9CA3AF", marginBottom:8, textTransform:"uppercase", letterSpacing:1 }}>Earned Badges</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {progress.badges.map(bid => { const b = ALL_BADGES.find(x => x.id===bid); return b ? <div key={bid} title={b.desc} style={{ background:"#EEF2FF", borderRadius:8, padding:"4px 10px", display:"flex", alignItems:"center", gap:5 }}><span style={{ fontSize:14 }}>{b.emoji}</span><span style={{ fontSize:11, fontWeight:700, color:NAV }}>{b.name}</span></div> : null; })}
            </div>
          </div>
        )}
        {/* Days */}
        {DAYS.filter(d => userDays.includes(d.id)).map(day => {
          const done = day.modules.filter(m => progress.done.includes(m.id)).length;
          const pct = Math.round((done/day.modules.length)*100);
          const prevDay = DAYS[day.id-1];
          const dayLocked = day.id > 0 && userDays.includes(day.id-1) && !(prevDay?.modules.some(m => progress.done.includes(m.id)));
          return (
            <div key={day.id} style={{ marginBottom:14 }}>
              <div style={{ background:dayLocked?"#6B7280":done===day.modules.length?"#065F46":day.color, borderRadius:"14px 14px 0 0", padding:"12px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:26 }}>{dayLocked?"🔒":done===day.modules.length?"✅":day.emoji}</span>
                  <div>
                    <div style={{ color:"white", fontWeight:900, fontSize:14 }}>Day {day.num}: {day.title.replace(`Day ${day.num}: `,"")}</div>
                    <div style={{ color:"rgba(255,255,255,0.6)", fontSize:11 }}>{day.sub}</div>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color:"white", fontWeight:700, fontSize:12 }}>{done}/{day.modules.length}</div>
                  <div style={{ background:"rgba(255,255,255,0.2)", borderRadius:4, height:5, width:80, marginTop:3 }}><div style={{ background:"white", width:`${pct}%`, height:"100%", borderRadius:4 }}/></div>
                </div>
              </div>
              <div style={{ background:"white", borderRadius:"0 0 14px 14px", overflow:"hidden", boxShadow:"0 2px 6px rgba(0,0,0,0.07)" }}>
                {day.modules.map((mod, i) => {
                  const isDone = progress.done.includes(mod.id);
                  const unlocked = !dayLocked && isUnlocked(mod, progress, currentUser);
                  const score = progress.scores[mod.id];
                  const tc = mod.type==="lesson"?"#2563EB":mod.type==="quiz"?"#059669":"#7C3AED";
                  const tl = mod.type==="lesson"?"📖 Lesson":mod.type==="quiz"?"✅ Quiz":"🎭 Roleplay";
                  return (
                    <div key={mod.id} onClick={() => unlocked ? go(mod) : null}
                      style={{ display:"flex", alignItems:"center", padding:"10px 18px", borderBottom:i<day.modules.length-1?"1px solid #F3F4F6":"none", cursor:unlocked?"pointer":"not-allowed", background:isDone?"#F0FFF8":unlocked?"white":"#FAFAFA", transition:"background 0.1s" }}
                      onMouseEnter={e => unlocked && (e.currentTarget.style.background = isDone?"#D1FAE5":"#F5F7FF")}
                      onMouseLeave={e => e.currentTarget.style.background = isDone?"#F0FFF8":unlocked?"white":"#FAFAFA"}>
                      <div style={{ width:36, height:36, borderRadius:9, background:isDone?"#10B981":unlocked?tc:"#E5E7EB", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>{isDone?"✅":unlocked?mod.emoji:"🔒"}</div>
                      <div style={{ flex:1, marginLeft:10 }}>
                        <div style={{ fontWeight:700, fontSize:13, color:unlocked?"#111827":"#9CA3AF" }}>{mod.title}</div>
                        <div style={{ display:"flex", gap:8, marginTop:1, flexWrap:"wrap" }}>
                          <span style={{ fontSize:11, color:"#9CA3AF" }}>{tl}</span>
                          <span style={{ fontSize:11, color:"#9CA3AF" }}>⏱ {mod.mins} min</span>
                          {mod.req && !progress.done.includes(mod.req) && !isDone && <span style={{ fontSize:11, color:"#F59E0B", fontWeight:600 }}>Complete previous module first</span>}
                          {score !== undefined && <span style={{ fontSize:11, color:"#10B981", fontWeight:700 }}>Score: {score}%</span>}
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                        <span style={{ background:isDone?"#D1FAE5":"#EEF2FF", color:isDone?"#065F46":NAV, padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:900 }}>+{mod.xp} XP</span>
                        {unlocked && !isDone && <span style={{ color:day.color, fontSize:18, fontWeight:700 }}>›</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div style={{ height:24 }} />
      </div>
      {/* Toast badges */}
      {toasts.length > 0 && <div style={{ position:"fixed", top:65, right:16, zIndex:999 }}>{toasts.map(b => <div key={b.id} style={{ background:NAV, border:`2px solid ${GOLD}`, borderRadius:14, padding:"10px 16px", marginBottom:8, display:"flex", alignItems:"center", gap:10 }}><span style={{ fontSize:28 }}>{b.emoji}</span><div><div style={{ color:GOLD, fontWeight:900, fontSize:10, textTransform:"uppercase" }}>Badge Unlocked!</div><div style={{ color:"white", fontWeight:800, fontSize:14 }}>{b.name}</div></div></div>)}</div>}
      <style>{`@keyframes pop{0%{transform:scale(0.8)}100%{transform:scale(1)}}`}</style>
    </div>
  );
}

// ── Splash ─────────────────────────────────────────────────────────────────────
function Splash() {
  return <div style={{ minHeight:"100vh", background:NAV, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
    <img src={LOGO} alt="YDI" style={{ height:60, background:"white", borderRadius:12, padding:"6px 10px", objectFit:"contain" }} onError={e => e.target.style.display="none"} />
    <div style={{ color:GOLD, fontSize:22, fontWeight:900 }}>YDI Training Academy</div>
    <div style={{ color:"rgba(255,255,255,0.35)", fontSize:13 }}>Loading...</div>
  </div>;
}

// ── Login ──────────────────────────────────────────────────────────────────────
function LoginScreen({ users, onLogin, onAdmin }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pw, setPw] = useState("");
  const [adminBox, setAdminBox] = useState(false);

  const doLogin = () => {
    const found = users.find(u => u.name.toLowerCase().trim() === name.toLowerCase().trim());
    if (!found) { setError("Account not found. Please see LaMonte to get your account set up."); return; }
    if (found.locked) { setError("Your account has been locked. Please see LaMonte."); return; }
    onLogin(found.id);
  };

  const doAdmin = () => {
    if (pw === "YDI2026") { onAdmin(); } else { setError("Incorrect admin password."); }
  };

  return (
    <div style={{ minHeight:"100vh", background:NAV, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"white", borderRadius:20, padding:36, maxWidth:420, width:"100%" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <img src={LOGO} alt="YDI" style={{ height:52, background:"white", borderRadius:10, padding:"4px 8px", objectFit:"contain", marginBottom:10 }} onError={e => e.target.style.display="none"} />
          <div style={{ fontSize:22, fontWeight:900, color:NAV }}>YDI Training Academy</div>
          <div style={{ color:"#9CA3AF", fontSize:13, marginTop:4 }}>Farmers Young Douglas Agency</div>
        </div>
        <div style={{ color:"#374151", fontSize:14, fontWeight:700, marginBottom:8 }}>Enter your name to sign in:</div>
        <input value={name} onChange={e => { setName(e.target.value); setError(""); }} onKeyDown={e => e.key==="Enter" && doLogin()} placeholder="Your first name" style={{ width:"100%", padding:"12px 14px", border:`2px solid ${error?"#EF4444":"#E5E7EB"}`, borderRadius:10, fontSize:15, boxSizing:"border-box", outline:"none", fontFamily:"inherit" }} autoFocus />
        {error && <div style={{ color:"#991B1B", fontSize:12, marginTop:6, background:"#FEF2F2", padding:"8px 12px", borderRadius:8 }}>{error}</div>}
        <button onClick={doLogin} style={{ ...btn({ background:NAV, color:"white", width:"100%", padding:"12px 0", fontSize:15, marginTop:12 }) }}>Sign In →</button>
        <div style={{ textAlign:"center", marginTop:16 }}>
          {!adminBox ? <button onClick={() => setAdminBox(true)} style={{ background:"none", border:"none", color:"#9CA3AF", fontSize:12, cursor:"pointer", textDecoration:"underline" }}>Admin Access</button>
          : <div style={{ marginTop:4 }}>
            <input value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key==="Enter" && doAdmin()} placeholder="Admin password" type="password" style={{ width:"100%", padding:"10px 12px", border:"2px solid #E5E7EB", borderRadius:9, fontSize:14, boxSizing:"border-box", fontFamily:"inherit", outline:"none", marginBottom:6 }} />
            <button onClick={doAdmin} style={{ ...btn({ background:"#374151", color:"white", width:"100%", padding:"9px 0", fontSize:13 }) }}>Enter Admin Panel</button>
          </div>}
        </div>
      </div>
    </div>
  );
}

// ── Admin Panel ────────────────────────────────────────────────────────────────
function AdminPanel({ users, onSave, onClose, loadProgress }) {
  const [tab, setTab] = useState("users");
  const [editUser, setEditUser] = useState(null);
  const [newUser, setNewUser] = useState(false);
  const [form, setForm] = useState({ name:"", role:"new_producer" });
  const [viewProg, setViewProg] = useState(null); // userId to view progress

  const allProgress = users.reduce((a, u) => { a[u.id] = loadProgress(u.id); return a; }, {});

  const createUser = () => {
    if (!form.name.trim()) return;
    const u = { id:`u${Date.now()}`, name:form.name.trim(), role:form.role, locked:false, overrides:{}, createdAt:new Date().toISOString() };
    onSave([...users, u]);
    setNewUser(false); setForm({ name:"", role:"new_producer" });
  };

  const updateUser = () => {
    const updated = users.map(u => u.id===editUser.id ? { ...u, ...form } : u);
    onSave(updated); setEditUser(null);
  };

  const toggleLock = (uid) => onSave(users.map(u => u.id===uid ? { ...u, locked:!u.locked } : u));
  const deleteUser = (uid) => { if (confirm("Delete this user and their progress?")) { LS.del(`ydi_prog_${uid}`); onSave(users.filter(u => u.id!==uid)); } };

  const toggleOverride = (uid, modId) => {
    const updated = users.map(u => {
      if (u.id!==uid) return u;
      const ov = { ...(u.overrides||{}) };
      ov[modId]===false ? delete ov[modId] : (ov[modId]=false);
      return { ...u, overrides:ov };
    });
    onSave(updated);
  };

  const totalMods = ALL_MODS.length;

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{ background:"none", border:"none", borderBottom:`3px solid ${tab===id?NAV:"transparent"}`, padding:"10px 18px", cursor:"pointer", color:tab===id?NAV:"#9CA3AF", fontWeight:tab===id?800:500, fontSize:14, fontFamily:"inherit" }}>{label}</button>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#EEF2FF", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background:NAV, padding:"0 20px", height:58, display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 8px rgba(0,0,0,0.15)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <img src={LOGO} alt="YDI" style={{ height:36, background:"white", borderRadius:7, padding:"2px 5px", objectFit:"contain" }} onError={e => e.target.style.display="none"} />
          <div>
            <div style={{ color:GOLD, fontWeight:900, fontSize:15 }}>⚙ Admin Panel</div>
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:10 }}>Young Douglas Insurance — Manage Trainees</div>
          </div>
        </div>
        <button onClick={onClose} style={{ ...btn({ background:GOLD, color:NAV, padding:"7px 18px", fontSize:13 }) }}>← Back to Academy</button>
      </div>
      {/* Tabs */}
      <div style={{ background:"white", display:"flex", borderBottom:"2px solid #E5E7EB" }}>
        {tabBtn("users","👥 Users")}
        {tabBtn("kpis","📊 KPIs")}
        {tabBtn("modules","🔧 Module Controls")}
      </div>

      <div style={{ maxWidth:1000, margin:"0 auto", padding:"20px 16px" }}>

        {/* ── USERS TAB ─────────────────────────────────────────── */}
        {tab==="users" && <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontWeight:900, color:NAV, fontSize:16 }}>Trainee Accounts ({users.length})</div>
            <button onClick={() => { setNewUser(true); setForm({ name:"", role:"new_producer" }); }} style={{ ...btn({ background:NAV, color:"white", padding:"8px 18px", fontSize:13 }) }}>+ Add Trainee</button>
          </div>
          {newUser && (
            <div style={{ background:"white", borderRadius:12, padding:20, marginBottom:14, boxShadow:"0 2px 8px rgba(0,0,0,0.08)", border:`2px solid ${GOLD}` }}>
              <div style={{ fontWeight:800, color:NAV, marginBottom:12 }}>Create New Trainee</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <input value={form.name} onChange={e => setForm(f => ({...f,name:e.target.value}))} placeholder="Full Name" style={{ flex:1, minWidth:160, padding:"10px 12px", border:"2px solid #E5E7EB", borderRadius:9, fontSize:14, fontFamily:"inherit", outline:"none" }} />
                <select value={form.role} onChange={e => setForm(f => ({...f,role:e.target.value}))} style={{ flex:1, minWidth:160, padding:"10px 12px", border:"2px solid #E5E7EB", borderRadius:9, fontSize:14, fontFamily:"inherit", background:"white", cursor:"pointer" }}>
                  {Object.entries(ROLES).map(([k,v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
                </select>
              </div>
              <div style={{ display:"flex", gap:8, marginTop:12 }}>
                <button onClick={createUser} style={{ ...btn({ background:GOLD, color:NAV, padding:"8px 20px", fontSize:13 }) }}>Create Account</button>
                <button onClick={() => setNewUser(false)} style={{ ...btn({ background:"#F3F4F6", color:"#374151", padding:"8px 20px", fontSize:13 }) }}>Cancel</button>
              </div>
            </div>
          )}
          {editUser && (
            <div style={{ background:"white", borderRadius:12, padding:20, marginBottom:14, boxShadow:"0 2px 8px rgba(0,0,0,0.08)", border:`2px solid ${NAV}` }}>
              <div style={{ fontWeight:800, color:NAV, marginBottom:12 }}>Edit — {editUser.name}</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <input value={form.name} onChange={e => setForm(f => ({...f,name:e.target.value}))} placeholder="Full Name" style={{ flex:1, minWidth:160, padding:"10px 12px", border:"2px solid #E5E7EB", borderRadius:9, fontSize:14, fontFamily:"inherit", outline:"none" }} />
                <select value={form.role} onChange={e => setForm(f => ({...f,role:e.target.value}))} style={{ flex:1, minWidth:160, padding:"10px 12px", border:"2px solid #E5E7EB", borderRadius:9, fontSize:14, fontFamily:"inherit", background:"white" }}>
                  {Object.entries(ROLES).map(([k,v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
                </select>
              </div>
              <div style={{ display:"flex", gap:8, marginTop:12 }}>
                <button onClick={updateUser} style={{ ...btn({ background:NAV, color:"white", padding:"8px 20px", fontSize:13 }) }}>Save Changes</button>
                <button onClick={() => setEditUser(null)} style={{ ...btn({ background:"#F3F4F6", color:"#374151", padding:"8px 20px", fontSize:13 }) }}>Cancel</button>
              </div>
            </div>
          )}
          <div style={{ background:"white", borderRadius:14, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
            {users.map((u, i) => {
              const p = allProgress[u.id];
              const role = ROLES[u.role];
              const pct = Math.round((p.done.length/totalMods)*100);
              return (
                <div key={u.id} style={{ display:"flex", alignItems:"center", padding:"14px 20px", borderBottom:i<users.length-1?"1px solid #F3F4F6":"none", background:u.locked?"#FEF2F2":"white" }}>
                  <div style={{ width:40, height:40, borderRadius:12, background:u.locked?"#FEE2E2":NAV, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{u.locked?"🔒":role?.emoji||"👤"}</div>
                  <div style={{ flex:1, marginLeft:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontWeight:800, fontSize:14, color:u.locked?"#9CA3AF":"#111827" }}>{u.name}</span>
                      {u.locked && <span style={{ background:"#FEE2E2", color:"#991B1B", fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:20 }}>LOCKED</span>}
                      <span style={{ background:"#EEF2FF", color:NAV, fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:20 }}>{role?.label}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:4 }}>
                      <div style={{ background:"#E5E7EB", borderRadius:4, height:6, width:120 }}><div style={{ background:p.done.length>0?GOLD:"#E5E7EB", width:`${pct}%`, height:"100%", borderRadius:4 }}/></div>
                      <span style={{ fontSize:12, color:"#6B7280" }}>{p.done.length}/{totalMods} modules • {p.xp.toLocaleString()} XP • {p.badges.length} badges</span>
                      {p.done.includes("final_exam") && <span style={{ background:"#D1FAE5", color:"#065F46", fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:20 }}>🏆 Certified</span>}
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                    <button onClick={() => setViewProg(viewProg===u.id?null:u.id)} style={{ ...btn({ background:"#EEF2FF", color:NAV, padding:"5px 12px", fontSize:11 }) }}>📊 Progress</button>
                    <button onClick={() => { setEditUser(u); setForm({ name:u.name, role:u.role }); }} style={{ ...btn({ background:"#F3F4F6", color:"#374151", padding:"5px 12px", fontSize:11 }) }}>✏️ Edit</button>
                    <button onClick={() => toggleLock(u.id)} style={{ ...btn({ background:u.locked?"#D1FAE5":"#FEE2E2", color:u.locked?"#065F46":"#991B1B", padding:"5px 12px", fontSize:11 }) }}>{u.locked?"🔓 Unlock":"🔒 Lock"}</button>
                    <button onClick={() => deleteUser(u.id)} style={{ ...btn({ background:"#FEF2F2", color:"#991B1B", padding:"5px 12px", fontSize:11 }) }}>🗑</button>
                  </div>
                </div>
              );
            })}
            {users.length===0 && <div style={{ padding:24, textAlign:"center", color:"#9CA3AF" }}>No trainees yet. Click "+ Add Trainee" to get started.</div>}
          </div>
          {/* Expanded progress view */}
          {viewProg && (() => {
            const u = users.find(x=>x.id===viewProg);
            const p = allProgress[viewProg];
            if (!u||!p) return null;
            return (
              <div style={{ background:"white", borderRadius:14, padding:20, marginTop:14, boxShadow:"0 2px 8px rgba(0,0,0,0.07)" }}>
                <div style={{ fontWeight:800, color:NAV, marginBottom:12 }}>📊 {u.name}'s Full Progress</div>
                {DAYS.map(day => (
                  <div key={day.id} style={{ marginBottom:10 }}>
                    <div style={{ background:day.color, borderRadius:8, padding:"6px 12px", color:"white", fontWeight:700, fontSize:12, marginBottom:4 }}>{day.emoji} Day {day.num}: {day.title.replace(`Day ${day.num}: `,"")}</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                      {day.modules.map(m => (
                        <span key={m.id} style={{ background:p.done.includes(m.id)?"#D1FAE5":"#F3F4F6", color:p.done.includes(m.id)?"#065F46":"#9CA3AF", fontSize:11, padding:"3px 8px", borderRadius:6, fontWeight:600 }}>
                          {p.done.includes(m.id)?"✅":"⬜"} {m.title.slice(0,30)}{m.title.length>30?"...":""}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <div style={{ marginTop:12, display:"flex", gap:8, flexWrap:"wrap" }}>
                  {p.badges.map(bid => { const b=ALL_BADGES.find(x=>x.id===bid); return b?<span key={bid} style={{ background:"#EEF2FF", color:NAV, fontSize:11, padding:"3px 8px", borderRadius:6, fontWeight:700 }}>{b.emoji} {b.name}</span>:null; })}
                </div>
              </div>
            );
          })()}
        </>}

        {/* ── KPIs TAB ──────────────────────────────────────────── */}
        {tab==="kpis" && <>
          <div style={{ fontWeight:900, color:NAV, fontSize:16, marginBottom:14 }}>📊 Agency Training KPIs</div>
          {/* Summary cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,minmax(0,1fr))", gap:10, marginBottom:18 }}>
            {[
              { label:"Total Trainees", val:users.length, emoji:"👥", color:NAV },
              { label:"Certified", val:users.filter(u=>allProgress[u.id]?.done.includes("final_exam")).length, emoji:"🏆", color:"#10B981" },
              { label:"Avg Completion", val:`${users.length?Math.round(users.reduce((a,u)=>a+(allProgress[u.id]?.done.length||0),0)/(users.length*totalMods)*100):0}%`, emoji:"📈", color:GOLD },
              { label:"Total XP Earned", val:users.reduce((a,u)=>a+(allProgress[u.id]?.xp||0),0).toLocaleString(), emoji:"⚡", color:"#8B5CF6" },
            ].map(s=>(
              <div key={s.label} style={{ background:"white", borderRadius:12, padding:"14px 16px", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
                <div style={{ fontSize:22 }}>{s.emoji}</div>
                <div style={{ fontSize:24, fontWeight:900, color:s.color }}>{s.val}</div>
                <div style={{ fontSize:11, color:"#9CA3AF", fontWeight:600, textTransform:"uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>
          {/* Per-user KPI table */}
          <div style={{ background:"white", borderRadius:14, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr 1.5fr 0.8fr 1fr 0.8fr", gap:0, background:"#1F2937", padding:"10px 16px" }}>
              {["Trainee","Role","Progress","XP","Badges","Status"].map(h=><div key={h} style={{ color:"rgba(255,255,255,0.6)", fontWeight:700, fontSize:11, textTransform:"uppercase" }}>{h}</div>)}
            </div>
            {users.map((u,i) => {
              const p = allProgress[u.id];
              const role = ROLES[u.role];
              const pct = Math.round((p.done.length/totalMods)*100);
              const lvl = getLevel(p.xp);
              const certified = p.done.includes("final_exam");
              return (
                <div key={u.id} style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr 1.5fr 0.8fr 1fr 0.8fr", gap:0, padding:"12px 16px", borderBottom:i<users.length-1?"1px solid #F3F4F6":"none", background:u.locked?"#FEF9F9":"white", alignItems:"center" }}>
                  <div style={{ fontWeight:700, color:u.locked?"#9CA3AF":"#111827", fontSize:13 }}>{u.name}{u.locked&&<span style={{ marginLeft:6, fontSize:10, color:"#EF4444" }}>🔒</span>}</div>
                  <div style={{ fontSize:11, color:"#6B7280" }}>{role?.emoji} {role?.label}</div>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ background:"#E5E7EB", borderRadius:4, height:8, flex:1 }}><div style={{ background:pct===100?"#10B981":pct>50?GOLD:NAV, width:`${pct}%`, height:"100%", borderRadius:4, transition:"width 0.3s" }}/></div>
                      <span style={{ fontSize:11, color:"#374151", fontWeight:700, minWidth:32 }}>{pct}%</span>
                    </div>
                    <div style={{ fontSize:10, color:"#9CA3AF", marginTop:2 }}>{p.done.length}/{totalMods} modules</div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:800, color:lvl.color }}>{p.xp.toLocaleString()}</div>
                  <div style={{ fontSize:12 }}>{p.badges.map(bid=>{const b=ALL_BADGES.find(x=>x.id===bid);return b?<span key={bid} title={b.name} style={{ marginRight:2 }}>{b.emoji}</span>:null;})}{p.badges.length===0&&<span style={{ color:"#D1D5DB", fontSize:11 }}>None yet</span>}</div>
                  <div>{certified?<span style={{ background:"#D1FAE5", color:"#065F46", fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:20 }}>✅ Certified</span>:<span style={{ background:"#F3F4F6", color:"#6B7280", fontSize:11, fontWeight:600, padding:"3px 8px", borderRadius:20 }}>In Progress</span>}</div>
                </div>
              );
            })}
          </div>
          {/* Day-by-day completion heatmap */}
          <div style={{ background:"white", borderRadius:14, padding:20, marginTop:14, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ fontWeight:800, color:NAV, marginBottom:12 }}>Module Completion by Trainee</div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
                <thead><tr><th style={{ textAlign:"left", padding:"4px 8px", color:"#9CA3AF", fontWeight:700 }}>Module</th>
                  {users.map(u=><th key={u.id} style={{ padding:"4px 6px", color:NAV, fontWeight:700, textAlign:"center" }}>{u.name}</th>)}</tr></thead>
                <tbody>
                  {DAYS.map(day=>[
                    <tr key={`d${day.id}`}><td colSpan={users.length+1} style={{ background:day.color, color:"white", fontWeight:700, padding:"5px 8px", fontSize:11 }}>{day.emoji} Day {day.num}: {day.title.replace(`Day ${day.num}: `,"")}</td></tr>,
                    ...day.modules.map(m=>(
                      <tr key={m.id} style={{ borderBottom:"1px solid #F3F4F6" }}>
                        <td style={{ padding:"5px 8px", color:"#374151", maxWidth:200 }}>{m.emoji} {m.title.slice(0,35)}{m.title.length>35?"...":""}</td>
                        {users.map(u=>{const done=allProgress[u.id]?.done.includes(m.id);return<td key={u.id} style={{ padding:"5px 6px", textAlign:"center", background:done?"#D1FAE5":"#F9FAFB" }}>{done?"✅":"○"}</td>;})}
                      </tr>
                    ))
                  ])}
                </tbody>
              </table>
            </div>
          </div>
        </>}

        {/* ── MODULES TAB ───────────────────────────────────────── */}
        {tab==="modules" && <>
          <div style={{ fontWeight:900, color:NAV, fontSize:16, marginBottom:4 }}>🔧 Per-Trainee Module Controls</div>
          <div style={{ color:"#6B7280", fontSize:13, marginBottom:14 }}>Toggle individual modules on or off for specific trainees. Disabled modules appear locked regardless of prerequisites.</div>
          {users.map(u => {
            const role = ROLES[u.role];
            const p = allProgress[u.id];
            return (
              <div key={u.id} style={{ background:"white", borderRadius:14, marginBottom:14, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
                <div style={{ background:u.locked?"#6B7280":NAV, padding:"10px 18px", display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:20 }}>{role?.emoji}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ color:"white", fontWeight:800, fontSize:14 }}>{u.name}</div>
                    <div style={{ color:"rgba(255,255,255,0.5)", fontSize:11 }}>{role?.label} • {p.done.length}/{totalMods} modules completed</div>
                  </div>
                  {u.locked && <span style={{ background:"#FEE2E2", color:"#991B1B", fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:20 }}>LOCKED</span>}
                </div>
                {DAYS.map(day=>(
                  <div key={day.id}>
                    <div style={{ background:day.color+"18", padding:"6px 16px", borderBottom:"1px solid #F3F4F6" }}>
                      <strong style={{ color:day.color, fontSize:12 }}>{day.emoji} Day {day.num}</strong>
                    </div>
                    {day.modules.map((mod,i)=>{
                      const disabled = (u.overrides||{})[mod.id]===false;
                      const isDone = p.done.includes(mod.id);
                      return (
                        <div key={mod.id} style={{ display:"flex", alignItems:"center", padding:"8px 18px", borderBottom:i<day.modules.length-1?"1px solid #F9FAFB":"none", background:disabled?"#FEF9F9":"white" }}>
                          <span style={{ fontSize:14, marginRight:8 }}>{mod.emoji}</span>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:12, fontWeight:600, color:disabled?"#9CA3AF":"#1F2937" }}>{mod.title}</div>
                            <div style={{ fontSize:10, color:"#9CA3AF" }}>{mod.type} • {mod.xp} XP {isDone?"• ✅ Done":""}</div>
                          </div>
                          <button onClick={() => toggleOverride(u.id, mod.id)} style={{ ...btn({ background:disabled?"#FEE2E2":"#D1FAE5", color:disabled?"#991B1B":"#065F46", padding:"4px 12px", fontSize:11 }) }}>{disabled?"Disabled":"Enabled"}</button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            );
          })}
        </>}
      </div>
    </div>
  );
}

// ── User Guide ─────────────────────────────────────────────────────────────────
function UserGuide({ onClose }) {
  const sects = [
    { h:"🎓 Welcome to YDI Training Academy", txt:`The YDI Training Academy is your structured, self-paced insurance sales training program for Farmers Young Douglas Agency in Ontario, CA.\n\nThis platform covers everything you need to succeed at YDI — from personal lines 101 and the ISL One-Call Close framework, to commercial insurance, the CA FAIR Plan, CTM phone system mastery, Calendly scheduling, customer service excellence, and final certification.\n\nAll training is AI-powered. Your roleplays are with a real AI that scores you and provides ISL-specific coaching.` },
    { h:"📋 How to Sign In", txt:`**Step 1:** Enter your first name on the login screen. Your name must match the account LaMonte set up for you exactly.\n\n**No account?** See LaMonte — he'll create your account with the right role and permissions assigned.\n\n**Admin access:** LaMonte accesses the Admin Panel from the login screen using the agency admin password.\n\n**One device or multiple?** For LaMonte to see everyone's progress in the admin panel, it works best when all trainees complete training on a shared agency device. If you train on your own device, LaMonte can still view your progress when he logs in on your device.` },
    { h:"🎭 The 3 Module Types", txt:`**📖 Lessons** — Read the content, review all sections, then click "Complete" to earn XP. Take your time — this is the knowledge foundation.\n\n**✅ Quizzes** — Multiple choice questions with immediate feedback and explanations. You need 70% or higher to pass. You can retake as many times as needed.\n\n**🎭 AI Roleplays (Scenarios)** — These are live AI conversations. The AI plays a client or prospect and scores your performance on the ISL framework. Type your response as if you're on a real call. Click "Mark Complete" when the session ends to earn your XP.\n\n**Pro tip for roleplays:** Treat them like real calls. The AI notices if you're vague, skip steps, or miss ISL fundamentals. The coaching it gives you is specific and actionable.` },
    { h:"📅 The 4-Day Curriculum", txt:`**Day 1 — Foundation:** Personal Lines 101 (auto, home, renters, umbrella), ISL Step 1: The Hook (the 3-Yes opener, objection handling), Hook Roleplay.\n\n**Day 2 — Script Mastery + Commercial:** ISL Steps 2–5 (Building Value, Multi-Lining, Cost Presentation, Closing), all 9 commercial insurance products, ISL 3-Step Commercial Sales Process, prospecting & lead gen, quoting & underwriters, CA FAIR Plan (how to quote and place), two commercial roleplays (prospecting + quote presentation).\n\n**Day 3 — Systems & Technology:** 6 CTM modules (dashboard, inbound calls, scripts, transfers, filters & reports, SMS follow-up), Calendly scheduling automation, Customer Service Excellence (billing, policy changes, claims handling, service-to-sales pivot), customer service roleplay.\n\n**Day 4 — Mock Calls + Certification:** Lead Follow-Up Blueprint, YDI Battle Royale Dashboard, three scored mock calls (/15 each — auto, home, commercial), and the YDI Certification Exam (8 questions, 70% to pass, +500 XP).` },
    { h:"💻 CTM Training (Day 3)", txt:`Yes — Day 3 has 6 complete CTM (CallTrackingMetrics) training modules:\n\n1. **Dashboard Navigation** — Activity Feed, Numbers, Contacts, Reports, Active Calls panel\n2. **Answering & Logging Calls** — the 5-minute rule, pre-answer review, post-call notes, missed call protocol\n3. **Using Call Scripts** — where scripts live, branching logic, how to use them naturally\n4. **Transferring Calls** — YDI warm transfer standard (never leave a prospect alone)\n5. **Filters & Reports** — Activity Feed filters, contact tags, Missed Call Report (check every morning!), Source Report\n6. **SMS & Follow-Up** — text templates, two-way texting, TCPA compliance ($1,500/violation), automated drip sequences, voicemail drops\n\nYDI main CTM number: **(909) 303-3722**. Account ID: 419278.` },
    { h:"🏆 XP, Levels + Badges", txt:`Every completed module earns XP. Quizzes that are passed (70%+) earn full XP. Roleplays earn XP when you click "Mark Complete."\n\n**Levels:** Rookie (0 XP) → Associate (500) → Producer (1,500) → Closer (3,000) → Elite (5,000) → YDI Legend (7,500)\n\n**Badges:** 11 badges available — First Step, Hook Master, Objection Crusher, Insurance Scholar (100% quiz score), Commercial Expert, FAIR Plan Ready, CTM Pro, Service Star, One-Call Closer, Triple Threat (all 3 mock calls), YDI Certified.\n\nBadges unlock automatically when you hit the criteria. They appear on your dashboard and in LaMonte's admin KPI view.` },
    { h:"🔒 Admin Controls", txt:`LaMonte has full admin access with password **YDI2026**.\n\n**Admin can:**\n- Create and edit trainee accounts (name + role assignment)\n- Lock or unlock individual trainees\n- View all trainees' complete progress, XP, badges, and certification status\n- See a module completion heatmap across all trainees\n- Enable or disable individual modules per trainee\n- Delete trainee accounts and progress\n\n**Your role is assigned by LaMonte** — you don't select it yourself. Your role determines which days appear in your curriculum:\n- 🌱 New Producer: Days 1–4 (full curriculum)\n- ⭐ Experienced Producer: Days 2–4 (advanced track)\n- 🎧 CSR: Days 1, 3 & 4 (service focus)` },
    { h:"📞 Questions + Support", txt:`**For account issues:** See LaMonte Douglas directly.\n\n**Agency email:** lamonte@legacyprotectorsins.com\n\n**YDI main line:** (909) 303-3722\n\n**Quote form:** youngdouglasinsurance.com/pages/get-a-free-insurance-quote-california\n\n**YDI Battle Royale:** lamonte-dot.github.io/YDI-BATTLE-ROYALE\n\n**Important note on roleplays:** The AI characters are designed to test you. If a character pushes back hard — that's intentional. Stay in the ISL framework and make the call like it's real. The score you get is an accurate reflection of your ISL performance.` },
  ];
  const [si, setSi] = useState(0);
  const sect = sects[si];
  const renderText = txt => txt.split("\n").map((line,i) => {
    if (!line.trim()) return <div key={i} style={{ height:8 }}/>;
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return <p key={i} style={{ margin:"0 0 7px", lineHeight:1.75, color:"#374151", fontSize:14 }}>{parts.map((p,j) => j%2===1 ? <strong key={j} style={{ color:NAV }}>{p}</strong> : p)}</p>;
  });
  return (
    <div style={{ minHeight:"100vh", background:"#EEF2FF", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ background:NAV, padding:"14px 20px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 2px 8px rgba(0,0,0,0.15)" }}>
        <img src={LOGO} alt="YDI" style={{ height:36, background:"white", borderRadius:7, padding:"2px 5px", objectFit:"contain" }} onError={e=>e.target.style.display="none"} />
        <div style={{ flex:1 }}><div style={{ color:GOLD, fontWeight:900, fontSize:14 }}>📖 User Guide</div><div style={{ color:"rgba(255,255,255,0.4)", fontSize:10 }}>Section {si+1} of {sects.length}</div></div>
        <button onClick={onClose} style={{ ...btn({ background:GOLD, color:NAV, padding:"7px 18px", fontSize:13 }) }}>← Back to Academy</button>
      </div>
      <div style={{ background:"white", display:"flex", borderBottom:"1px solid #E5E7EB", overflowX:"auto" }}>
        {sects.map((s,i) => <button key={i} onClick={() => setSi(i)} style={{ background:"none", border:"none", borderBottom:`3px solid ${i===si?NAV:"transparent"}`, padding:"9px 12px", cursor:"pointer", color:i===si?NAV:"#9CA3AF", fontWeight:i===si?800:400, fontSize:11, whiteSpace:"nowrap", fontFamily:"inherit" }}>{i+1}. {s.h.replace(/^[^ ]+ /,"").slice(0,20)}</button>)}
      </div>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"24px 16px" }}>
        <div style={{ background:"white", borderRadius:16, padding:28, marginBottom:20, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize:18, fontWeight:900, color:NAV, marginBottom:18, paddingBottom:12, borderBottom:`3px solid ${GOLD}`, marginTop:0 }}>{sect.h}</h2>
          {renderText(sect.txt)}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <button onClick={() => setSi(s=>Math.max(0,s-1))} disabled={si===0} style={{ ...btn({ background:si===0?"#F3F4F6":"white", color:si===0?"#9CA3AF":NAV, border:"1px solid #E5E7EB", cursor:si===0?"default":"pointer" }) }}>← Previous</button>
          {si<sects.length-1 ? <button onClick={()=>setSi(s=>s+1)} style={{ ...btn({ background:NAV, color:"white" }) }}>Next →</button>
          : <button onClick={onClose} style={{ ...btn({ background:GOLD, color:NAV }) }}>Done — Back to Training</button>}
        </div>
      </div>
    </div>
  );
}

// ── Lesson Screen ──────────────────────────────────────────────────────────────
function LessonScreen({ mod, lesson, done, onComplete, onBack }) {
  const [si, setSi] = useState(0);
  const sects = lesson?.sects || [];
  const sect = sects[si];
  const renderText = txt => txt.split("\n").map((line,i) => {
    if (!line.trim()) return <div key={i} style={{ height:8 }}/>;
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return <p key={i} style={{ margin:"0 0 6px", lineHeight:1.75, color:"#374151", fontSize:14 }}>{parts.map((p,j) => j%2===1 ? <strong key={j} style={{ color:NAV }}>{p}</strong> : p)}</p>;
  });
  return (
    <div style={{ minHeight:"100vh", background:"#EEF2FF" }}>
      <div style={{ background:NAV, padding:"14px 20px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 2px 8px rgba(0,0,0,0.12)" }}>
        <button onClick={onBack} style={{ ...btn({ background:"rgba(255,255,255,0.12)", color:"white", padding:"6px 14px", fontSize:13 }) }}>← Back</button>
        <div style={{ flex:1 }}><div style={{ color:"white", fontWeight:800, fontSize:14 }}>{lesson?.title}</div><div style={{ color:GOLD, fontSize:11 }}>{mod.emoji} +{mod.xp} XP on completion</div></div>
        <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>Section {si+1}/{sects.length}</div>
      </div>
      <div style={{ background:"white", display:"flex", borderBottom:"1px solid #E5E7EB", overflowX:"auto" }}>
        {sects.map((s,i) => <button key={i} onClick={()=>setSi(i)} style={{ background:"none", border:"none", borderBottom:`3px solid ${i===si?NAV:"transparent"}`, padding:"9px 12px", cursor:"pointer", color:i===si?NAV:"#9CA3AF", fontWeight:i===si?800:400, fontSize:11, whiteSpace:"nowrap", fontFamily:"inherit" }}>{i+1}. {s.h.replace(/^[^ ]+ /,"").slice(0,24)}</button>)}
      </div>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"24px 16px" }}>
        {sect && <div style={{ background:"white", borderRadius:16, padding:28, marginBottom:20, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize:18, fontWeight:900, color:NAV, marginBottom:18, paddingBottom:12, borderBottom:`3px solid ${GOLD}`, marginTop:0 }}>{sect.h}</h2>
          {renderText(sect.txt)}
        </div>}
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <button onClick={()=>setSi(s=>Math.max(0,s-1))} disabled={si===0} style={{ ...btn({ background:si===0?"#F3F4F6":"white", color:si===0?"#9CA3AF":NAV, border:"1px solid #E5E7EB", cursor:si===0?"default":"pointer" }) }}>← Previous</button>
          {si===sects.length-1 ? <button onClick={onComplete} style={{ ...btn({ background:GOLD, color:NAV, padding:"10px 28px" }) }}>{done?"✓ Review Complete":`Complete — Earn ${mod.xp} XP`}</button>
          : <button onClick={()=>setSi(s=>s+1)} style={{ ...btn({ background:NAV, color:"white" }) }}>Next Section →</button>}
        </div>
      </div>
    </div>
  );
}

// ── Quiz Screen ────────────────────────────────────────────────────────────────
function QuizScreen({ mod, quiz, done, onComplete, onBack }) {
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  if (!quiz) return <div style={{ padding:40 }}>Quiz not found. <button onClick={onBack}>Back</button></div>;
  const q = quiz[qi];
  const next = () => {
    const na = [...answers, sel===q.ans];
    if (qi===quiz.length-1) { setAnswers(na); setFinished(true); }
    else { setAnswers(na); setQi(qi+1); setSel(null); setChecked(false); }
  };
  if (finished) {
    const fs = Math.round((answers.filter(Boolean).length/quiz.length)*100);
    const passed = fs >= 70;
    return (
      <div style={{ minHeight:"100vh", background:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
        <div style={{ background:"white", borderRadius:20, padding:36, maxWidth:440, width:"100%", textAlign:"center" }}>
          <div style={{ fontSize:60, marginBottom:12 }}>{fs===100?"🏆":passed?"🎉":"📚"}</div>
          <div style={{ fontSize:48, fontWeight:900, color:passed?"#10B981":"#EF4444", marginBottom:4 }}>{fs}%</div>
          <div style={{ fontSize:16, fontWeight:800, color:NAV, marginBottom:8 }}>{fs===100?"Perfect Score!":passed?"Nice Work!":"Keep Studying"}</div>
          <div style={{ color:"#9CA3AF", fontSize:13, marginBottom:20 }}>{answers.filter(Boolean).length} of {quiz.length} correct</div>
          {!passed && <div style={{ background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:10, padding:12, marginBottom:16, color:"#B91C1C", fontSize:13 }}>Need 70% or higher to pass. Review the lesson and try again!</div>}
          <div style={{ display:"flex", gap:10 }}>
            {!passed && <button onClick={() => { setQi(0); setSel(null); setChecked(false); setAnswers([]); setFinished(false); }} style={{ ...btn({ background:"#EEF2FF", color:NAV, flex:1 }) }}>Try Again</button>}
            <button onClick={() => onComplete(fs)} style={{ ...btn({ background:passed?GOLD:"#9CA3AF", color:passed?NAV:"white", flex:1 }) }}>{passed?`Claim ${mod.xp} XP →`:"Continue Anyway"}</button>
          </div>
          <button onClick={onBack} style={{ ...btn({ background:"none", color:"#9CA3AF", marginTop:8, width:"100%", fontSize:13 }) }}>← Back to Dashboard</button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ minHeight:"100vh", background:"#EEF2FF" }}>
      <div style={{ background:NAV, padding:"14px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={onBack} style={{ ...btn({ background:"rgba(255,255,255,0.12)", color:"white", padding:"6px 14px", fontSize:13 }) }}>← Back</button>
        <div style={{ flex:1 }}><div style={{ color:"white", fontWeight:800, fontSize:14 }}>{mod.title}</div><div style={{ color:GOLD, fontSize:11 }}>Question {qi+1} of {quiz.length}</div></div>
      </div>
      <div style={{ background:"rgba(255,255,255,0.2)", height:5 }}><div style={{ background:GOLD, height:"100%", width:`${((qi)/quiz.length)*100}%`, transition:"width 0.4s" }}/></div>
      <div style={{ maxWidth:620, margin:"0 auto", padding:"28px 16px" }}>
        <div style={{ background:"white", borderRadius:16, padding:28, marginBottom:16, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>Question {qi+1}</div>
          <div style={{ fontSize:17, fontWeight:700, color:NAV, lineHeight:1.5, marginBottom:22 }}>{q.q}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {q.opts.map((opt,i) => {
              let bg="#F9FAFB", border="#E5E7EB", color="#374151";
              if (sel===i) { bg="#EEF2FF"; border=NAV; color=NAV; }
              if (checked) { if (i===q.ans) { bg="#D1FAE5"; border="#10B981"; color="#065F46"; } else if (sel===i) { bg="#FEE2E2"; border="#EF4444"; color="#991B1B"; } }
              return <div key={i} onClick={() => !checked && setSel(i)} style={{ border:`2px solid ${border}`, borderRadius:10, padding:"11px 14px", cursor:checked?"default":"pointer", background:bg, color, fontWeight:sel===i?700:400, fontSize:14, transition:"all 0.1s", display:"flex", gap:10 }}>
                <span style={{ fontWeight:800, flexShrink:0 }}>{String.fromCharCode(65+i)}.</span>
                <span style={{ flex:1 }}>{opt}</span>
                {checked&&i===q.ans&&<span>✓</span>}{checked&&sel===i&&i!==q.ans&&<span>✗</span>}
              </div>;
            })}
          </div>
          {checked && <div style={{ background:sel===q.ans?"#D1FAE5":"#FEF2F2", borderRadius:10, padding:14, marginTop:14, fontSize:13, color:sel===q.ans?"#065F46":"#991B1B", lineHeight:1.6 }}><strong>{sel===q.ans?"✓ Correct!":"✗ Incorrect."}</strong> {q.exp}</div>}
        </div>
        {!checked ? <button onClick={() => sel!==null&&setChecked(true)} disabled={sel===null} style={{ ...btn({ background:sel===null?"#E5E7EB":NAV, color:sel===null?"#9CA3AF":"white", width:"100%", padding:"13px 0", fontSize:15, cursor:sel===null?"default":"pointer" }) }}>Check Answer</button>
        : <button onClick={next} style={{ ...btn({ background:GOLD, color:NAV, width:"100%", padding:"13px 0", fontSize:15 }) }}>{qi===quiz.length-1?"See Results →":"Next Question →"}</button>}
      </div>
    </div>
  );
}

// ── Scenario Screen ────────────────────────────────────────────────────────────
function ScenarioScreen({ mod, scenario, done, onComplete, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [exchanges, setExchanges] = useState(0);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const start = async () => {
    setStarted(true); setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:scenario.system, messages:[{role:"user",content:"Begin the training session."}] }) });
      const data = await res.json();
      setMessages([{ role:"assistant", content:data.content?.[0]?.text||"Ready to begin!" }]);
    } catch { setMessages([{ role:"assistant", content:"Ready! Let's begin the training session." }]); }
    setLoading(false);
  };

  const send = async () => {
    if (!input.trim()||loading) return;
    const userMsg = input.trim(); setInput("");
    const newMsgs = [...messages, { role:"user", content:userMsg }];
    setMessages(newMsgs); setLoading(true); setExchanges(e=>e+1);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1200, system:scenario.system, messages:newMsgs }) });
      const data = await res.json();
      setMessages([...newMsgs, { role:"assistant", content:data.content?.[0]?.text||"Let's continue..." }]);
    } catch { setMessages([...newMsgs, { role:"assistant", content:"I had trouble responding. Please try again." }]); }
    setLoading(false);
  };

  if (!started) return (
    <div style={{ minHeight:"100vh", background:"#EEF2FF" }}>
      <div style={{ background:NAV, padding:"14px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={onBack} style={{ ...btn({ background:"rgba(255,255,255,0.12)", color:"white", padding:"6px 14px", fontSize:13 }) }}>← Back</button>
        <div style={{ flex:1 }}><div style={{ color:"white", fontWeight:800, fontSize:14 }}>{scenario?.label||mod.title}</div><div style={{ color:GOLD, fontSize:11 }}>{mod.emoji} +{mod.xp} XP on completion</div></div>
      </div>
      <div style={{ maxWidth:560, margin:"40px auto", padding:20 }}>
        <div style={{ background:"white", borderRadius:20, padding:32, textAlign:"center", boxShadow:"0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize:52, marginBottom:14 }}>{mod.emoji}</div>
          <div style={{ fontSize:20, fontWeight:900, color:NAV, marginBottom:8 }}>{scenario?.label||mod.title}</div>
          <div style={{ color:"#6B7280", fontSize:14, lineHeight:1.65, marginBottom:22, background:"#EEF2FF", borderRadius:12, padding:16 }}>{scenario?.intro}</div>
          <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:20, flexWrap:"wrap" }}>
            <span style={{ background:"#EEF2FF", color:NAV, padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:700 }}>🤖 AI-Powered</span>
            <span style={{ background:"#EEF2FF", color:NAV, padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:700 }}>⏱ ~{mod.mins} min</span>
            <span style={{ background:"#FEF3C7", color:"#92400E", padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:700 }}>⚡ +{mod.xp} XP</span>
          </div>
          {done && <div style={{ background:"#D1FAE5", borderRadius:10, padding:10, marginBottom:16, color:"#065F46", fontSize:13, fontWeight:600 }}>✅ Already completed — practice again anytime!</div>}
          <button onClick={start} style={{ ...btn({ background:NAV, color:"white", width:"100%", padding:"13px 0", fontSize:15 }) }}>🎭 Begin Training Session</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#EEF2FF", display:"flex", flexDirection:"column" }}>
      <div style={{ background:NAV, padding:"12px 20px", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
        <button onClick={onBack} style={{ ...btn({ background:"rgba(255,255,255,0.12)", color:"white", padding:"6px 14px", fontSize:13 }) }}>← Back</button>
        <div style={{ flex:1 }}><div style={{ color:"white", fontWeight:800, fontSize:14 }}>{scenario?.label||mod.title}</div><div style={{ color:"rgba(255,255,255,0.4)", fontSize:11 }}>{exchanges} exchanges</div></div>
        <button onClick={onComplete} style={{ ...btn({ background:GOLD, color:NAV, padding:"7px 16px", fontSize:12 }) }}>Mark Complete +{mod.xp} XP</button>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"16px", maxWidth:700, width:"100%", margin:"0 auto", boxSizing:"border-box" }}>
        {messages.map((m,i) => (
          <div key={i} style={{ marginBottom:14, display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
            {m.role==="assistant" && <div style={{ width:32, height:32, borderRadius:"50%", background:NAV, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, marginRight:8, flexShrink:0, marginTop:4 }}>🤖</div>}
            <div style={{ background:m.role==="user"?NAV:"white", color:m.role==="user"?"white":"#1F2937", borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px", padding:"12px 16px", maxWidth:"80%", fontSize:14, lineHeight:1.65, boxShadow:"0 1px 4px rgba(0,0,0,0.08)", whiteSpace:"pre-wrap" }}>{m.content}</div>
            {m.role==="user" && <div style={{ width:32, height:32, borderRadius:"50%", background:GOLD, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, marginLeft:8, flexShrink:0, marginTop:4, color:NAV, fontWeight:900 }}>Y</div>}
          </div>
        ))}
        {loading && <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:NAV, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🤖</div>
          <div style={{ background:"white", borderRadius:"16px 16px 16px 4px", padding:"14px 18px", boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}><div style={{ display:"flex", gap:5 }}>{[0,1,2].map(i=><div key={i} style={{ width:8, height:8, borderRadius:"50%", background:"#9CA3AF", animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite` }}/>)}</div></div>
        </div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{ background:"white", borderTop:"1px solid #E5E7EB", padding:"12px 16px", flexShrink:0 }}>
        <div style={{ maxWidth:700, margin:"0 auto", display:"flex", gap:10 }}>
          <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Type your response... (Enter to send, Shift+Enter for new line)" style={{ flex:1, padding:"10px 14px", border:"2px solid #E5E7EB", borderRadius:10, resize:"none", fontFamily:"inherit", fontSize:14, outline:"none", lineHeight:1.5 }} rows={2}/>
          <button onClick={send} disabled={!input.trim()||loading} style={{ ...btn({ background:input.trim()&&!loading?NAV:"#E5E7EB", color:input.trim()&&!loading?"white":"#9CA3AF", padding:"10px 20px", cursor:input.trim()&&!loading?"pointer":"default", alignSelf:"flex-end" }) }}>Send →</button>
        </div>
        <div style={{ maxWidth:700, margin:"5px auto 0", fontSize:11, color:"#9CA3AF", textAlign:"center" }}>Click "Mark Complete" when the session ends to earn your XP</div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.35}50%{opacity:1}}`}</style>
    </div>
  );
}
