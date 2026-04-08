

# Accurate FortiGate Dashboard Clone — Gap Analysis & Implementation Plan

## Source Reference
- Video: https://www.youtube.com/watch?v=a7hhluPGS90 (FortiGate Dashboard Walkthrough, 35 min)
- Official docs: FortiGate/FortiOS 7.6.6 Administration Guide — Dashboards and Monitors section

## Official FortiGate Dashboard Structure (from docs lines 785-812)

```text
Dashboard
├── Status Dashboard
│   ├── System Information widget (hostname, serial, firmware, uptime, system time, operation mode)
│   ├── Licenses widget (FortiCare, UTM bundle, FortiCloud status)
│   ├── FortiGuard widget (AV/IPS/App DB versions, last update)
│   ├── Security Fabric widget (topology of connected Fortinet devices)
│   ├── CPU gauge widget
│   ├── Memory gauge widget
│   ├── Session Rate chart
│   ├── Administrators widget (logged-in admins)
│   ├── Virtual Domains widget
│   ├── HA Status widget
│   └── Alert & Log Console
├── Security Dashboard
│   ├── Top Threats bar chart
│   ├── Compromised Hosts table → click row → session detail modal
│   ├── FortiSandbox stats
│   ├── IPS blocked signatures
│   ├── Web Filter category donut
│   └── Antivirus detected timeline
├── Network Dashboard
│   ├── Application Bandwidth chart
│   ├── Sessions chart (IPv4/IPv6, current count, SPU %)
│   ├── Memory Usage chart
│   ├── Interface Bandwidth table
│   ├── Sub-monitors:
│   │   ├── Static & Dynamic Routing monitor
│   │   ├── DHCP monitor
│   │   └── IPsec monitor
│   └── (No SSL-VPN sub-monitor — SSL-VPN was under VPN, not Network)
├── Assets & Identities
│   ├── Assets tab (device list with filtering by type/OS)
│   ├── Asset details slide-out panel (click device → full info)
│   ├── MAC-based address adding
│   └── Firewall Users monitor (authenticated users table)
├── WiFi Dashboard
│   ├── FortiAP Status monitor
│   └── Clients by FortiAP monitor
└── Agentless VPN monitor (not SSL-VPN under Network)

Monitors (FortiView)
├── Sources
├── Sessions
├── Top Source / Top Destination Firewall Objects
├── Top Websites & Sources by Category
├── Cloud Application view
│   └── Application risk levels
└── FortiTelemetry monitors (optional)
```

## Gap Analysis — What's Missing or Inaccurate

### Status Dashboard — MOSTLY COMPLETE
- **Missing**: System Time display (clock), Operation Mode (NAT/Transparent)
- **Missing**: "Add Widget" button (FortiGate allows customizing which widgets appear)
- **Missing**: Widget edit/close icons per widget header (gear icon, X button)

### Security Dashboard — MOSTLY COMPLETE
- **OK**: Has compromised host drill-down modal already
- **Missing**: Severity color-coded threat score badges in compromised hosts

### Network Dashboard — STRUCTURAL ISSUE
- **Problem**: Routing Table and DHCP Leases are shown inline. In FortiGate they are separate sub-monitor pages accessible from sidebar
- **Problem**: SSL-VPN monitor is incorrectly placed under Network. Per official docs, it's NOT under Network dashboard. The Network sub-monitors are: Routing, DHCP, IPsec only
- **Fix**: Move routing/DHCP/IPsec to sub-pages, keep charts on main Network page

### Assets & Identities — NEEDS WORK
- **Missing**: Proper Assets tab showing detected devices with type/OS/MAC columns and filtering dropdowns
- **Missing**: Asset detail slide-out (Sheet) when clicking a device row showing all device properties
- **Firewall Users**: exists but needs auth method, group, timeout columns

### WiFi Dashboard — OK
- Has FortiAP Status and Clients tables

