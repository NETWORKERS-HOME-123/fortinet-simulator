// Training lab scenario definitions — Aligned with Fortinet NSE 4 curriculum
// All objectives use automatic validation against SimulationContext state

import type { FirewallPolicy, NetworkInterface, AddressObject, SimulationEvent } from "./simulationContext";

// Minimal state shape for validation (avoids circular imports)
export interface ValidationState {
  policies: FirewallPolicy[];
  interfaces: NetworkInterface[];
  addressObjects: AddressObject[];
  alertLogs: Array<{ severity: string; source?: string; message: string; [k: string]: unknown }>;
  ipsecTunnels: Array<{ name: string; phase1: string; phase2: string; [k: string]: unknown }>;
  compromisedHosts: Array<{ ip: string; hostname: string; [k: string]: unknown }>;
  [key: string]: unknown;
}

export interface LabObjective {
  id: string;
  title: string;
  description: string;
  hints: string[];
  actionHint: string;
  navPath: string; // exact route where this task is performed
  validate: (state: ValidationState, cliHistory: string[], currentPath: string) => boolean;
}

export interface LabScenario {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  estimatedMinutes: number;
  startPath: string; // route to navigate to when lab starts
  objectives: LabObjective[];
  tags: string[];
  nseAlignment: string;
  onStart?: (ctx: {
    setInterfaceStatus: (name: string, status: "up" | "down") => void;
    setTunnelStatus: (name: string, phase2: "up" | "down") => void;
    addAlert: (alert: any) => void;
    addCompromisedHost: (host: any) => void;
    deletePolicy: (id: number) => void;
    updateInterface: (name: string, updates: Partial<NetworkInterface>) => void;
  }) => void;
  onComplete?: (ctx: { resetState: () => void }) => void;
}

