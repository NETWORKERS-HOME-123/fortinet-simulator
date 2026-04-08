
# FortiGate Dashboard & Monitors Clone — Modern UI

## Overview
A full-featured network security monitoring dashboard inspired by FortiGate's Dashboards & Monitors, with all major sections, mock data, and a clean modern design using shadcn/ui components.

## Navigation Structure
Collapsible sidebar with two main sections:

**Dashboard**
- Status (default landing)
- Network
- Security
- Users & Devices
- VPN

**Monitors (FortiView)**
- Sessions
- Sources
- Destinations
- Applications
- Threats
- VPN Monitor

## Page-by-Page Features

### 1. Status Dashboard
- **System Information widget** — hostname, firmware version, serial number, uptime, system time
- **License widget** — FortiCare, IPS, AV, Web Filter license status with expiry dates
- **Security Fabric widget** — topology diagram showing connected devices
- **CPU & Memory gauges** — real-time-style circular gauges with percentages
- **Session rate widget** — line chart showing sessions over time
- **Alert & Log Console** — scrollable list of recent system events with severity badges
- **HA Status widget** — primary/secondary status indicator

### 2. Network Dashboard
- **Application Bandwidth** — dual area charts (inbound/outbound) with overlap toggle
- **Sessions chart** — bar chart showing IPv4/IPv6 sessions over time with current count & SPU %
- **Memory usage** — area chart with percentage over time
- **Interface bandwidth** — per-interface traffic stats table
- **Routing table** — static & dynamic routes list
- **DHCP leases monitor** — table of active leases
- **IPsec tunnels** — tunnel status with up/down indicators

### 3. Security Dashboard
- **Top Threats widget** — bar chart of top attack types
- **Compromised Hosts** — table with severity, IP, threat type
- **FortiSandbox stats** — submission counts, clean/malicious breakdown
- **Intrusion Prevention** — top blocked signatures list
- **Web Filter** — category breakdown donut chart
- **Antivirus** — detected threats timeline

### 4. Users & Devices
- **Active users table** — username, IP, group, traffic, duration
- **Device inventory** — detected devices by type with OS info
- **Firewall users monitor** — authentication status

### 5. VPN Dashboard
- **SSL-VPN active sessions** — user, IP, duration, bandwidth
- **IPsec tunnel status** — tunnel names, phase status, traffic
- **VPN traffic chart** — bandwidth over time

### 6. FortiView Monitors
Each monitor page shows a sortable, filterable table with drill-down capability:
- **Sessions** — source/dest IP, protocol, policy, bytes, duration
- **Sources** — top source IPs ranked by sessions/bandwidth with threat score
- **Destinations** — top destination IPs/domains ranked by traffic
- **Applications** — app name, category, bandwidth, sessions, risk level
- **Threats** — threat name, severity, count, source, action taken
- **VPN Monitor** — VPN sessions with user, tunnel type, traffic

### Charts & Widgets
- Use Recharts (already available via shadcn charts) for all visualizations
- Area charts for bandwidth, bar charts for sessions, donut charts for breakdowns, gauge components for CPU/memory
- All charts include time range selectors (1 min, 5 min, 1 hour, 24 hours)

### Design Details
- Dark sidebar with Fortinet-inspired navy/dark theme
- Clean white content area with card-based widget layout
- Status badges with color coding (green/yellow/red)
- Responsive grid layout for widget arrangement
- "Add Widget" button on each dashboard page (UI only)
- Top bar with search, notifications bell, and user avatar
