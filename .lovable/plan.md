

# Full Interactive FortiGate Training Lab Simulation — Complete Plan

Since this is a **student training lab demo simulation**, the goal shifts from "dashboard clone" to a **fully interactive learning environment** where students can explore, configure, and respond to simulated security events — all frontend-only with mock data.

## What Makes This a Training Simulation (vs. a Dashboard)

Currently, the app is **read-only visualization**. A training simulation needs:
- **Simulated CLI terminal** (FortiOS CLI commands)
- **Configuration forms** (create/edit policies, interfaces, VPN tunnels)
- **Scenario engine** (guided labs with objectives and validation)
- **Event injection** (trigger attacks, failures, alerts in real-time)
- **Student progress tracking** (localStorage-based)

---

## Phase 1: Configuration Management Pages (CRUD Forms)

### 1A. Firewall Policy Editor
- New route `/policy` with a policy table (ID, Name, Source, Destination, Service, Action, NAT, Log, Status)
- Each row is clickable → opens a full **policy edit form** in a Dialog/Sheet:
  - Source interface + address object dropdowns
  - Destination interface + address object dropdowns
  - Service selector (HTTP, HTTPS, SSH, ALL, custom)
  - Action toggle (Accept / Deny / IPsec)
  - UTM profile selectors (AV, IPS, Web Filter, App Control)
  - NAT toggle, Logging toggle, Schedule selector
  - Enable/Disable toggle
- "Create New Policy" button → same form in create mode
- Drag to reorder policies (policy order matters in FortiGate)
- All state in React state + localStorage persistence

### 1B. Network Interface Configuration
- New route `/system/interfaces`
- Table of all interfaces with inline edit capability
- Click row → Sheet with: IP/Mask, Admin status, DHCP/Static/PPPoE mode, MTU, Speed, VLAN ID, Zone assignment, Administrative access checkboxes (HTTPS, SSH, Ping, SNMP)
- "Create VLAN Sub-interface" button

### 1C. Address Object Manager
- New route `/firewall/addresses`
- CRUD for address objects used in policies: Subnet, IP Range, FQDN, Geography, Wildcard
- Group creation (select multiple objects → group them)

### 1D. VPN Tunnel Configuration
- IPsec Wizard: multi-step form (Remote Gateway → Authentication → Phase 1 → Phase 2 → Policy)
- SSL-VPN Settings: portal configuration, realm, user/group mapping
- All saved to localStorage

---

## Phase 2: Simulated FortiOS CLI Terminal

### 2A. Terminal Component
- New `CLITerminal.tsx` component — full-screen or slide-up panel
- Accessible via a "CLI Console" button in the header or sidebar
- Green-on-black terminal aesthetic with monospace font
- Command history (up/down arrows), autocomplete (Tab key)

### 2B. Command Parser
- `src/simulation/cliParser.ts` — parse FortiOS-style commands:
  - `get system status` → display system info from mockData
  - `get system interface` → list interfaces
  - `show firewall policy` → display policy table
  - `diagnose sys session list` → show sessions
  - `execute ping <ip>` → simulated ping with random latency
  - `execute traceroute <ip>` → simulated traceroute
  - `config firewall policy` / `edit <id>` / `set srcaddr ...` / `end` → modify mock state
  - `diagnose debug flow` → show simulated packet flow trace
  - `get router info routing-table all` → show routes
- Unknown commands → "Unknown action 0" (matching real FortiOS)

---

## Phase 3: Training Scenario Engine

### 3A. Scenario Framework
- `src/simulation/scenarios.ts` — array of lab scenarios, each with:
  - Title, description, difficulty level (Beginner/Intermediate/Advanced)
  - Ordered objectives (checklist) with validation functions
  - Hints per objective
  - Expected duration
  - Category tags (Firewall, VPN, IPS, Troubleshooting)

### 3B. Scenario Runner UI
- New route `/training` — Lab Catalog page showing all available scenarios as cards
- Click a scenario → enters **Lab Mode**:
  - Objectives panel pinned on the right side (collapsible)
  - Each objective has a checkbox, auto-checked when validation passes
  - Hint button reveals progressive hints
  - Timer showing elapsed time
  - "Complete Lab" button when all objectives are checked
  - Score/summary at end

### 3C. Example Scenarios (10 Labs)

**Beginner:**
1. **Lab 1: Dashboard Navigation** — Navigate to each dashboard, identify CPU usage, find a critical alert
2. **Lab 2: View Routing Table** — Go to Network → Routing, identify the default gateway, find the OSPF route
3. **Lab 3: Check VPN Status** — Find which IPsec tunnel is down, identify the remote IP

**Intermediate:**
4. **Lab 4: Create Firewall Policy** — Create a policy allowing LAN to Internet on HTTPS only with AV profile
5. **Lab 5: Block a Compromised Host** — Find the botnet host in Security Dashboard, quarantine it via policy
6. **Lab 6: Configure SSL-VPN** — Set up SSL-VPN portal, assign user group, verify connection
7. **Lab 7: DHCP Server Setup** — Configure DHCP scope on an interface, set DNS, verify leases

