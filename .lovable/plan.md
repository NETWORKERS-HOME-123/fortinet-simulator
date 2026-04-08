

# Fix Build Errors + Complete FortiGate Dashboard Feature Audit

## Immediate Fix: Build Errors

Both `StatusDashboard.tsx` and `NetworkDashboard.tsx` have **duplicate `export default function` declarations**. The real-time animation code (useState/useEffect with jitter) was prepended at lines 12-35 but the original function declaration at line 37/41 was never removed. This creates two function bodies with only one closing brace.

**Fix**: Merge the animation state/effects into the single component function, removing the duplicate declaration.

---

## Feature Audit vs. FortiGate 7.6 Official Documentation

Based on the FortiGate 7.6.0 Administration Guide, the official dashboard structure under **Dashboard & Monitors** is:

```text
Dashboard
  +-- Status
  +-- Security
  +-- Network
  |     +-- Static & Dynamic Routing monitor
  |     +-- DHCP monitor
  |     +-- IPsec monitor
  |     +-- SSL-VPN monitor
  +-- Assets & Identities
  |     +-- Assets (device list with filtering)
  |     +-- Firewall Users monitor
  +-- WiFi (not in scope -- requires FortiAP)

Monitors (FortiView)
  +-- Sources
  +-- Sessions
  +-- Top Source / Top Destination Firewall Objects
  +-- Top Websites & Sources by Category
  +-- Cloud Application view
```

### What Exists vs. What's Missing

| Feature | Status | Gap |
|---------|--------|-----|
| **Status Dashboard** | Built | Missing: FortiGuard info widget, Virtual Domain widget, Admin Users widget |
| **Security Dashboard** | Built | Missing: Compromised host drill-down modal (session details) |
| **Network Dashboard** | Built (broken) | Missing: SSL-VPN sub-monitor page |
| **Assets & Identities** | Renamed "Users & Devices" | Missing: Firewall Users sub-monitor, device MAC filtering, Assets detail panel |
| **WiFi Dashboard** | Not built | New page: FortiAP status, Clients by FortiAP |
| **VPN Dashboard** | Built (extra) | Not in official nav -- VPN info is under Network. Keep as-is for value. |
| **FortiView: Sources** | Built | Missing: Threat score color coding, drill-down detail panel |
| **FortiView: Sessions** | Built | Missing: Column sorting, filter bar, pagination |
| **FortiView: Destinations** | Built | Missing: Top Source/Destination Firewall Objects |
| **FortiView: Applications** | Built | Missing: Cloud application sub-view |
| **FortiView: Threats** | Built | OK |
| **FortiView: VPN Monitor** | Built | OK |
| **Widget system** | No | Missing: "Add Widget" button, widget reorder/resize (FortiGate lets admins customize dashboard layout) |
| **Row drill-down modals** | No | FortiGate allows clicking any table row to see detail in a slide-out or modal |
| **Real-time animations** | Partially broken | Duplicate function declarations cause build failure |

---

## Detailed Task List

### Phase 1: Critical Fixes
1. **Fix StatusDashboard.tsx build error** -- Remove duplicate function declaration, merge animation state into single component
2. **Fix NetworkDashboard.tsx build error** -- Same pattern: merge animation code into single function

### Phase 2: Missing Widgets on Existing Dashboards
3. **Status Dashboard: Add FortiGuard widget** -- Shows FortiGuard subscription details (AV version, IPS version, last update time)
4. **Status Dashboard: Add Administrator widget** -- Shows currently logged-in admins with IP, login time, access profile
5. **Status Dashboard: Add Virtual Domain widget** -- Shows VDOMs with traffic summary (even if just "root" for single-VDOM mode)
6. **Network Dashboard: Add SSL-VPN sub-monitor** -- Table of active SSL-VPN sessions with user, tunnel IP, duration, bandwidth (link from Network sidebar)
7. **Security Dashboard: Add compromised host detail modal** -- Click a compromised host row to see session details (source/dest IPs, protocols, policy matches) in a dialog

### Phase 3: Missing Dashboard Pages
8. **Add WiFi Dashboard page** -- FortiAP Status monitor (AP name, serial, status, clients, channel, firmware) + Clients by FortiAP table
9. **Add Assets & Identities page** -- Rename "Users & Devices" to "Assets & Identities" in sidebar, add MAC-based filtering UI, Assets detail slide-out panel
10. **Add Firewall Users sub-monitor** -- Table showing authenticated firewall users (username, auth method, group, traffic used, timeout remaining)

### Phase 4: FortiView Monitor Enhancements
11. **Add column sorting to all FortiView tables** -- Click column headers to sort ascending/descending with visual indicator
12. **Add filter bar to FortiView monitors** -- Search input + time range + dropdown filters (protocol, severity, etc.)
13. **Add row drill-down detail panels** -- Click any row in Sessions/Sources/Destinations/Applications to expand an inline detail card or open a dialog with full session info
14. **Add Top Websites & Sources by Category view** -- New FortiView page showing web categories ranked by sessions/bandwidth
15. **Add Cloud Application view** -- New FortiView page showing cloud/SaaS app usage (Office 365, Salesforce, etc.) with risk ratings

### Phase 5: Widget System & Polish
16. **Add "Add Widget" button** -- Each dashboard page gets a "+" button that opens a dialog listing available widgets for that dashboard type
17. **Add widget drag-to-reorder** -- Allow users to rearrange widget cards on each dashboard (persist to localStorage)
18. **Add sidebar sub-navigation** -- Network dashboard sidebar item should expand to show sub-monitors (Routing, DHCP, IPsec, SSL-VPN) as nested links
19. **Add dark mode toggle** -- Button in header bar to switch between light/dark themes
20. **Add notification dropdown** -- Click bell icon to show recent alerts in a popover panel

### Phase 6: Data Completeness
21. **Add WiFi mock data** -- FortiAP devices, connected clients, signal strength, channel utilization
22. **Add Firewall Users mock data** -- Authenticated users with auth type, group, timeout, traffic
23. **Add Cloud Applications mock data** -- SaaS app usage data for cloud application view
24. **Add Top Websites mock data** -- Website categories with visit counts and bandwidth

---

## Technical Details

**Build error root cause**: Lines 16-35 of both dashboard files contain a standalone block with `useState`, `useEffect`, and `jitter()` that tries to be its own function scope, but a second `export default function` immediately follows at line 37/41. The fix merges lines 12-35 into the body of the single component function.

**Widget system approach**: Use `react-grid-layout` or a simple drag-and-drop with CSS Grid. Store layout config in `localStorage` per dashboard.

**Drill-down modals**: Use shadcn `Dialog` or `Sheet` components. Each table row gets an `onClick` that opens the detail view with the row's data passed as props.

**Sidebar sub-navigation**: Use shadcn `Collapsible` inside `SidebarMenuItem` to nest sub-links under Network and Assets & Identities.

