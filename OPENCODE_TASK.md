You are a senior full-stack engineer making three specific, supervisor-requested improvements to OsusuApp — a rotating savings group (ROSCA) web app for The Gambia. 

Before touching a single line of code, conduct a thorough analysis of every file affected by these changes. Map out every dependency, every place each changed value is read, written, displayed, or validated. Only then implement the changes.

Do not break any existing functionality. Every existing test case and user flow must still work after your changes.

---

## PRE-IMPLEMENTATION ANALYSIS (Do This First)

Before writing any code, read and report on the following:

**For the DAILY frequency change:**
- Find every place the Frequency enum/type is defined (SQL schema in Supabase, any frontend constants, any TypeScript types if present)
- Find every place frequency values are displayed to the user (badges, labels, GroupCard, GroupDetailPage header, CreateGroup form select options)
- Find every place frequency is used in logic (generatePayoutSchedule.js addInterval function, any date formatting, any filtering)
- Find every place frequency is validated (frontend form validation, backend controller validation)
- Find every place frequency appears in seed data, mock data, or test fixtures
- Check if the frequency_type enum in Supabase requires a migration SQL statement to add the new value

**For the random payout order change:**
- Find where payout_order is currently assigned (POST /groups/join controller, POST /groups logic for the organiser joining as first member)
- Find where payout_order is read and used (generatePayoutSchedule.js sort, GET /groups/:id/members response, Schedule tab display, GroupCard "Position" display, Overview tab member list)
- Find where the payout order is communicated to the user — any UI text like "You receive: Cycle 2" or "Position: 2" that implies order is based on join sequence
- Find the startGroup controller — this is where randomisation should happen, not at join time
- Check if any existing groups in the database have already been started (ACTIVE status) — the randomisation must not retroactively affect them

**For the landing page redesign:**
- Read the current LandingPage.jsx completely and map its existing sections
- Note what is already built vs what is placeholder
- Check what CSS classes, components, and assets it already uses
- Check if there are any imported components from the landing page that are shared with other pages — do not break those

Report your full findings before proceeding. Structure the report as:
- Files affected by change 1 (DAILY frequency): [list]
- Files affected by change 2 (random payout order): [list]  
- Files affected by change 3 (landing page): [list]
- SQL changes required: [list]
- Risk areas — places where a change could break something: [list]

---

## CHANGE 1 — ADD DAILY FREQUENCY

### 1.1 Database (Supabase SQL Editor)

The frequency_type enum in PostgreSQL cannot be altered with a simple ALTER — you must add the new value correctly. Run this in the Supabase SQL Editor:

```sql
ALTER TYPE frequency_type ADD VALUE IF NOT EXISTS 'DAILY';
```

Note: PostgreSQL enum additions are transactional but the new value is immediately available after the statement. No table migration needed — existing rows are unaffected.

Verify it worked:
```sql
SELECT enum_range(NULL::frequency_type);
-- Should return: {DAILY,WEEKLY,MONTHLY}
```

### 1.2 generatePayoutSchedule.js — addInterval function

The addInterval function currently handles WEEKLY and MONTHLY. Add DAILY:

```js
function addInterval(date, frequency) {
  const d = new Date(date);
  if (frequency === 'DAILY')   d.setDate(d.getDate() + 1);
  if (frequency === 'WEEKLY')  d.setDate(d.getDate() + 7);
  if (frequency === 'MONTHLY') {
    // Month-end safety: clamp to last day of target month
    const day = d.getDate();
    d.setMonth(d.getMonth() + 1);
    // If day overflowed (e.g. Jan 31 → Mar 3), go back to last day of target month
    if (d.getDate() !== day) {
      d.setDate(0); // setDate(0) = last day of previous month
    }
  }
  return d;
}
```

While you are here — verify the MONTHLY case has this month-end clamp applied. If it was missing before, add it now. This is a correctness fix your supervisor will notice.

### 1.3 Backend Validation

In every controller or validation function that checks the frequency value against an allowed list, add 'DAILY':

```js
// Before
const validFrequencies = ['WEEKLY', 'MONTHLY'];

// After
const validFrequencies = ['DAILY', 'WEEKLY', 'MONTHLY'];
```

Search the entire server/src directory for any hardcoded frequency value checks and update them all.

### 1.4 Frontend — Create Group Form

In the frequency select/dropdown, add the DAILY option:

```jsx
<option value="DAILY">Daily</option>
<option value="WEEKLY">Weekly</option>
<option value="MONTHLY">Monthly</option>
```

Ensure the order is DAILY → WEEKLY → MONTHLY (ascending frequency — most frequent first).

