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
  actionHint: string; // tells student where to go / what to do
  validate: (state: ValidationState, cliHistory: string[], currentPath: string) => boolean;
}

export interface LabScenario {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  estimatedMinutes: number;
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
    tags: ["interfaces", "network", "NSE4.1"],
    nseAlignment: "NSE 4.1 — Module 1: System and Network Settings",
    objectives: [
      {
        id: "1-1",
        title: "Navigate to Interfaces Page",
        description: "Go to Configuration → Interfaces to view and manage network interfaces.",
        hints: [
          "Click 'Configuration' in the sidebar to expand it",
          "Click 'Interfaces' under Configuration",
        ],
        actionHint: "Go to Configuration → Interfaces",
        validate: (_state, _cli, path) => path === "/config/interfaces",
      },
      {
        id: "1-2",
        title: "Set port6 IP Address",
        description: "Configure port6 with the static IP address 192.168.100.1/24.",
        hints: [
          "Find port6 in the interfaces list and click Edit",
          "Set IP Address to 192.168.100.1/24",
          "Save the changes",
        ],
        actionHint: "Edit port6 on the Interfaces page and set IP to 192.168.100.1/24",
        validate: (state) => {
          const port6 = state.interfaces.find(i => i.name === "port6");
          return !!port6 && port6.ip === "192.168.100.1/24";
        },
      },
      {
        id: "1-3",
        title: "Enable HTTPS and Ping Admin Access",
        description: "Set port6 admin access to include both HTTPS and Ping protocols.",
        hints: [
          "Edit port6 and find the Admin Access section",
          "Check both HTTPS and Ping checkboxes",
          "This allows management access and connectivity testing on port6",
        ],
        actionHint: "Edit port6 admin access to include HTTPS and Ping",
        validate: (state) => {
          const port6 = state.interfaces.find(i => i.name === "port6");
          if (!port6) return false;
          const access = port6.adminAccess.map(a => a.toUpperCase());
          return access.includes("HTTPS") && access.includes("PING");
        },
      },
      {
        id: "1-4",
        title: "Verify via CLI",
        description: "Run 'get system interface' in the CLI terminal to verify your changes.",
        hints: [
          "Click the '>_' CLI button in the header",
          "Type: get system interface",
          "Confirm port6 shows your new IP and admin access settings",
        ],
        actionHint: "Open CLI and run: get system interface",
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
    tags: ["firewall", "policy", "utm", "NSE4.1"],
    nseAlignment: "NSE 4.1 — Module 2: Firewall Policies",
    onStart: (ctx) => {
      // Remove the default LAN-to-Internet policy so student must create one
      ctx.deletePolicy(1);
    },
    objectives: [
      {
        id: "2-1",
        title: "Create LAN-to-WAN Policy",
        description: "Create a new firewall policy with Source Interface=port3, Destination Interface=port1, Action=ACCEPT.",
        hints: [
          "Go to Configuration → Firewall Policies",
          "Click 'Create New'",
          "Set Source Interface to port3, Destination Interface to port1",
          "Set Action to ACCEPT and enable NAT",
        ],
        actionHint: "Go to Firewall Policies and create a new policy: port3 → port1, ACCEPT",
        validate: (state) => {
          return state.policies.some(p =>
            p.srcintf === "port3" && p.dstintf === "port1" && p.action === "accept"
          );
        },
      },
      {
        id: "2-2",
        title: "Restrict Service to HTTPS",
        description: "Set the policy service to HTTPS only — not ALL. Principle of least privilege!",
        hints: [
          "Edit your new policy",
          "Change Service from ALL to HTTPS",
          "Using 'ALL' is overly permissive and a security risk",
        ],
        actionHint: "Edit the policy and set Service to HTTPS",
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
        description: "Enable the 'default' antivirus profile on your policy to scan traffic for malware.",
        hints: [
          "Edit your policy and find Security Profiles",
          "Set AntiVirus to 'default'",
          "This enables real-time malware scanning on allowed traffic",
        ],
        actionHint: "Edit the policy and set AV profile to 'default'",
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
        description: "Run 'show firewall policy' to verify your new policy appears in the running config.",
        hints: [
          "Open CLI terminal",
          "Type: show firewall policy",
          "Your policy should show srcintf=port3, dstintf=port1 with av-profile=default",
        ],
        actionHint: "Open CLI and run: show firewall policy",
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
    tags: ["address-objects", "firewall", "NSE4.1"],
    nseAlignment: "NSE 4.1 — Module 2: Firewall Policies / Address Objects",
    objectives: [
      {
        id: "3-1",
        title: "Create WEB_SERVERS Address Object",
        description: "Create a new address object named 'WEB_SERVERS' with type subnet and value 172.16.10.0/24.",
        hints: [
          "Go to Configuration → Addresses",
          "Click 'Create New'",
          "Name: WEB_SERVERS, Type: subnet, Value: 172.16.10.0/24",
        ],
        actionHint: "Go to Configuration → Addresses and create WEB_SERVERS (172.16.10.0/24)",
        validate: (state) => {
          return state.addressObjects.some(a =>
            a.name.toUpperCase() === "WEB_SERVERS" && a.value.includes("172.16.10.0")
          );
        },
      },
      {
        id: "3-2",
        title: "Create Policy Using WEB_SERVERS",
        description: "Create a firewall policy that uses WEB_SERVERS as the destination address.",
        hints: [
          "Go to Firewall Policies → Create New",
          "Set Destination Address to WEB_SERVERS",
          "Source Interface: port1 (WAN), Dest Interface: port3 (LAN)",
        ],
        actionHint: "Create a policy with dstaddr=WEB_SERVERS",
        validate: (state) => {
          return state.policies.some(p =>
            p.dstaddr.toUpperCase().includes("WEB_SERVERS")
          );
        },
      },
      {
        id: "3-3",
        title: "Verify Address Object via CLI",
        description: "Run 'get firewall address' in the CLI to verify your new address object exists.",
        hints: [
          "Open CLI terminal",
          "Type: get firewall address",
          "WEB_SERVERS should appear with subnet 172.16.10.0/24",
        ],
        actionHint: "Open CLI and run: get firewall address",
        validate: (_state, cli) => cli.some(c => c.toLowerCase().includes("get firewall address")),
      },
    ],
  },

  // ============= Lab 4: Web Filter Policy Enforcement =============
  {
    id: "lab-4",
    title: "Web Filter Policy Enforcement",
    description: "Create a policy to block social media sites using FQDN address objects and web filtering. Understand how FortiGuard categorization enforces web access controls.",
    difficulty: "intermediate",
    category: "UTM Security",
    estimatedMinutes: 15,
    tags: ["web-filter", "fqdn", "policy", "NSE4.1"],
    nseAlignment: "NSE 4.1 — Module 7: Web Filtering",
    objectives: [
      {
        id: "4-1",
        title: "Review Blocked Categories on Security Dashboard",
        description: "Navigate to the Security Dashboard and identify which web categories are currently blocked.",
        hints: [
          "Click 'Security' in the sidebar",
          "Look at the Web Filter widget for blocked categories",
          "Gambling, Malicious, Adult Content, and Phishing are blocked",
        ],
        actionHint: "Navigate to Security Dashboard",
        validate: (_state, _cli, path) => path === "/security",
      },
      {
        id: "4-2",
        title: "Create Social Media FQDN Object",
        description: "Create an FQDN address object named 'SOCIAL_MEDIA_BLOCK' with value '*.socialmedia.com'.",
        hints: [
          "Go to Configuration → Addresses",
          "Click 'Create New'",
          "Name: SOCIAL_MEDIA_BLOCK, Type: fqdn, Value: *.socialmedia.com",
        ],
        actionHint: "Go to Addresses and create FQDN object: SOCIAL_MEDIA_BLOCK",
        validate: (state) => {
          return state.addressObjects.some(a =>
            a.name.toUpperCase().includes("SOCIAL") && a.type === "fqdn"
          );
        },
      },
      {
        id: "4-3",
        title: "Create DENY Policy for Social Media",
        description: "Create a DENY policy using your new FQDN object to block social media access from the LAN.",
        hints: [
          "Go to Firewall Policies → Create New",
          "Source: port3, Destination: port1, Dest Address: SOCIAL_MEDIA_BLOCK",
          "Action: DENY, Log Traffic: enabled",
        ],
        actionHint: "Create a DENY policy using SOCIAL_MEDIA_BLOCK as destination",
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
    description: "Configure SSL-VPN access by creating address objects for restricted servers and building a policy to control VPN user access to internal resources.",
    difficulty: "intermediate",
    category: "VPN",
    estimatedMinutes: 20,
    tags: ["ssl-vpn", "access-control", "policy", "NSE4.1"],
    nseAlignment: "NSE 4.1 — Module 11: SSL VPN",
    objectives: [
      {
        id: "5-1",
        title: "Review SSL-VPN Sessions",
        description: "Navigate to the SSL-VPN Monitor to see active remote user sessions.",
        hints: [
          "Go to Monitors → SSL VPN in the sidebar",
          "Count the active sessions and note tunnel types",
          "Look for Full Tunnel, Split Tunnel, and Web Mode sessions",
        ],
        actionHint: "Navigate to Monitors → SSL VPN",
        validate: (_state, _cli, path) => path === "/monitors/ssl-vpn",
      },
      {
        id: "5-2",
        title: "Create RESTRICTED_SERVERS Address Object",
        description: "Create an address object named 'RESTRICTED_SERVERS' with subnet 10.0.50.0/24.",
        hints: [
          "Go to Configuration → Addresses",
          "Name: RESTRICTED_SERVERS, Type: subnet, Value: 10.0.50.0/24",
        ],
        actionHint: "Go to Addresses and create RESTRICTED_SERVERS (10.0.50.0/24)",
        validate: (state) => {
          return state.addressObjects.some(a =>
            a.name.toUpperCase().includes("RESTRICTED") && a.value.includes("10.0.50.0")
          );
        },
      },
      {
        id: "5-3",
        title: "Create VPN Access Policy",
        description: "Create a policy: srcintf=ssl.root, dstintf=port3, dstaddr=RESTRICTED_SERVERS, action=ACCEPT.",
        hints: [
          "Go to Firewall Policies → Create New",
          "Source Interface: ssl.root, Destination Interface: port3",
          "Destination Address: RESTRICTED_SERVERS, Action: ACCEPT",
        ],
        actionHint: "Create policy: ssl.root → port3, dstaddr=RESTRICTED_SERVERS, ACCEPT",
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
        description: "Run 'show firewall policy' to confirm your VPN access policy is configured.",
        hints: [
          "Open CLI terminal",
          "Type: show firewall policy",
          "Look for your policy with srcintf=ssl.root",
        ],
        actionHint: "Open CLI and run: show firewall policy",
        validate: (_state, cli) => cli.some(c => c.toLowerCase().includes("show firewall policy")),
      },
    ],
  },

  // ============= Lab 6: IPsec Tunnel Diagnostics =============
  {
    id: "lab-6",
    title: "IPsec Tunnel Diagnostics",
    description: "Branch-CHI IPsec tunnel Phase 2 is down! Use dashboard monitors and CLI tools to diagnose and restore the tunnel.",
    difficulty: "intermediate",
    category: "VPN Troubleshooting",
    estimatedMinutes: 20,
    tags: ["ipsec", "troubleshooting", "diagnostics", "NSE4.2"],
    nseAlignment: "NSE 4.2 — Module 5: Diagnostics / IPsec VPN",
    onStart: (ctx) => {
      ctx.setTunnelStatus("Branch-CHI", "down");
    },
    objectives: [
      {
        id: "6-1",
        title: "Identify the Down Tunnel",
        description: "Navigate to Network → IPsec Monitor and find the tunnel with a Phase 2 failure.",
        hints: [
          "Go to Network → IPsec Monitor",
          "Branch-CHI shows Phase 1=up but Phase 2=down",
          "Phase 2 down means IPsec SA negotiation failed",
        ],
        actionHint: "Navigate to Network → IPsec Monitor",
        validate: (_state, _cli, path) => path === "/network/ipsec",
      },
      {
        id: "6-2",
        title: "Ping Remote Gateway",
        description: "Test basic connectivity to the remote gateway 192.0.2.100 using the CLI ping command.",
        hints: [
          "Open CLI terminal",
          "Type: execute ping 192.0.2.100",
          "Successful ping confirms network-layer connectivity is fine",
        ],
        actionHint: "Open CLI and run: execute ping 192.0.2.100",
        validate: (_state, cli) => cli.some(c => c.toLowerCase().includes("execute ping")),
      },
      {
        id: "6-3",
        title: "Get IPsec Tunnel Summary",
        description: "Run the tunnel summary command to see detailed status of all VPN tunnels.",
        hints: [
          "Type: get vpn ipsec tunnel summary",
          "Branch-CHI should show 0 B traffic and uptime=0",
        ],
        actionHint: "Open CLI and run: get vpn ipsec tunnel summary",
        validate: (_state, cli) => cli.some(c => c.toLowerCase().includes("get vpn ipsec tunnel summary")),
      },
      {
        id: "6-4",
        title: "Restore the Tunnel",
        description: "Bring Branch-CHI Phase 2 back up using the Interfaces configuration or instructor toolbar.",
        hints: [
          "Use the Instructor Toolbar (wrench icon) to bring the tunnel up",
          "Or navigate to the interface configuration to reset tunnel status",
          "After restoration, verify on IPsec Monitor that Phase 2 shows 'up'",
        ],
        actionHint: "Use Instructor Toolbar to set Branch-CHI tunnel to UP",
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
    description: "A critical IPS alert has been triggered! Investigate the attack source, navigate to the Security Dashboard, and create a DENY policy to block the attacker.",
    difficulty: "intermediate",
    category: "Threat Prevention",
    estimatedMinutes: 15,
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
        description: "Navigate to the Status Dashboard and locate the new critical IPS alert in the Alert Console.",
        hints: [
          "Click 'Status' in the sidebar",
          "Look for the SQL Injection alert from 10.99.88.77",
          "Critical alerts are marked with red severity badges",
        ],
        actionHint: "Navigate to Status Dashboard",
        validate: (_state, _cli, path) => path === "/",
      },
      {
        id: "7-2",
        title: "Investigate on Security Dashboard",
        description: "Navigate to Security Dashboard to review IPS signatures and threat details.",
        hints: [
          "Click 'Security' in the sidebar",
          "Review the IPS Signatures table for active detections",
          "Note the attacker IP: 10.99.88.77",
        ],
        actionHint: "Navigate to Security Dashboard",
        validate: (_state, _cli, path) => path === "/security",
      },
      {
        id: "7-3",
        title: "Create DENY Policy for Attacker",
        description: "Block the attacker by creating a DENY policy with source address containing 10.99.88.77.",
        hints: [
          "First create an address object for 10.99.88.77/32",
          "Then create a DENY policy using that address as source",
          "Place it high in the policy list for immediate effect",
        ],
        actionHint: "Create an address object for 10.99.88.77 and a DENY policy using it",
        validate: (state) => {
          // Check for a deny policy that references the attacker IP
          const hasAddr = state.addressObjects.some(a => a.value.includes("10.99.88.77"));
          const hasDeny = state.policies.some(p => p.action === "deny" && (
            p.srcaddr.includes("10.99.88") || 
            state.addressObjects.some(a => a.value.includes("10.99.88.77") && p.srcaddr.toUpperCase().includes(a.name.toUpperCase()))
          ));
          return hasAddr && hasDeny;
        },
      },
      {
        id: "7-4",
        title: "Run Debug Flow Trace",
        description: "Use CLI diagnostic command to trace packet flow from the attacker.",
        hints: [
          "Open CLI terminal",
          "Type: diagnose debug flow",
          "This shows how packets traverse the firewall pipeline",
        ],
        actionHint: "Open CLI and run: diagnose debug flow",
        validate: (_state, cli) => cli.some(c => c.toLowerCase().includes("diagnose debug flow")),
      },
    ],
  },

  // ============= Lab 8: Interface Failure & Recovery =============
  {
    id: "lab-8",
    title: "Interface Failure & Recovery",
    description: "WAN2 (port2) has gone down! Diagnose the impact on routing, bring the interface back up, and verify recovery — all using real configuration pages and CLI.",
    difficulty: "advanced",
    category: "Network Troubleshooting",
    estimatedMinutes: 20,
    tags: ["interfaces", "routing", "troubleshooting", "NSE4.2"],
    nseAlignment: "NSE 4.2 — Module 1: Routing / Module 5: Diagnostics",
    onStart: (ctx) => {
      ctx.setInterfaceStatus("port2", "down");
    },
    objectives: [
      {
        id: "8-1",
        title: "Identify the Down Interface",
        description: "Navigate to the Network Dashboard and find which interface is down.",
        hints: [
          "Click 'Network' in the sidebar",
          "port2 (WAN2) should show status 'down' with a red indicator",
          "This is the backup WAN link",
        ],
        actionHint: "Navigate to Network Dashboard",
        validate: (_state, _cli, path) => path === "/network",
      },
      {
        id: "8-2",
        title: "Check Routing Impact via CLI",
        description: "Run 'get router info routing-table all' to see how the routing table was affected by the failure.",
        hints: [
          "Open CLI terminal",
          "Type: get router info routing-table all",
          "The backup default route via port2 should be inactive",
        ],
        actionHint: "Open CLI and run: get router info routing-table all",
        validate: (_state, cli) => cli.some(c => c.toLowerCase().includes("get router info routing-table all")),
      },
      {
        id: "8-3",
        title: "Bring port2 Back Up",
        description: "Go to Configuration → Interfaces, edit port2, and set its status back to 'up'.",
        hints: [
          "Go to Configuration → Interfaces",
          "Find port2 (WAN2) and click Edit",
          "Change Status to 'up' and save",
        ],
        actionHint: "Go to Interfaces config, edit port2, set status to UP",
        validate: (state) => {
          const port2 = state.interfaces.find(i => i.name === "port2");
          return !!port2 && port2.status === "up";
        },
      },
      {
        id: "8-4",
        title: "Verify Recovery via CLI",
        description: "Run 'get system interface' to confirm port2 is back online.",
        hints: [
          "Open CLI terminal",
          "Type: get system interface",
          "port2 should now show status=up",
        ],
        actionHint: "Open CLI and run: get system interface",
        validate: (_state, cli) => cli.some(c => c.toLowerCase().includes("get system interface")),
      },
    ],
  },

  // ============= Lab 9: Quarantine a Compromised Host =============
  {
    id: "lab-9",
    title: "Quarantine a Compromised Host",
    description: "A new compromised host has been detected! Find it on the Security Dashboard, create an address object for isolation, and build a top-priority DENY policy to quarantine it.",
    difficulty: "advanced",
    category: "Incident Response",
    estimatedMinutes: 20,
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
        description: "Navigate to the Security Dashboard and locate SRV-ACCT-03 in the Compromised Hosts section.",
        hints: [
          "Click 'Security' in the sidebar",
          "Look for SRV-ACCT-03 (10.0.5.55) in Compromised Hosts",
          "Note the active C&C communication to 185.220.100.252",
        ],
        actionHint: "Navigate to Security Dashboard",
        validate: (_state, _cli, path) => path === "/security",
      },
      {
        id: "9-2",
        title: "Create Address Object for Host",
        description: "Create an address object for the compromised host IP 10.0.5.55/32 to use in a quarantine policy.",
        hints: [
          "Go to Configuration → Addresses",
          "Name: QUARANTINE_SRV_ACCT_03, Type: subnet, Value: 10.0.5.55/32",
        ],
        actionHint: "Go to Addresses and create object for 10.0.5.55/32",
        validate: (state) => {
          return state.addressObjects.some(a => a.value.includes("10.0.5.55"));
        },
      },
      {
        id: "9-3",
        title: "Create Quarantine DENY Policy",
        description: "Create a DENY policy using the quarantine address to block all traffic from the compromised host.",
        hints: [
          "Go to Firewall Policies → Create New",
          "Source Address: your quarantine object, Action: DENY",
          "Service: ALL, Log Traffic: enabled",
          "Place it above other accept policies for priority",
        ],
        actionHint: "Create a DENY policy blocking traffic from 10.0.5.55",
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
        description: "Run 'show firewall policy' to confirm the quarantine policy is in place.",
        hints: [
          "Open CLI terminal",
          "Type: show firewall policy",
          "Your quarantine DENY policy should appear near the top",
        ],
        actionHint: "Open CLI and run: show firewall policy",
        validate: (_state, cli) => cli.some(c => c.toLowerCase().includes("show firewall policy")),
      },
    ],
  },

  // ============= Lab 10: Full Security Audit & Hardening =============
  {
    id: "lab-10",
    title: "Full Security Audit & Hardening",
    description: "Conduct a comprehensive security audit: identify overly permissive policies (Service=ALL), tighten them to specific services, verify system health via CLI, and check license status.",
    difficulty: "advanced",
    category: "Security Audit",
    estimatedMinutes: 30,
    tags: ["audit", "hardening", "compliance", "NSE4"],
    nseAlignment: "NSE 4.1/4.2 — Comprehensive Review",
    objectives: [
      {
        id: "10-1",
        title: "Identify Permissive Policies",
        description: "Navigate to the Policy Editor and find policies using Service=ALL with Action=ACCEPT.",
        hints: [
          "Go to Configuration → Firewall Policies",
          "Policy 1 (LAN-to-Internet) uses Service=ALL — overly permissive",
          "Policy 5 (VPN-Users-Access) also uses Service=ALL",
        ],
        actionHint: "Navigate to Firewall Policies",
        validate: (_state, _cli, path) => path === "/config/policies",
      },
      {
        id: "10-2",
        title: "Harden LAN-to-Internet Policy",
        description: "Edit Policy ID 1 (LAN-to-Internet) and change Service from ALL to 'HTTPS DNS'.",
        hints: [
          "Click Edit on Policy 1",
          "Change Service from ALL to 'HTTPS DNS'",
          "This restricts LAN to only web and DNS traffic",
        ],
        actionHint: "Edit Policy 1 and set Service to 'HTTPS DNS'",
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
          "Click Edit on Policy 5",
          "Change Service from ALL to 'HTTPS SSH RDP'",
          "VPN users should only access specific services",
        ],
        actionHint: "Edit Policy 5 and set Service to 'HTTPS SSH RDP'",
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
        description: "Run 'get system performance status' to check CPU, memory, and session counts.",
        hints: [
          "Open CLI terminal",
          "Type: get system performance status",
          "CPU < 80% and Memory < 85% = healthy",
        ],
        actionHint: "Open CLI and run: get system performance status",
        validate: (_state, cli) => cli.some(c => c.toLowerCase().includes("get system performance status")),
      },
      {
        id: "10-5",
        title: "Check License Status",
        description: "Navigate to the Status Dashboard and review license expiry dates in the Licenses widget.",
        hints: [
          "Go to Status Dashboard",
          "Anti-Spam is EXPIRED — not providing protection",
          "FortiClient EMS shows WARNING — expiring soon",
        ],
        actionHint: "Navigate to Status Dashboard",
        validate: (_state, _cli, path) => path === "/",
      },
    ],
  },
];