**Advanced:**
8. **Lab 8: Incident Response** — Ransomware alert fires → investigate source → isolate host → check lateral movement → create blocking policy
9. **Lab 9: IPsec VPN Troubleshooting** — Diagnose why Branch-CHI tunnel is down → check Phase 1/2 settings → fix configuration
10. **Lab 10: Full Network Audit** — Review all policies, find overly permissive rules, check certificate expiry, review IPS signatures

---

## Phase 4: Live Event Injection System

### 4A. Event Simulator
- `src/simulation/eventEngine.ts` — background engine that can inject events:
  - New alert log entries (IPS trigger, AV detection, auth failure)
  - Interface going down/up
  - CPU/memory spikes
  - New compromised host appearing
  - IPsec tunnel flapping
  - DHCP lease exhaustion warning
- Events are triggered by:
  - Scenario scripts (automatic during labs)
  - Manual "Inject Event" button (instructor mode) — a toolbar with event type dropdown and "Fire" button

### 4B. Real-Time Dashboard Updates
- Events modify the shared mock state (React Context or Zustand store)
- All dashboards re-render when events fire
- Toast notifications for critical events
- Alert console auto-scrolls new entries

---

## Phase 5: Student Progress & Assessment

### 5A. Progress Tracker
- `src/simulation/progressStore.ts` — localStorage-based store tracking:
  - Completed labs with timestamps and scores
  - Time spent per lab
  - Hints used count
  - CLI commands executed (for analytics)

### 5B. Progress Dashboard
- New route `/training/progress`
- Cards showing: labs completed / total, average score, total time
- Per-lab breakdown table with status badges (Not Started / In Progress / Completed)
- "Reset All Progress" button

### 5C. Lab Report Export
- "Export Report" button generates a summary (could be a printable HTML view or downloadable text)

---

## Phase 6: Instructor Mode

### 6A. Instructor Toolbar
- Toggle via a hidden keyboard shortcut (Ctrl+Shift+I) or a settings option
- When active, shows a floating toolbar with:
  - Event injection buttons (trigger attack, fail interface, spike CPU)
  - "Reset All State" button
  - View student progress summary
  - Scenario auto-play (run events on a timer for demo purposes)

---

## Technical Architecture

```text
src/
├── simulation/
│   ├── cliParser.ts          # FortiOS command parser + responses
│   ├── scenarios.ts          # Lab definitions with objectives
│   ├── eventEngine.ts        # Event injection + real-time state mutations
│   ├── progressStore.ts      # localStorage progress tracking
│   └── simulationContext.tsx  # React Context wrapping mutable mock state
├── components/
│   ├── CLITerminal.tsx        # Terminal UI component
│   ├── ScenarioRunner.tsx     # Lab mode with objectives panel
│   ├── InstructorToolbar.tsx  # Floating instructor controls
│   └── ProgressCard.tsx       # Lab progress card
├── pages/
│   ├── training/
│   │   ├── LabCatalog.tsx     # All available labs
│   │   └── ProgressPage.tsx   # Student progress dashboard
│   ├── config/
│   │   ├── PolicyEditor.tsx   # Firewall policy CRUD
│   │   ├── Interfaces.tsx     # Interface configuration
│   │   └── Addresses.tsx      # Address object manager
```

- **State management**: Wrap the app in a `SimulationProvider` (React Context) that holds mutable copies of all mock data. All dashboards read from context instead of static imports. Events mutate context state.
- **No backend needed**: Everything persists in localStorage.
- **Sidebar updates**: Add "Training Labs" and "Configuration" sections to the sidebar.

---

## Implementation Order

| Step | Description | Files |
|------|-------------|-------|
| 1 | Create SimulationContext wrapping all mock data as mutable state | `simulationContext.tsx` |
| 2 | Migrate all dashboards to read from context instead of static imports | All dashboard pages |
| 3 | Build CLI Terminal component with basic command parser | `CLITerminal.tsx`, `cliParser.ts` |
| 4 | Build Firewall Policy Editor (CRUD form) | `PolicyEditor.tsx` |
| 5 | Build Scenario framework + 3 beginner labs | `scenarios.ts`, `ScenarioRunner.tsx`, `LabCatalog.tsx` |
| 6 | Build Event Engine + wire to context | `eventEngine.ts` |
| 7 | Build remaining 7 labs (intermediate + advanced) | `scenarios.ts` |
| 8 | Build Interface/Address config pages | `Interfaces.tsx`, `Addresses.tsx` |
| 9 | Build Progress tracking + dashboard | `progressStore.ts`, `ProgressPage.tsx` |
| 10 | Build Instructor toolbar | `InstructorToolbar.tsx` |
| 11 | Update sidebar with Training + Config sections | `AppSidebar.tsx` |