### 1.5 Frontend — Frequency Badge Display

Find every place frequency is displayed as a badge or label (GroupCard, GroupDetailPage header, Schedule tab, any summary cards). Update the display mapping:

```js
const frequencyLabel = {
  DAILY:   'Daily',
  WEEKLY:  'Weekly',
  MONTHLY: 'Monthly',
};

const frequencyBadgeColor = {
  DAILY:   'bg-purple-100 text-purple-700',  // distinct colour — daily is intense
  WEEKLY:  'bg-blue-100 text-blue-700',
  MONTHLY: 'bg-indigo-100 text-indigo-700',
};
```

### 1.6 Frontend — Date Display Context

For DAILY groups, the due dates are consecutive days. Ensure:
- The Schedule tab date column shows the full date AND day of week (e.g. "Mon, 14 Jan 2026") — this is especially important for daily groups where knowing the day of week matters
- The GroupCard "Next contribution due" shows a relative date (e.g. "Tomorrow", "In 2 days") — this is more useful for daily groups than a full date
- Update formatDate or add a formatDateWithDay helper:

```js
export function formatDateWithDay(dateString) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
  // Output: "Mon, 14 Jan 2026"
}
```

Use formatDateWithDay in the Schedule tab. Use formatRelativeDate on the Dashboard and GroupCard for upcoming due dates.

### 1.7 Create Group — UX Warning for Daily Groups

In the Create Group wizard, when the user selects DAILY as frequency, show an inline info callout below the frequency field:
Daily groups move fast. Make sure all members can contribute every day.
A group with 7 members will complete in 7 days.

Style: bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800

This is a real-world UX consideration — daily ROSCAs exist but are intense commitments.

---

## CHANGE 2 — RANDOM PAYOUT ORDER ON GROUP START

### 2.1 Core Principle

**Do not randomise at join time.** Keep payout_order as a sequential join position (1, 2, 3...) when members join. Randomise only when the organiser clicks Start Group. This is the correct approach because:
- Members joining a FORMING group should not yet have a locked payout position
- The organiser may want to start with different configurations
- It mirrors how real osusu groups work — the draw happens at the first meeting, not when people sign up

### 2.2 Backend — startGroup Controller

In the POST /groups/:id/start controller, after validating member count and before calling generatePayoutSchedule, shuffle the members array using a cryptographically unbiased Fisher-Yates shuffle:

```js
// server/src/utils/shuffle.js — create this new utility file

/**
 * Fisher-Yates shuffle — unbiased, in-place.
 * Uses Math.random() which is sufficient for this use case.
 * @param {Array} array
 * @returns {Array} shuffled array (same reference)
 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

module.exports = { shuffle };
```

In the startGroup controller:

```js
const { shuffle } = require('../utils/shuffle');

// ... after fetching members from group_members table ...

const shuffled = shuffle([...members]); // shallow copy before shuffling

// Reassign payout_order based on shuffled position
const membersWithNewOrder = shuffled.map((member, index) => ({
  ...member,
  payout_order: index + 1,
}));

// Update each member's payout_order in the database
// Do this BEFORE generating the schedule so the schedule uses the new order
for (const member of membersWithNewOrder) {
  await supabaseAdmin
    .from('group_members')
    .update({ payout_order: member.payout_order })
    .eq('id', member.id);
}

// Now generate the schedule using the updated order
const cycles = generatePayoutSchedule(group, membersWithNewOrder);
```

If the group has many members, replace the loop with a single RPC or use Supabase's upsert:

```js
// More efficient: upsert all at once
await supabaseAdmin
  .from('group_members')
  .upsert(
    membersWithNewOrder.map(m => ({ id: m.id, payout_order: m.payout_order })),
    { onConflict: 'id' }
  );
```

Use whichever pattern is already used elsewhere in the codebase for consistency.

### 2.3 Atomicity — Wrap in a Transaction

The startGroup operation now has three steps: update member orders, insert cycles, update group status. If any step fails midway, the database will be in an inconsistent state.

Wrap the entire operation in a Supabase database function (RPC) if possible. If RPC complexity is too high for the timeline, at minimum add a compensating rollback: if cycle insertion fails, revert group_members payout_order back to join order and do not update group status. Add a comment in the code explaining this limitation.

As a minimum safety net, add a check at the start of startGroup:
```js
// Guard: if group is already ACTIVE, do not re-run
if (group.status !== 'FORMING') {
  return res.status(400).json({ 
    success: false, 
    error: { message: 'Group has already been started.' } 
  });
}
```

### 2.4 Frontend — Schedule Tab

After randomisation, the Schedule tab will show members in a different order than they joined. This is expected and correct. Make it clear in the UI:

