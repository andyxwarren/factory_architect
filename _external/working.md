
**Context & Tech Stack**
• A Next.js web app using Supabase for data storage.
• UI library: Material UI (MUI) for React components & theming.
• Full codebase will be provided for context: existing pages, components, hooks, and Supabase integration.
• You’ll also provide detailed schemas for all data models (administrators, players, content hierarchy, questions, etc.).
• Current flow: Sign up/sign in → Admin panel → set admin‑PIN → add player → assign content → play.
• Pain points: unclear layout, lack of onboarding guidance, heavy sidebar navigation, scattered screens.

**High‑Level Goals**

1. Streamline onboarding for new administrators.
2. Consolidate all admin interactions on a single parent dashboard—no deep navigation.
3. Surface each action as a focused, card‑style modal or pop‑up, maintaining context.
4. Guide admins through a clear workflow:

1. Create an admin PIN
2. Create a Player profile
3. Assign Content (row‑only selection, with visible level columns)
4. Ready‑to‑Play countdown
5. Gate return‑visit access to the dashboard behind the PIN.
6. Display all core admin features as cards on the dashboard:
– Player management (profile, assignments, progress heatmap, badges)
– Subscription/account controls
– Any other custom sections you’ll define
7. Provide hierarchical content assignment with intuitive parent‑child checkbox logic—but limit selection to entire rows, while still showing columns for Levels 1–6 so admins see lateral progression possibilities.
8. Offer a compact progress heatmap per Player, pre‑populated with example data so the visual effect is immediately apparent.

**1. First‑Time Onboarding Workflow**

* **Step 1: Admin PIN**
• Card‑style modal with a single MUI `<TextField` for a 4‑digit PIN and a `<Button` “Save PIN.”
• Show progress with an MUI `<Stepper` (“Step 1 of 3”).
* **Step 2: Player Profile**
• Card/modal labeled “Create Player,” with MUI form fields: avatar upload, preferred name, age (numeric required), etc.
• Update the same `<Stepper` to “Step 2 of 3.”
* **Step 3: Assign Content**
• Card/modal showing your content hierarchy (World → Realm → Mission) in an expandable list with `<Checkbox` controls.
• Only entire rows (all levels) are selectable on this initial assignment, but columns for Levels 1–6 remain visible so admins understand lateral progression.
• `<Button` “Save Assignment.”
• Update `<Stepper` to “Step 3 of 3.”
* **Completion Card**
• Inline card: “Ready to play?” + prominent `<Button`.
• On click: run a 3‑2‑1 countdown inside the card, then “GO!”
• Below: MUI `<Link` “Not ready? View Admin Dashboard.”

**2. PIN‑Protected Parent Dashboard**

* All admin features surface on one core page (`<ParentDashboard`).
* When a Player ends their session, show an MUI `<Dialog` prompting for the admin PIN before returning to the dashboard.
* After correct PIN, reveal all dashboard cards.

**3. Parent Dashboard as Card Grid**

* Use MUI `<Grid container` on a single page.
* **Cards** (all surfaced here as pop‑ups or modals):

1. **Player Management Card**

* Triggers a modal listing Players as sub‑cards or a table; each Player card shows avatar, name, age, assigned content summary, a preview of progress heatmap, badge count, and a “Manage” button.
2. **Subscription & Account Card**

* Displays current plan, cost, renewal date, with “Change Plan”/“Cancel Subscription” controls.
3. **(Your Custom Sections)**

* Any other features you define, each as its own card opening a modal.

**4. Hierarchical Content Assignment Component**

* Inside the “Assign Content” modal:
• An expandable MUI `<List` or `<Table` showing content hierarchy.
• Columns for Levels 1–6 are always visible.
• Only full‑row (all‑levels) selection allowed initially; parent `<Checkbox` selects/deselects entire row.
• Indeterminate state for partial child selection in deeper flows.
• “Save & Close” returns to the Parent Dashboard.

**5. Player Detail Modal**

* Opened from any Player card’s “Manage” button.
* **Progress & Achievements Table**
• MUI `<Table` styled as a heatmap: rows = content groups, columns = levels 1–6, cell background intensity shows completion metrics.
• **Pre‑populate** with example data in your code sandbox so the model can render a live preview of the heatmap.
• Expandable rows reveal individual missions if drilled into.
* **Badge Summary**
• MUI `<Chip` or `<Badge` list showing earned badges and counts.

**6. Data & Component Alignment**

* Reference your supplied schemas rather than prescribing fixed tables.
* Conceptually suggest any minor schema enhancements (e.g., an assignments audit log, badge‑tracking records).
* Outline React/MUI component hierarchy and data‑flow hooks using your existing code patterns:
• `<ParentDashboard` → `<CardGrid` → `<PlayerManagementCard` → `<PlayerModal`
• `<OnboardingWizard` (PIN, PlayerForm, AssignContent)
• `<ContentAssignmentList` (recursive)
• `<ProgressHeatmap`

**Deliverables Requested from the Model**

1. Complete React/Next.js + MUI components and modals for all onboarding steps, Parent Dashboard, Player management, content assignment, and progress view.
2. Component breakdown with props, state, and data‑fetching hooks, integrated into your existing codebase.
3. Conceptual guidance on any minor schema extensions (to map onto your provided schemas).
4. MUI theming recommendations: spacing, typography, color palette.
5. **Pre‑populated example data** in the Progress & Achievements heatmap so you can immediately see the visual effect.
6. Clear, step‑by‑step implementation plan with milestones.