export const scenarios: LabScenario[] = [
  // ============= Lab 1: Configure a New Interface =============
  {
    id: "lab-1",
    title: "Configure a New Interface",
    description: "Configure port6 as a new internal interface with a static IP, admin access settings, and verify via CLI. This lab teaches basic interface configuration aligned with NSE 4.1 Module 1.",
    difficulty: "beginner",
    category: "System Administration",
    estimatedMinutes: 10,
    startPath: "/config/interfaces",
    tags: ["interfaces", "network", "NSE4.1"],
    nseAlignment: "NSE 4.1 — Module 1: System and Network Settings",
    objectives: [
      {
        id: "1-1",
        title: "Set port6 IP Address",
        description: "Find port6 in the interfaces list. Click Edit and set its IP address to 192.168.100.1/24.",
        hints: [
          "Find port6 in the interfaces table — it currently shows 0.0.0.0/0",
          "Click the Edit (pencil) icon on port6's row",
          "In the IP Address field, enter: 192.168.100.1/24",
          "Click Save to apply",
        ],
        actionHint: "Edit port6 → set IP to 192.168.100.1/24",
        navPath: "/config/interfaces",
        validate: (state) => {
          const port6 = state.interfaces.find(i => i.name === "port6");
          return !!port6 && port6.ip === "192.168.100.1/24";
        },
      },
      {
        id: "1-2",
        title: "Enable HTTPS and Ping Admin Access",
        description: "While editing port6, enable both HTTPS and Ping in the Admin Access settings.",
        hints: [
          "Click Edit on port6 again (or stay in the edit dialog)",
          "Find the Admin Access checkboxes",
          "Check both HTTPS and Ping",
          "This allows management via HTTPS and ICMP ping on port6",
        ],
        actionHint: "Edit port6 → enable HTTPS + Ping admin access",
        navPath: "/config/interfaces",
        validate: (state) => {
          const port6 = state.interfaces.find(i => i.name === "port6");
          if (!port6) return false;
          const access = port6.adminAccess.map(a => a.toUpperCase());
          return access.includes("HTTPS") && access.includes("PING");
        },
      },
      {
        id: "1-3",
        title: "Verify via CLI",
        description: "Open the CLI terminal ('>_' button in header) and run 'get system interface' to verify port6 now shows your new IP.",
        hints: [
          "Click the terminal icon ('>_') in the top header bar",
          "Type: get system interface",
          "Press Enter — confirm port6 shows 192.168.100.1/24",
        ],
        actionHint: "Open CLI → run: get system interface",
        navPath: "/config/interfaces",
        validate: (_state, cli) => cli.some(c => c.toLowerCase().includes("get system interface")),
      },
    ],
  },

  // ============= Lab 2: Build Your First Firewall Policy =============
  {
    id: "lab-2",
    title: "Build Your First Firewall Policy",
    description: "The LAN-to-Internet policy has been removed! Create a new policy to restore internet access from port3 to port1, restrict it to HTTPS only, and enable antivirus scanning.",
    difficulty: "beginner",
    category: "Firewall",
    estimatedMinutes: 15,
    startPath: "/config/policies",
    tags: ["firewall", "policy", "utm", "NSE4.1"],
    nseAlignment: "NSE 4.1 — Module 2: Firewall Policies",
    onStart: (ctx) => {
      ctx.deletePolicy(1);
    },
    objectives: [
      {
        id: "2-1",
        title: "Create LAN-to-WAN Policy",
        description: "Click 'Create New' to add a policy. Set Source Interface = port3, Destination Interface = port1, Action = ACCEPT.",
        hints: [
          "Click the 'Create New' button at the top of the policy table",
          "Set Source Interface to 'port3' (LAN)",
          "Set Destination Interface to 'port1' (WAN1)",
          "Set Action to 'accept' and enable NAT",
        ],
        actionHint: "Create New → port3 → port1, ACCEPT",
        navPath: "/config/policies",
        validate: (state) => {
          return state.policies.some(p =>
            p.srcintf === "port3" && p.dstintf === "port1" && p.action === "accept"
          );
        },
      },
      {
        id: "2-2",
        title: "Restrict Service to HTTPS",
        description: "Edit your new policy and change Service from ALL to HTTPS. Principle of least privilege — don't allow everything!",
        hints: [
          "Click Edit on your newly created policy",
          "Find the Service field and change it from ALL to HTTPS",
          "Using 'ALL' is overly permissive and a security risk",
        ],
        actionHint: "Edit your policy → set Service to HTTPS",
        navPath: "/config/policies",
        validate: (state) => {
          return state.policies.some(p =>
            p.srcintf === "port3" && p.dstintf === "port1" && p.action === "accept" &&
            p.service.toUpperCase().includes("HTTPS") && !p.service.toUpperCase().includes("ALL")
          );
        },
      },
      {
        id: "2-3",
        title: "Enable Antivirus Profile",
        description: "Edit the policy's Security Profiles section and set AntiVirus to 'default' to scan traffic for malware.",
        hints: [
          "Edit your policy and scroll to Security Profiles",
          "Set AntiVirus to 'default'",
          "This enables real-time malware scanning on allowed traffic",
        ],
        actionHint: "Edit policy → Security Profiles → AV = default",
        navPath: "/config/policies",
        validate: (state) => {
          return state.policies.some(p =>
            p.srcintf === "port3" && p.dstintf === "port1" && p.action === "accept" &&
            p.utmProfiles.av === "default"
          );
        },
      },
      {
        id: "2-4",
        title: "Verify via CLI",
        description: "Open CLI and run 'show firewall policy' to confirm your new policy appears.",
        hints: [
          "Click the terminal icon in the header",
          "Type: show firewall policy",
          "Confirm srcintf=port3, dstintf=port1, av-profile=default",
        ],
        actionHint: "Open CLI → run: show firewall policy",
        navPath: "/config/policies",
        validate: (_state, cli) => cli.some(c => c.toLowerCase().includes("show firewall policy")),
      },
    ],
  },

  // ============= Lab 3: Address Objects & Policy Binding =============
  {
    id: "lab-3",
    title: "Address Objects & Policy Binding",
    description: "Create a reusable address object for web servers and bind it to a firewall policy. Learn how address objects simplify policy management.",
    difficulty: "beginner",
    category: "Firewall",
    estimatedMinutes: 15,
    startPath: "/config/addresses",
    tags: ["address-objects", "firewall", "NSE4.1"],
    nseAlignment: "NSE 4.1 — Module 2: Firewall Policies / Address Objects",
    objectives: [
      {
        id: "3-1",
        title: "Create WEB_SERVERS Address Object",
        description: "Click 'Create New' and add an address object: Name = WEB_SERVERS, Type = subnet, Value = 172.16.10.0/24.",
        hints: [
          "Click 'Create New' at the top of the Addresses page",
          "Name: WEB_SERVERS",
          "Type: subnet",
          "Subnet/IP: 172.16.10.0/24",
        ],
        actionHint: "Create New → WEB_SERVERS, subnet, 172.16.10.0/24",
        navPath: "/config/addresses",
        validate: (state) => {
          return state.addressObjects.some(a =>
            a.name.toUpperCase() === "WEB_SERVERS" && a.value.includes("172.16.10.0")
          );
        },
      },
      {
        id: "3-2",
        title: "Create Policy Using WEB_SERVERS",
        description: "Navigate to Firewall Policies and create a new policy using WEB_SERVERS as the destination address.",
        hints: [
          "Go to Configuration → Firewall Policies",
          "Click 'Create New'",
          "Set Source: port1 (WAN), Destination: port3 (LAN)",
          "Set Destination Address to WEB_SERVERS",
        ],
        actionHint: "Go to Policies → Create New with dstaddr = WEB_SERVERS",
        navPath: "/config/policies",
        validate: (state) => {
          return state.policies.some(p =>
            p.dstaddr.toUpperCase().includes("WEB_SERVERS")
          );
        },
      },
      {
        id: "3-3",
        title: "Verify Address Object via CLI",
        description: "Run 'get firewall address' in the CLI to confirm WEB_SERVERS exists.",
        hints: [
          "Open CLI terminal ('>_' icon in header)",
          "Type: get firewall address",
          "WEB_SERVERS should appear with subnet 172.16.10.0/24",
        ],
        actionHint: "Open CLI → run: get firewall address",
        navPath: "/config/addresses",
        validate: (_state, cli) => cli.some(c => c.toLowerCase().includes("get firewall address")),
      },
    ],
  },

  // ============= Lab 4: Web Filter Policy Enforcement =============
  {
    id: "lab-4",
    title: "Web Filter Policy Enforcement",
    description: "Block social media by creating an FQDN address object and a DENY policy. Learn how FortiGuard categorization works with firewall rules.",
    difficulty: "intermediate",
    category: "UTM Security",
    estimatedMinutes: 15,
    startPath: "/security",
    tags: ["web-filter", "fqdn", "policy", "NSE4.1"],
    nseAlignment: "NSE 4.1 — Module 7: Web Filtering",
    objectives: [
      {
        id: "4-1",
        title: "Review Current Web Filter Stats",
        description: "On the Security Dashboard, review the Web Filter widget to see which categories are already blocked (Gambling, Malicious, Adult, Phishing).",
        hints: [
          "You're already on the Security Dashboard",
          "Scroll down to find the Web Filter Categories card",
          "Note: Gambling=blocked, Malicious=blocked, Adult Content=blocked",
        ],
        actionHint: "Review Web Filter widget on this page",
        navPath: "/security",
        validate: (_state, _cli, path) => path === "/security",
      },
      {
        id: "4-2",
        title: "Create Social Media FQDN Object",
        description: "Go to Addresses and create an FQDN object: Name = SOCIAL_MEDIA_BLOCK, Type = fqdn, Value = *.socialmedia.com.",
        hints: [
          "Navigate to Configuration → Addresses",
          "Click 'Create New'",
          "Name: SOCIAL_MEDIA_BLOCK, Type: fqdn, Value: *.socialmedia.com",
        ],
        actionHint: "Go to Addresses → Create FQDN object",
        navPath: "/config/addresses",
        validate: (state) => {
          return state.addressObjects.some(a =>
            a.name.toUpperCase().includes("SOCIAL") && a.type === "fqdn"
          );
        },
      },
      {
        id: "4-3",
        title: "Create DENY Policy for Social Media",
        description: "Go to Firewall Policies and create a DENY policy: port3 → port1, Destination Address = SOCIAL_MEDIA_BLOCK, Action = DENY.",
        hints: [
          "Navigate to Configuration → Firewall Policies",
          "Click 'Create New'",
          "Source: port3, Destination: port1, Dest Address: SOCIAL_MEDIA_BLOCK",
          "Action: DENY, Log Traffic: enabled",
        ],
        actionHint: "Go to Policies → Create DENY with SOCIAL_MEDIA_BLOCK",
        navPath: "/config/policies",
        validate: (state) => {
          return state.policies.some(p =>
            p.action === "deny" &&
            p.dstaddr.toUpperCase().includes("SOCIAL")
          );
        },
      },
    ],
  },

  // ============= Lab 5: SSL-VPN Access Control =============
  {
    id: "lab-5",
    title: "SSL-VPN Access Control",
    description: "Configure SSL-VPN access: review active sessions, create address objects for restricted servers, and build an access policy for VPN users.",
    difficulty: "intermediate",
    category: "VPN",
    estimatedMinutes: 20,
    startPath: "/network/ssl-vpn",
    tags: ["ssl-vpn", "access-control", "policy", "NSE4.1"],
    nseAlignment: "NSE 4.1 — Module 11: SSL VPN",
    objectives: [
      {
        id: "5-1",
        title: "Review Active SSL-VPN Sessions",
        description: "You're on the SSL-VPN Monitor. Count the active sessions and note the tunnel types (Full Tunnel, Split Tunnel, Web Mode).",
        hints: [
          "Look at the session table on this page",
          "Note: each row shows username, tunnel type, IP, and bandwidth",
          "Full Tunnel = all traffic goes through VPN; Split = only internal traffic",
        ],
        actionHint: "Review the sessions table on this page",
        navPath: "/network/ssl-vpn",
        validate: (_state, _cli, path) => path === "/network/ssl-vpn",
      },
      {
        id: "5-2",
        title: "Create RESTRICTED_SERVERS Address",
        description: "Go to Addresses and create: Name = RESTRICTED_SERVERS, Type = subnet, Value = 10.0.50.0/24.",
        hints: [
          "Navigate to Configuration → Addresses",
          "Click 'Create New'",
          "Name: RESTRICTED_SERVERS, Type: subnet, Value: 10.0.50.0/24",
        ],
        actionHint: "Go to Addresses → Create RESTRICTED_SERVERS",
        navPath: "/config/addresses",
        validate: (state) => {
          return state.addressObjects.some(a =>
            a.name.toUpperCase().includes("RESTRICTED") && a.value.includes("10.0.50.0")
          );
        },
      },
      {
        id: "5-3",
        title: "Create VPN Access Policy",
        description: "Go to Firewall Policies and create: srcintf = ssl.root, dstintf = port3, dstaddr = RESTRICTED_SERVERS, action = ACCEPT.",
        hints: [
          "Navigate to Configuration → Firewall Policies",
          "Click 'Create New'",
          "Source Interface: ssl.root, Destination Interface: port3",
          "Destination Address: RESTRICTED_SERVERS, Action: ACCEPT",
        ],
        actionHint: "Go to Policies → Create ssl.root → port3 ACCEPT",
        navPath: "/config/policies",
        validate: (state) => {
          return state.policies.some(p =>
            p.srcintf === "ssl.root" && p.dstintf === "port3" &&
            p.dstaddr.toUpperCase().includes("RESTRICTED") && p.action === "accept"
          );
        },
      },
      {
        id: "5-4",
        title: "Verify via CLI",
        description: "Run 'show firewall policy' to confirm your VPN access policy exists with srcintf = ssl.root.",
        hints: [
          "Open CLI terminal",
          "Type: show firewall policy",
          "Look for the policy with srcintf=ssl.root",
        ],
        actionHint: "Open CLI → run: show firewall policy",
        navPath: "/config/policies",
        validate: (_state, cli) => cli.some(c => c.toLowerCase().includes("show firewall policy")),
      },
    ],
  },

  // ============= Lab 6: IPsec Tunnel Diagnostics =============
  {
    id: "lab-6",
    title: "IPsec Tunnel Diagnostics",
    description: "Branch-CHI IPsec tunnel Phase 2 is down! Diagnose connectivity, run CLI diagnostics, and restore the tunnel.",
    difficulty: "intermediate",
    category: "VPN Troubleshooting",
    estimatedMinutes: 20,
    startPath: "/network/ipsec",
    tags: ["ipsec", "troubleshooting", "diagnostics", "NSE4.2"],
    nseAlignment: "NSE 4.2 — Module 5: Diagnostics / IPsec VPN",
    onStart: (ctx) => {
      ctx.setTunnelStatus("Branch-CHI", "down");
    },
    objectives: [
      {
        id: "6-1",
        title: "Identify the Down Tunnel",
        description: "On the IPsec Monitor, find which tunnel has Phase 2 = down. Note its name and remote gateway.",
        hints: [
          "You're on the IPsec Monitor page",
          "Look for a tunnel with Phase 2 status = 'down' (red indicator)",
          "Branch-CHI shows Phase 1=up but Phase 2=down",
        ],
        actionHint: "Find the down tunnel in the table",
        navPath: "/network/ipsec",
        validate: (_state, _cli, path) => path === "/network/ipsec",
      },
      {
        id: "6-2",
        title: "Ping Remote Gateway",
        description: "Open CLI and test connectivity to the remote gateway: execute ping 192.0.2.100",
        hints: [
          "Open CLI terminal ('>_' icon)",
          "Type: execute ping 192.0.2.100",
          "Successful ping confirms L3 connectivity is fine — Phase 2 SA negotiation is the issue",
        ],
        actionHint: "Open CLI → run: execute ping 192.0.2.100",
        navPath: "/network/ipsec",
        validate: (_state, cli) => cli.some(c => c.toLowerCase().includes("execute ping")),
      },
      {
        id: "6-3",
        title: "Get IPsec Tunnel Summary",
        description: "Run 'get vpn ipsec tunnel summary' to see detailed status of all tunnels.",
        hints: [
          "In CLI, type: get vpn ipsec tunnel summary",
          "Branch-CHI should show 0 B traffic and uptime=0",
          "Other tunnels should show normal traffic stats",
        ],
        actionHint: "CLI → run: get vpn ipsec tunnel summary",
        navPath: "/network/ipsec",
        validate: (_state, cli) => cli.some(c => c.toLowerCase().includes("get vpn ipsec tunnel summary")),
      },
      {
        id: "6-4",
        title: "Restore the Tunnel",
        description: "Use the Instructor Toolbar (Ctrl+Shift+I) to bring Branch-CHI back up, then verify on the IPsec Monitor.",
        hints: [
          "Press Ctrl+Shift+I to open the Instructor Toolbar",
          "Select 'IPsec Tunnel Down' or use tunnel controls to set Branch-CHI to UP",
          "Alternatively wait for instructor to restore it",
          "After restoration, Phase 2 should show 'up' on this page",
        ],
        actionHint: "Instructor Toolbar → restore Branch-CHI tunnel",
        navPath: "/network/ipsec",
        validate: (state) => {
          const tunnel = state.ipsecTunnels.find(t => t.name === "Branch-CHI");
          return !!tunnel && tunnel.phase2 === "up";
        },
      },
    ],
  },

  // ============= Lab 7: Respond to IPS Alert =============
  {
    id: "lab-7",
    title: "Respond to IPS Alert",
    description: "A critical SQL injection attack has been detected! Investigate the alert, trace the attacker IP, and create a DENY policy to block them.",
    difficulty: "intermediate",
    category: "Threat Prevention",
    estimatedMinutes: 15,
    startPath: "/",
    tags: ["ips", "incident-response", "firewall", "NSE4.1"],
    nseAlignment: "NSE 4.1 — Module 10: IPS / Incident Response",
    onStart: (ctx) => {
      ctx.addAlert({
        id: "ips-lab-alert",
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
        severity: "critical",
        source: "IPS Engine",
        message: "IPS Alert: SQL Injection attempt from 10.99.88.77 → 172.16.0.10:443 (sig: HTTP.URI.SQL.Injection)",
        category: "intrusion",
      });
    },
    objectives: [
      {
        id: "7-1",
        title: "Find the Critical Alert",
        description: "On the Status Dashboard, locate the SQL Injection alert in the Alert Console. Note the attacker IP: 10.99.88.77.",
        hints: [
          "You're on the Status Dashboard",
          "Scroll to the Alert Console / Recent Alerts section",
          "Look for the red 'critical' badge with SQL Injection message",
          "The attacker IP is 10.99.88.77 targeting 172.16.0.10",
        ],
        actionHint: "Find SQL Injection alert in the Alert Console",
        navPath: "/",
        validate: (_state, _cli, path) => path === "/",
      },
      {
        id: "7-2",
        title: "Investigate on Security Dashboard",
        description: "Navigate to the Security Dashboard to review IPS signatures and threat patterns.",
        hints: [
          "Click 'Security' in the sidebar",
          "Review the IPS Signatures section for active detections",
          "Correlate: same attacker IP 10.99.88.77 appears in threats",
        ],
        actionHint: "Go to Security Dashboard → review IPS data",
        navPath: "/security",
        validate: (_state, _cli, path) => path === "/security",
      },
      {
        id: "7-3",
        title: "Create Address Object for Attacker",
        description: "Go to Addresses and create an object: Name = ATTACKER_10_99_88_77, Type = subnet, Value = 10.99.88.77/32.",
        hints: [
          "Navigate to Configuration → Addresses",
          "Click 'Create New'",
          "Name: ATTACKER_10_99_88_77 (or similar)",
          "Type: subnet, Value: 10.99.88.77/32",
        ],
        actionHint: "Go to Addresses → Create object for 10.99.88.77/32",
        navPath: "/config/addresses",
        validate: (state) => {
          return state.addressObjects.some(a => a.value.includes("10.99.88.77"));
        },
      },
      {
        id: "7-4",
        title: "Create DENY Policy to Block Attacker",
        description: "Go to Firewall Policies and create a DENY policy using your attacker address object as source.",
        hints: [
          "Navigate to Configuration → Firewall Policies",
          "Click 'Create New'",
          "Source Address: your attacker object, Action: DENY",
          "Place it above ACCEPT policies for priority",
        ],
        actionHint: "Go to Policies → Create DENY for attacker IP",
        navPath: "/config/policies",
        validate: (state) => {
          const hasAddr = state.addressObjects.some(a => a.value.includes("10.99.88.77"));
          const hasDeny = state.policies.some(p => p.action === "deny" && (
            p.srcaddr.includes("10.99.88") ||
            state.addressObjects.some(a => a.value.includes("10.99.88.77") && p.srcaddr.toUpperCase().includes(a.name.toUpperCase()))
          ));
          return hasAddr && hasDeny;
        },
      },
      {
        id: "7-5",
        title: "Run Debug Flow Trace",
        description: "Open CLI and run 'diagnose debug flow' to trace how packets from the attacker are now handled.",
        hints: [
          "Open CLI terminal",
          "Type: diagnose debug flow",
          "This shows packets hitting your new DENY policy",
        ],
        actionHint: "Open CLI → run: diagnose debug flow",
        navPath: "/config/policies",
        validate: (_state, cli) => cli.some(c => c.toLowerCase().includes("diagnose debug flow")),
      },
    ],
  },

  // ============= Lab 8: Interface Failure & Recovery =============
  {
    id: "lab-8",
    title: "Interface Failure & Recovery",
    description: "WAN2 (port2) has gone down! Diagnose the impact, check routing, bring the interface back up, and verify recovery.",
    difficulty: "advanced",
    category: "Network Troubleshooting",
    estimatedMinutes: 20,
    startPath: "/network",
    tags: ["interfaces", "routing", "troubleshooting", "NSE4.2"],
    nseAlignment: "NSE 4.2 — Module 1: Routing / Module 5: Diagnostics",
    onStart: (ctx) => {
      ctx.setInterfaceStatus("port2", "down");
    },
    objectives: [
      {
        id: "8-1",
        title: "Identify the Down Interface",
        description: "On the Network Dashboard, find which interface is down. Look for the red status indicator on port2 (WAN2).",
        hints: [
          "You're on the Network Dashboard",
          "Look at the interface status indicators",
          "port2 (WAN2) should show 'down' with a red badge",
          "This is the backup WAN link for failover",
        ],
        actionHint: "Find port2 (WAN2) status = down",
        navPath: "/network",
        validate: (_state, _cli, path) => path === "/network",
      },
      {
        id: "8-2",
        title: "Check Routing Impact via CLI",
        description: "Open CLI and run 'get router info routing-table all' to see how routing is affected by the WAN2 failure.",
        hints: [
          "Open CLI terminal",
          "Type: get router info routing-table all",
          "The backup default route via port2 should be missing or inactive",
          "Primary route via port1 (WAN1) should still be active",
        ],
        actionHint: "Open CLI → run: get router info routing-table all",
        navPath: "/network",
        validate: (_state, cli) => cli.some(c => c.toLowerCase().includes("get router info routing-table all")),
      },
      {
        id: "8-3",
        title: "Bring port2 Back Up",
        description: "Go to Interfaces config, find port2, click Edit, and set its status back to 'up'.",
        hints: [
          "Navigate to Configuration → Interfaces",
          "Find port2 (WAN2) in the table",
          "Click Edit, change Status to 'up', and Save",
        ],
        actionHint: "Go to Interfaces → Edit port2 → set status to UP",
        navPath: "/config/interfaces",
        validate: (state) => {
          const port2 = state.interfaces.find(i => i.name === "port2");
          return !!port2 && port2.status === "up";
        },
      },
      {
        id: "8-4",
        title: "Verify Recovery via CLI",
        description: "Run 'get system interface' in CLI to confirm port2 is back online.",
        hints: [
          "Open CLI terminal",
          "Type: get system interface",
          "port2 should now show status=up with traffic flowing",
        ],
        actionHint: "Open CLI → run: get system interface",
        navPath: "/config/interfaces",
        validate: (_state, cli) => cli.some(c => c.toLowerCase().includes("get system interface")),
      },
    ],
  },

  // ============= Lab 9: Quarantine a Compromised Host =============
  {
    id: "lab-9",
    title: "Quarantine a Compromised Host",
    description: "A compromised host (SRV-ACCT-03) is communicating with a C&C server! Find it, create an isolation address object, and build a DENY policy to quarantine it.",
    difficulty: "advanced",
    category: "Incident Response",
    estimatedMinutes: 20,
    startPath: "/security",
    tags: ["incident-response", "quarantine", "security", "NSE4.1"],
    nseAlignment: "NSE 4.1 — Module 5: Logging / Module 9: Antivirus",
    onStart: (ctx) => {
      ctx.addCompromisedHost({
        hostname: "SRV-ACCT-03",
        ip: "10.0.5.55",
        mac: "AA:BB:CC:DD:EE:55",
        os: "Windows Server 2022",
        threat: "Trojan.GenericKD.46789012",
        severity: "critical",
        detectedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
        status: "active",
        sessions: [
          { dest: "185.220.100.252:443", protocol: "TCP", bytes: "2.1 MB", duration: "00:45:12" },
          { dest: "10.0.1.0/24:445", protocol: "SMB", bytes: "890 KB", duration: "00:12:33" },
        ],
      });
      ctx.addAlert({
        id: "compromised-lab-alert",
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
        severity: "critical",
        source: "AV Engine",
        message: "Malware detected on SRV-ACCT-03 (10.0.5.55): Trojan.GenericKD.46789012 — C&C communication active",
        category: "malware",
      });
    },
    objectives: [
      {
        id: "9-1",
        title: "Find the Compromised Host",
        description: "On the Security Dashboard, locate SRV-ACCT-03 in the Compromised Hosts section. Note its IP (10.0.5.55) and the C&C destination.",
        hints: [
          "You're on the Security Dashboard",
          "Scroll to the Compromised Hosts card/section",
          "SRV-ACCT-03 at 10.0.5.55 is communicating with 185.220.100.252 (C&C)",
          "It's also scanning internal SMB on 10.0.1.0/24:445 — lateral movement!",
        ],
        actionHint: "Find SRV-ACCT-03 in Compromised Hosts",
        navPath: "/security",
        validate: (_state, _cli, path) => path === "/security",
      },
      {
        id: "9-2",
        title: "Create Quarantine Address Object",
        description: "Go to Addresses and create: Name = QUARANTINE_SRV_ACCT_03, Type = subnet, Value = 10.0.5.55/32.",
        hints: [
          "Navigate to Configuration → Addresses",
          "Click 'Create New'",
          "Name: QUARANTINE_SRV_ACCT_03",
          "Type: subnet, Value: 10.0.5.55/32",
        ],
        actionHint: "Go to Addresses → Create object for 10.0.5.55/32",
        navPath: "/config/addresses",
        validate: (state) => {
          return state.addressObjects.some(a => a.value.includes("10.0.5.55"));
        },
      },
      {
        id: "9-3",
        title: "Create Quarantine DENY Policy",
        description: "Go to Firewall Policies and create a DENY policy: Source Address = your quarantine object, Service = ALL, Action = DENY.",
        hints: [
          "Navigate to Configuration → Firewall Policies",
          "Click 'Create New'",
          "Source Address: QUARANTINE_SRV_ACCT_03, Action: DENY",
          "Service: ALL, Log Traffic: enabled",
          "Drag it above ACCEPT policies so it takes priority",
        ],
        actionHint: "Go to Policies → Create DENY blocking 10.0.5.55",
        navPath: "/config/policies",
        validate: (state) => {
          return state.policies.some(p =>
            p.action === "deny" && (
              p.srcaddr.includes("10.0.5.55") ||
              state.addressObjects.some(a =>
                a.value.includes("10.0.5.55") &&
                p.srcaddr.toUpperCase().includes(a.name.toUpperCase())
              )
            )
          );
        },
      },
      {
        id: "9-4",
        title: "Verify Isolation via CLI",
        description: "Run 'show firewall policy' to confirm the quarantine DENY policy is in place.",
        hints: [
          "Open CLI terminal",
          "Type: show firewall policy",
          "Your DENY policy for QUARANTINE_SRV_ACCT_03 should appear",
        ],
        actionHint: "Open CLI → run: show firewall policy",
        navPath: "/config/policies",
        validate: (_state, cli) => cli.some(c => c.toLowerCase().includes("show firewall policy")),
      },
    ],
  },

  // ============= Lab 10: Full Security Audit & Hardening =============
  {
    id: "lab-10",
    title: "Full Security Audit & Hardening",
    description: "Conduct a comprehensive audit: find overly permissive policies (Service=ALL), tighten them, verify system health, and check license status.",
    difficulty: "advanced",
    category: "Security Audit",
    estimatedMinutes: 30,
    startPath: "/config/policies",
    tags: ["audit", "hardening", "compliance", "NSE4"],
    nseAlignment: "NSE 4.1/4.2 — Comprehensive Review",
    objectives: [
      {
        id: "10-1",
        title: "Find Overly Permissive Policies",
        description: "In the Policy Editor, identify policies using Service=ALL with Action=ACCEPT. These violate least-privilege and need hardening.",
        hints: [
          "You're on the Firewall Policies page",
          "Policy 1 (LAN-to-Internet) uses Service=ALL — overly permissive!",
          "Policy 5 (VPN-Users-Access) also uses Service=ALL",
          "Both should be restricted to specific services",
        ],
        actionHint: "Find policies with Service=ALL in the table",
        navPath: "/config/policies",
        validate: (_state, _cli, path) => path === "/config/policies",
      },
      {
        id: "10-2",
        title: "Harden LAN-to-Internet Policy",
        description: "Edit Policy ID 1 and change Service from ALL to 'HTTPS DNS'. LAN users only need web browsing and DNS.",
        hints: [
          "Click Edit on Policy 1 (LAN-to-Internet)",
          "Change the Service field from ALL to 'HTTPS DNS'",
          "Save — this restricts LAN to only web and DNS traffic",
        ],
        actionHint: "Edit Policy 1 → set Service = HTTPS DNS",
        navPath: "/config/policies",
        validate: (state) => {
          const p1 = state.policies.find(p => p.id === 1);
          if (!p1) return false;
          const svc = p1.service.toUpperCase();
          return svc !== "ALL" && svc.includes("HTTPS") && svc.includes("DNS");
        },
      },
      {
        id: "10-3",
        title: "Harden VPN Policy",
        description: "Edit Policy ID 5 (VPN-Users-Access) and restrict Service from ALL to 'HTTPS SSH RDP'.",
        hints: [
          "Click Edit on Policy 5 (VPN-Users-Access)",
          "Change Service from ALL to 'HTTPS SSH RDP'",
          "VPN users should only access these specific services",
        ],
        actionHint: "Edit Policy 5 → set Service = HTTPS SSH RDP",
        navPath: "/config/policies",
        validate: (state) => {
          const p5 = state.policies.find(p => p.id === 5);
          if (!p5) return false;
          const svc = p5.service.toUpperCase();
          return svc !== "ALL" && svc.includes("HTTPS");
        },
      },
      {
        id: "10-4",
        title: "Verify System Health via CLI",
        description: "Run 'get system performance status' to check CPU, memory, and session counts are healthy.",
        hints: [
          "Open CLI terminal",
          "Type: get system performance status",
          "Healthy: CPU < 80%, Memory < 85%, Sessions < 80% capacity",
        ],
        actionHint: "Open CLI → run: get system performance status",
        navPath: "/config/policies",
        validate: (_state, cli) => cli.some(c => c.toLowerCase().includes("get system performance status")),
      },
      {
        id: "10-5",
        title: "Check License Status",
        description: "Go to the Status Dashboard and review license expiry dates. Identify which licenses are expired or expiring soon.",
        hints: [
          "Navigate to Status Dashboard (click 'Status' in sidebar)",
          "Find the Licenses card",
          "Anti-Spam = EXPIRED — no spam protection!",
          "FortiClient EMS = WARNING — expiring soon",
        ],
        actionHint: "Go to Status Dashboard → check Licenses card",
        navPath: "/",
        validate: (_state, _cli, path) => path === "/",
      },
    ],
  },
];