Add a small info note above the schedule table (only visible when status is ACTIVE):
Payout order was randomly assigned when the group started.

Style: text-xs text-gray-400 italic mb-3

### 2.5 Frontend — Overview Tab Member List

The member list in the Overview tab currently shows members sorted by join order (payout_order 1, 2, 3...). After randomisation, payout_order reflects the random draw, not join order.

Update the member list:
- Sort by payout_order ascending (already correct — just confirm)
- The payout position badge (the numbered circle) now represents their random draw position
- Add a column header "Draw Position" instead of "Position" or "Order" to make it clear this was randomly assigned
- Highlight the member who receives the current cycle's payout with a gold/amber badge: "🏆 Cycle 1" instead of just "1"

### 2.6 Frontend — GroupCard "Position" Display

The GroupCard currently shows "Position: 2" for the logged-in member. After randomisation this is still valid — update the label:

```jsx
// Before
<span>Position</span>
<span>{member.payout_order}</span>

// After
<span>Your Draw</span>
<span>#{member.payout_order} of {group.member_count}</span>
```

Add a tooltip or subtext: "You receive the payout in Cycle {member.payout_order}"

### 2.7 Frontend — Create Group Page

Remove any text that implies members are paid out in the order they join. Search for phrases like:
- "first to join, first to receive"
- "join order"
- "payout order is determined by when you join"

Replace with:
- "Payout order is randomly assigned when the group starts — fair for everyone."

If this text does not exist yet, add it as an explanatory note in the Create Group wizard on Step 3 (the summary/schedule step):
When you start the group, each member will be randomly assigned a payout position. The draw is automatic and unbiased.

### 2.8 Backend — Confirm Randomisation Does Not Affect ACTIVE Groups

Add a safeguard: the shuffle only runs inside the startGroup controller. No other endpoint (join group, update member, etc.) should ever modify payout_order of members in an ACTIVE group. 

In the POST /groups/join controller, add a guard:
```js
if (group.status !== 'FORMING') {
  return res.status(400).json({
    success: false,
    error: { message: 'This group is no longer accepting new members.' }
  });
}
```
This already exists per the spec — verify it is present and working.

---

## CHANGE 3 — LANDING PAGE REDESIGN

The landing page is the first thing a potential user sees. It must communicate trust, clarity, and cultural relevance. Design it as a real product landing page — not a student project placeholder.

### 3.1 Overall Design Direction

- Clean, modern, minimal — inspired by fintech landing pages (Stripe, Mono, Paystack)
- Colour palette: white background, green-600 primary, gray-900 headings, gray-500 body text, green-50 section backgrounds
- Typography: bold large headings (text-4xl sm:text-5xl lg:text-6xl), readable body (text-lg text-gray-600), tracked uppercase section labels
- Every section has generous padding (py-20 or py-24)
- Smooth scroll behaviour: html { scroll-behavior: smooth }
- All animations: use Tailwind's transition classes only — no external animation libraries

### 3.2 Navbar (Landing Page Specific)
[O] OsusuApp [How It Works] [Features] [Login] [Get Started →]

- Transparent background initially
- On scroll past 60px: white background + shadow-sm, transition-all duration-300
- "Get Started →" is a green filled button, rounded-full px-5 py-2
- On mobile: hide the middle links, show only Login and Get Started
- Clicking nav links smooth-scrolls to the corresponding section

### 3.3 Hero Section

Full viewport height (min-h-screen) with the content vertically centred.

**Layout:** Centred, single column on all screen sizes

**Content:**
- Small label above the heading (pill badge): "🇬🇲 Built for The Gambia" — bg-green-100 text-green-700 rounded-full px-4 py-1 text-sm font-medium
- Main heading (text-5xl sm:text-6xl font-bold text-gray-900 leading-tight):
  "Your osusu group,
  organised."
  — "organised." in text-green-600
- Subheading (text-xl text-gray-500 max-w-xl mx-auto mt-4):
  "Track contributions, automate payout schedules, and keep every member accountable — right from your phone. No more notebooks."
- CTA buttons (mt-8 flex gap-4 justify-center flex-wrap):
  - Primary: "Get Started — It's Free" → /register — bg-green-600 hover:bg-green-700 text-white rounded-full px-8 py-4 font-semibold shadow-lg hover:shadow-xl transition-all
  - Secondary: "See How It Works" → smooth scroll to #how-it-works — border-2 border-gray-300 hover:border-green-500 rounded-full px-8 py-4 font-semibold text-gray-700 transition-all