### FortiView Monitors — MISSING ITEMS
- **Missing**: "Top Source Firewall Objects" and "Top Destination Firewall Objects" monitors (separate from Sources/Destinations)
- **Sessions monitor**: Already has sorting/filtering/pagination/drill-down — good
- **Sources monitor**: Missing threat score color coding
- **Applications monitor**: Missing risk level color badges
- **Missing**: FortiView interface features — bubble chart view toggle (FortiView shows bubble charts by default, table view is secondary)

### Global UI Features Missing
- **No "Add Widget" button** on dashboard pages
- **No widget close/edit buttons** in widget headers
- **No dark mode toggle** (FortiGate has dark theme)
- **No notification popover** when clicking bell icon
- **Header missing**: FortiOS version badge, hostname display in header bar

---

## Implementation Plan

### Phase 1: Fix Network Dashboard Structure
1. **Split Network sub-monitors into separate routed pages**
   - `/network/routing` — Static & Dynamic Routing monitor (move existing routing table here, add type/distance/metric columns)
   - `/network/dhcp` — DHCP monitor (move existing DHCP table, add MAC, lease time, server columns)  
   - `/network/ipsec` — IPsec monitor (move existing IPsec table, add detail modal on row click)
   - Keep Application Bandwidth, Sessions, Memory charts on main `/network` page
   - Remove SSL-VPN from Network sub-nav (it belongs under VPN or standalone)
2. **Update sidebar** to show Routing/DHCP/IPsec as Network children instead of SSL-VPN

### Phase 2: Enhance Status Dashboard
3. **Add system time clock** — live updating clock showing current date/time
4. **Add operation mode** to System Info widget (NAT/Transparent)
5. **Add widget header actions** — each Card gets a small settings gear and close icon (UI only, no persistence needed)
6. **Add "Add Widget" floating button** — opens dialog listing available widgets for the dashboard

### Phase 3: Fix Assets & Identities
7. **Rebuild Assets tab** — proper device table with columns: Device Name, MAC Address, IP, OS, Type, Status, Last Seen
8. **Add filter dropdowns** — filter by device type (PC/Mobile/IoT/Server), OS, status
9. **Add Asset detail Sheet** — click row opens right-side slide-out with full device properties, traffic stats, associated user
10. **Enhance Firewall Users tab** — add auth method, group, traffic used, timeout remaining columns

### Phase 4: FortiView Accuracy
11. **Add Top Firewall Objects monitors** — new page `/monitors/firewall-objects` with two tabs: Top Source Objects and Top Destination Objects (policy-level grouping)
12. **Add bubble chart toggle** to Sources/Destinations/Applications monitors — FortiView defaults to a bubble/treemap visualization, with table as secondary view
13. **Add risk level color badges** to Applications monitor (1-5 scale with green-to-red coloring)
14. **Add threat score color coding** to Sources monitor

### Phase 5: Global UI Polish
15. **Add notification popover** — clicking bell icon shows dropdown with recent alerts from alertLogs
16. **Add dark mode toggle** in header — switch CSS variables between light/dark
17. **Add hostname + firmware badge** in header bar (shows "FGT-DC-PRIMARY v7.6.0")
18. **Add "Add Widget" dialog** — each dashboard gets a "+" button opening a picker

### Phase 6: Missing Mock Data
19. **Expand routing mock data** — add distance, metric, preference, age columns
20. **Expand DHCP mock data** — add MAC address, lease time, DHCP server, interface columns
21. **Add Firewall Objects mock data** — policy names, source/dest object groupings with hit counts

---

## Technical Approach

- **Sub-monitor pages**: Create `src/pages/network/RoutingMonitor.tsx`, `DhcpMonitor.tsx`, `IpsecMonitor.tsx` as separate route components
- **Bubble chart**: Use Recharts `ScatterChart` with bubble size mapped to bandwidth/sessions
- **Widget actions**: Add optional `onClose` and `onSettings` props to Card wrappers, render icon buttons in CardHeader
- **Dark mode**: Use Tailwind `dark:` classes, toggle by adding/removing `dark` class on `<html>` element, persist to localStorage
- **Notification popover**: Use shadcn `Popover` on the Bell button, render last 10 alertLogs with severity badges

