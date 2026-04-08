

# Redesign Labs as Real-Time Interactive Simulations

## Problem
Current labs are passive checklists — students navigate, read, and click "Mark Done." There's no actual hands-on interaction where the student performs real configuration changes, the system validates automatically, and dashboards reflect those changes in real time.

## Solution
Rewrite all 10 labs so every objective requires a **real action** (create a policy, run a CLI command, change an interface, inject an event) that is **automatically validated** against SimulationContext state. No more "Mark Done" buttons — the system detects completion.

## Key Changes

### 1. Replace manual validation with automatic state checks
- Remove `validationType: "manual"` entirely
- Every objective gets a `validate(state, cliHistory)` function that checks SimulationContext
- `ScenarioRunner` polls state on every render and auto-completes objectives
- Remove the "Mark Done" button — objectives only complete when the student actually does the work

### 2. Add scenario setup/teardown
- Each lab gets an `onStart(ctx)` function that sets up initial conditions (e.g., break a tunnel, inject an alert, remove a policy)
- Each lab gets an `onComplete(ctx)` function for cleanup/reset
- This makes labs repeatable and independent

### 3. Redesigned Labs (all 10)

**Lab 1: Configure a New Interface**
- Objective 1: Navigate to Interfaces page → validated by route
- Objective 2: Set port6 IP to `192.168.100.1/24` → validated by checking `state.interfaces` for port6 IP
- Objective 3: Set port6 admin access to include HTTPS and Ping → validated by checking adminAccess array
- Objective 4: Verify via CLI `get system interface` → validated by CLI history

**Lab 2: Build Your First Firewall Policy**
- Setup: Remove policy ID 1 (LAN-to-Internet) so LAN has no internet
- Objective 1: Create a new policy: srcintf=port3, dstintf=port1, action=accept → validated by checking `state.policies`
- Objective 2: Set service to HTTPS only (not ALL) → validated by policy service field
- Objective 3: Enable AV profile "default" → validated by policy utmProfiles.av
- Objective 4: Verify via CLI `show firewall policy` → validated by CLI history

**Lab 3: Address Objects & Policy Binding**
- Objective 1: Create a new address object "WEB_SERVERS" type subnet `172.16.10.0/24` → validated by `state.addressObjects`
- Objective 2: Create a policy using "WEB_SERVERS" as destination → validated by policy dstaddr
- Objective 3: Verify the object via CLI `get firewall address` → CLI validation

**Lab 4: Web Filter Policy Enforcement**
- Setup: Ensure Block-Gambling policy exists
- Objective 1: Navigate to Security Dashboard, identify blocked categories → route validation
- Objective 2: Create a new DENY policy for FQDN `*.socialmedia.com` → validated by policy + address object creation
- Objective 3: Verify block in policy list → route + state validation

**Lab 5: SSL-VPN Access Control**
- Objective 1: Navigate to SSL-VPN monitor, count active sessions → route validation
- Objective 2: Create an address object "RESTRICTED_SERVERS" `10.0.50.0/24` → state validation
- Objective 3: Create a policy: srcintf=ssl.root, dstintf=port3, dstaddr=RESTRICTED_SERVERS, action=accept → state validation
- Objective 4: Verify via CLI `show firewall policy` → CLI validation

**Lab 6: IPsec Tunnel Diagnostics**
- Setup: `onStart` sets Branch-CHI tunnel phase2 to "down"
- Objective 1: Navigate to IPsec Monitor, identify the down tunnel → route validation
- Objective 2: Ping remote gateway via CLI `execute ping 192.0.2.100` → CLI validation
- Objective 3: Run `get vpn ipsec tunnel summary` → CLI validation
- Objective 4: Use instructor toolbar or CLI to bring tunnel back up → validate `state.ipsecTunnels` Branch-CHI phase2="up"

**Lab 7: Respond to IPS Alert**
- Setup: `onStart` injects a critical IPS alert into alertLogs
- Objective 1: Navigate to Status Dashboard, find the new critical alert → route validation
- Objective 2: Navigate to Security Dashboard to identify source IP → route validation
- Objective 3: Create a DENY policy blocking the attacker IP → validate new deny policy exists
- Objective 4: Run `diagnose debug flow` in CLI → CLI validation

**Lab 8: Interface Failure & Recovery**
- Setup: `onStart` sets port2 (WAN2) to "down"
- Objective 1: Navigate to Network Dashboard, identify the down interface → route validation
- Objective 2: Check routing table impact via CLI `get router info routing-table all` → CLI validation
- Objective 3: Bring port2 back up via Interfaces config page (set status to "up") → validate `state.interfaces` port2 status
- Objective 4: Verify recovery via CLI `get system interface` → CLI validation

**Lab 9: Quarantine a Compromised Host**
- Setup: `onStart` adds a new compromised host to state
- Objective 1: Find the compromised host on Security Dashboard → route validation
- Objective 2: Create address object for the host IP → state validation
- Objective 3: Create a top-priority DENY policy using that address → state validation
- Objective 4: Verify isolation via CLI `show firewall policy` → CLI validation

**Lab 10: Full Security Audit & Hardening**
- Objective 1: Identify overly permissive policies (service=ALL) in Policy Editor → route validation
- Objective 2: Edit policy ID 1 to change service from ALL to "HTTPS DNS" → validate `state.policies[0].service`
- Objective 3: Edit policy ID 5 (VPN) to restrict service from ALL to "HTTPS SSH RDP" → validate state
- Objective 4: Run `get system performance status` and verify health → CLI validation
- Objective 5: Check expired licenses on Status Dashboard → route validation

### 4. ScenarioRunner changes
- Replace "Mark Done" button with auto-validation loop that checks `validate(state, cliHistory)` for each objective
- Add `onStart` call when lab loads (to set up preconditions)
- Track route changes via `useLocation()` for navigation validation
- Show real-time objective status: pending (gray), in-progress (yellow pulse), completed (green check)
- Add "action required" indicators pointing students to the right page

### 5. Scenario type updates
```text
LabObjective changes:
- Remove validationType: "manual"
- Replace validationData with: validate: (state, cliHistory, currentPath) => boolean
- Add actionHint: string (e.g. "Go to Configuration → Interfaces")

LabScenario changes:
- Add onStart?: (ctx: SimulationContextType) => void
- Add onComplete?: (ctx: SimulationContextType) => void
```

## Files to modify
| File | Change |
|------|--------|
| `src/simulation/scenarios.ts` | Rewrite all 10 labs with validate functions and onStart/onComplete |
| `src/components/ScenarioRunner.tsx` | Auto-validation loop, remove "Mark Done", add onStart lifecycle, route tracking |

## What stays the same
- SimulationContext (already supports all needed mutations)
- CLI Terminal (already tracks cliHistory)
- Policy Editor, Interfaces, Addresses pages (already functional)
- Progress tracking (progressStore.ts)
- Instructor toolbar