- Trust note below buttons (text-sm text-gray-400): "Free to use · No app download needed · Works on any phone"
- Background: white with a subtle radial gradient behind the heading — bg-[radial-gradient(ellipse_at_top,_#dcfce7_0%,_transparent_60%)]

### 3.4 Social Proof Bar

Below the hero, a thin full-width strip (bg-gray-50 border-y border-gray-100 py-6):

Three stats centred in a row (or column on mobile):
[💰] Savings Tracked    [👥] Made for Communities    [📱] Works on Any Device
D 0 so far                 Groups of 2–50              No app needed

Keep the numbers honest — use "Growing daily" instead of fake user counts.

### 3.5 How It Works Section

Section label: "HOW IT WORKS" (uppercase, green, text-sm tracked)
Heading: "From signup to your first payout in minutes"
Subheading: "OsusuApp handles the admin so your group can focus on saving."

Three steps in a horizontal layout on desktop, vertical on mobile:

**Step 1 — Create Your Group**
Icon: a settings/gear icon in a green circle
"Set your contribution amount, frequency (daily, weekly, or monthly), and how many members you want. Share the invite code with your group."

**Step 2 — Members Join**
Icon: people/users icon in a blue circle
"Every member joins using the invite code. Once everyone is in, start the group — payout positions are randomly and fairly assigned."

**Step 3 — Track & Pay Out**
Icon: chart/trophy icon in an amber circle
"The organiser records each contribution. The app tracks who has paid, who hasn't, and who receives the pot each cycle. Everyone stays accountable."

Add a connecting dashed line between steps on desktop (CSS or SVG).

### 3.6 Features Grid Section

Background: bg-green-50
Section label: "FEATURES"
Heading: "Everything your osusu group needs"

Six feature cards in a 2-column grid on mobile, 3-column on desktop. Each card: bg-white rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-all

| Icon | Title | Description |
|---|---|---|
| 📊 | Contribution Tracking | Mark each member as paid per cycle. See at a glance who's up to date and who needs a reminder. |
| 📅 | Auto Payout Schedule | Start the group and the schedule is generated automatically — daily, weekly, or monthly cycles. |
| 🎲 | Fair Random Draw | Payout positions are randomly assigned when the group starts. No arguments, no favouritism. |
| 🔗 | Invite Code Joining | Share a simple code with your group. Members join in seconds — no registration form needed to join. |
| 📱 | Works on Any Phone | No app download required. Open it in any browser on any phone, tablet, or computer. |
| 🔒 | Secure & Private | Your group's data is private. Only members can see contribution history and schedules. |

### 3.7 Why Osusu Section

Background: white
Section label: "OUR MISSION"
Heading: "Technology for a tradition that works"

Two-column layout on desktop (text left, visual right). On mobile: single column.

Left side — body text:
The osusu is one of the oldest and most trusted savings systems in West Africa.
In The Gambia, millions of people — from market traders to civil servants, from
students to community women's groups — rely on osusu to save money, manage cash
flow, and support each other.
But managing an osusu group by hand creates real problems: lost notebooks,
disputed records, missed contributions, and an unfair burden on the organiser.
OsusuApp doesn't replace the osusu — it protects it. We give your group the
tools to run smoothly, fairly, and transparently, so the trust that makes osusu
work stays strong.

Right side — a styled card with a quote:
The strength of the osusu is the trust between members.
OsusuApp makes that trust easier to keep.

Style: bg-green-600 text-white rounded-2xl p-8 italic text-lg, with a large quotation mark in green-400 as a decorative element

### 3.8 CTA Banner Section

Full-width green band (bg-green-600):
- Heading (text-white text-3xl font-bold): "Ready to organise your osusu group?"
- Subtext (text-green-100): "Join for free. No credit card. No app store."
- Button: "Get Started Now →" — bg-white text-green-600 font-bold rounded-full px-8 py-4 hover:bg-green-50 transition-all

### 3.9 Footer (Landing Page)

Same footer component as the authenticated pages. Ensure it is used here too (not a duplicate — import the shared Footer component).

### 3.10 Landing Page — Redirects

If a logged-in user visits /, redirect them to /dashboard automatically. Check AuthContext loading state first:

```jsx
const { user, loading } = useAuth();
if (loading) return <LoadingSpinner fullPage />;
if (user) return <Navigate to="/dashboard" replace />;
// else render the landing page
```

---

## IMPLEMENTATION ORDER

Follow this exact sequence to minimise risk of breaking things:

**Step 1 — Analysis only**
Read all affected files. Write your findings. Do not change anything yet.

**Step 2 — Database change**
Run the ALTER TYPE SQL in Supabase. Verify it worked. This is the only database change and it is non-destructive.

**Step 3 — Backend: generatePayoutSchedule.js**
Add DAILY to addInterval. Add the month-end clamp to MONTHLY. Add the new shuffle.js utility. Unit-test the schedule generation mentally with these cases:
- 3 members, DAILY, start Jan 1 → cycles on Jan 1, Jan 2, Jan 3
- 3 members, WEEKLY, start Jan 1 → cycles on Jan 1, Jan 8, Jan 15
- 3 members, MONTHLY, start Jan 31 → cycles on Jan 31, Feb 28, Mar 31
All three must produce correct dates before continuing.

**Step 4 — Backend: startGroup controller**
Add Fisher-Yates shuffle before schedule generation. Add payout_order update query. Add ACTIVE guard. Test the complete startGroup flow in isolation.

**Step 5 — Backend: validation updates**
Add DAILY to all frequency validation checks across all controllers and routes.

**Step 6 — Frontend: frequency changes**
Add DAILY option to the form. Add frequencyLabel and frequencyBadgeColor mappings. Add formatDateWithDay helper. Add DAILY warning callout. Update all frequency display locations.

**Step 7 — Frontend: payout order UI changes**
Update GroupCard "Position" label. Add "Draw Position" column header to member list. Add "🎲 Payout order was randomly assigned" note to Schedule tab. Remove any join-order language.

**Step 8 — Landing page**
Rebuild LandingPage.jsx section by section. Do not touch any other page. Verify the logged-in redirect works.

**Step 9 — End-to-end verification**
Run the full verification checklist below.

---

## END-TO-END VERIFICATION CHECKLIST

Run through every item. Fix anything that fails.

**DAILY frequency:**
- [ ] Create Group form shows Daily, Weekly, Monthly as options
- [ ] Select Daily → info callout appears below the field
- [ ] Create a DAILY group → invite code shown
- [ ] Start the group → schedule shows consecutive daily dates
- [ ] Schedule dates display with day of week (Mon, Tue, etc.)
- [ ] GroupCard shows "Daily" badge in purple
- [ ] WEEKLY and MONTHLY groups still work exactly as before

**Random payout order:**
- [ ] Create a group, have 3 users join (4 including organiser)
- [ ] Before starting: members list shows join order (1, 2, 3, 4)
- [ ] Click Start Group
- [ ] After starting: Schedule tab shows members in a randomised order
- [ ] The "🎲" note is visible above the schedule table
- [ ] Run Start Group 5 times on different test groups — verify the order is not always the same (randomness check)
- [ ] An already-ACTIVE group: cannot be started again — returns 400 with clear message
- [ ] Existing ACTIVE groups in the database: their payout_order and schedules are completely unchanged

**Month-end date clamping (MONTHLY):**
- [ ] Create a MONTHLY group with start_date = January 31
- [ ] Start the group with 3 members
- [ ] Schedule shows: Cycle 1 = Jan 31, Cycle 2 = Feb 28 (NOT March 2 or 3), Cycle 3 = March 31
- [ ] If Cycle 2 shows March 2 or 3, the clamp is not working — fix it before finishing

**Landing page:**
- [ ] Visiting / while logged out shows the full landing page
- [ ] Visiting / while logged in redirects to /dashboard immediately
- [ ] All nav links smooth-scroll to their sections
- [ ] Get Started → /register, Login → /login
- [ ] All 6 feature cards render correctly
- [ ] Why Osusu section shows the quote card
- [ ] CTA banner is full width with correct styling
- [ ] Footer appears at the bottom
- [ ] Navbar becomes white with shadow on scroll
- [ ] Page is fully responsive at 375px — no horizontal overflow
- [ ] No placeholder text, no "Lorem ipsum", no TODO comments visible

**Regression — nothing broken:**
- [ ] Existing WEEKLY group: create, join, start, contribute, schedule — all work
- [ ] Existing MONTHLY group: same flow works
- [ ] Auth flow: register, login, logout, refresh — all work
- [ ] Group join by invite code — works
- [ ] Contribution recording — works
- [ ] Cycle completion — works
- [ ] Profile update — works

---

## IMPORTANT CONSTRAINTS

- Do not change the database schema for any table other than adding DAILY to the frequency_type enum
- Do not change the payout_order column definition — it remains an integer on group_members
- Do not change the generatePayoutSchedule function signature — it must still accept (group, members) and return an array of cycle objects
- Do not remove WEEKLY or MONTHLY from any list — only add DAILY
- The shuffle must happen server-side only — never in the frontend
- The landing page redesign must not import any new npm packages — use only what is already installed (React, Tailwind, existing icon library if any)
- All new UI text must be in plain English — no Lorem Ipsum, no placeholder copy
