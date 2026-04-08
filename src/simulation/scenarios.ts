// Training lab scenario definitions — Aligned with Fortinet NSE 4 curriculum
// Reference: FortiGate Security (NSE 4.1) + FortiGate Infrastructure (NSE 4.2)

export interface LabObjective {
  id: string;
  title: string;
  description: string;
  hints: string[];
  validationType: "navigation" | "config" | "cli" | "manual";
  validationData?: Record<string, unknown>;
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
  nseAlignment: string; // Which NSE 4 module this aligns with
}

export const scenarios: LabScenario[] = [
  // ============= BEGINNER — NSE 4.1 Foundations =============
  {
    id: "lab-1",
    title: "System & Network Settings",
    description: "Explore the FortiGate system information, network interfaces, and routing configuration. This lab aligns with NSE 4.1 Module 1: System and Network Settings.",
    difficulty: "beginner",
    category: "System Administration",
    estimatedMinutes: 10,
    tags: ["dashboard", "system", "interfaces", "NSE4.1"],
    nseAlignment: "NSE 4.1 — Module 1: System and Network Settings",
    objectives: [
      {
        id: "1-1",
        title: "Review System Information Widget",
        description: "Navigate to the Status Dashboard and identify the hostname, serial number, firmware version, and operation mode in the System Information widget.",
        hints: [
          "Click 'Status' in the left sidebar — this is the main dashboard",
          "The System Information widget shows Hostname: FGT-DC-PRIMARY, Serial: FG5H1E5110004321",
          "Operation Mode should be NAT — this is the most common deployment mode"
        ],
        validationType: "navigation",
        validationData: { path: "/" }
      },
      {
        id: "1-2",
        title: "Check Network Interfaces",
        description: "Navigate to the Network dashboard and identify all physical interfaces, their IP addresses, and link status.",
        hints: [
          "Click 'Network' in the sidebar",
          "port1 (WAN1) = 203.0.113.1/24, port3 (LAN) = 10.0.1.1/24",
          "All interfaces should show 'up' status except possibly port6"
        ],
        validationType: "navigation",
        validationData: { path: "/network" }
      },
      {
        id: "1-3",
        title: "Verify System Status via CLI",
        description: "Open the CLI terminal and run 'get system status' to verify the firmware version and serial number match the GUI.",
        hints: [
          "Click the '>_' CLI button in the header bar",
          "Type: get system status",
          "Verify the Version line shows FortiGate-5001E v7.6.6 and Serial-Number matches"
        ],
        validationType: "cli",
        validationData: { command: "get system status" }
      },
      {
        id: "1-4",
        title: "Check HA Cluster Status",
        description: "Identify the HA mode (Active-Passive) and verify both cluster members are synchronized.",
        hints: [
          "Look at the HA Status widget on the Status Dashboard",
          "Or use CLI: diagnose sys ha status",
          "Configuration should show 'in-sync' for both members"
        ],
        validationType: "manual"
      },
    ],
  },
  {
    id: "lab-2",
    title: "Logging & Monitoring",
    description: "Learn to monitor system alerts, review log entries, and check FortiGuard database status. Aligns with NSE 4.1 Module 5: Logging and Monitoring.",
    difficulty: "beginner",
    category: "Monitoring",
    estimatedMinutes: 10,
    tags: ["logging", "alerts", "fortiguard", "NSE4.1"],
    nseAlignment: "NSE 4.1 — Module 5: Logging and Monitoring",
    objectives: [
      {
        id: "2-1",
        title: "Review Alert Console",
        description: "On the Status Dashboard, examine the Alert Console widget and identify all critical-severity alerts.",
        hints: [
          "Critical alerts are shown with red severity badges",
          "Look for IPS signature match (CVE-2024-21762), Botnet C&C, and Ransomware alerts",
          "Note the timestamp and source for each critical alert"
        ],
        validationType: "navigation",
        validationData: { path: "/" }
      },
      {
        id: "2-2",
        title: "Check FortiGuard Database Versions",
        description: "Find the FortiGuard Information widget and note the AV engine version, IPS database version, and last update time.",
        hints: [
          "The FortiGuard widget is on the Status Dashboard",
          "AV Engine should show 92.04521, IPS DB should show 6.01087",
          "Last Update shows when definitions were last synced from update.fortiguard.net"
        ],
        validationType: "manual"
      },
      {
        id: "2-3",
        title: "Check License Expiry",
        description: "Review the Licenses widget and identify any expired or soon-to-expire service licenses.",
        hints: [
          "Look at the Licenses widget on Status Dashboard",
          "Anti-Spam shows as 'expired' — this means Anti-Spam filtering is not active",
          "FortiClient EMS shows 'warning' — expiring soon"
        ],
        validationType: "manual"
      },
      {
        id: "2-4",
        title: "Use CLI for Performance Monitoring",
        description: "Run 'get system performance status' in the CLI to check CPU, memory, and session counts.",
        hints: [
          "Open CLI terminal",
          "Type: get system performance status",
          "Check CPU and Memory percentages, session count, and virus/intrusion counters"
        ],
        validationType: "cli",
        validationData: { command: "get system performance status" }
      },
    ],
  },
  {
    id: "lab-3",
    title: "Routing Fundamentals",
    description: "Examine the routing table, understand route types (static, connected, OSPF, BGP), and identify the default gateway. Aligns with NSE 4.2 Module 1: Routing.",
    difficulty: "beginner",
    category: "Routing",
    estimatedMinutes: 10,
    tags: ["routing", "network", "OSPF", "BGP", "NSE4.2"],
    nseAlignment: "NSE 4.2 — Module 1: Routing",
    objectives: [
      {
        id: "3-1",
        title: "Navigate to Routing Monitor",
        description: "Go to Network → Routing Monitor page to view the full routing table.",
        hints: [
          "Expand 'Network' in the sidebar",
          "Click 'Routing Monitor'"
        ],
        validationType: "navigation",
        validationData: { path: "/network/routing" }
      },
      {
        id: "3-2",
        title: "Identify the Default Gateway",
        description: "Find the default route (0.0.0.0/0) and identify the primary gateway IP address and its outgoing interface.",
        hints: [
          "Look for destination 0.0.0.0/0 in the routing table",
          "The primary gateway is 203.0.113.254 via port1 (distance=10)",
          "There's a backup route via port2 (distance=20) — this is a dual-WAN failover setup"
        ],
        validationType: "manual"
      },
      {
        id: "3-3",
        title: "Find Dynamic Routes (OSPF/BGP)",
        description: "Identify which routes were learned via OSPF and which via BGP.",
        hints: [
          "192.168.50.0/24 is learned via OSPF (distance=110)",
          "192.168.60.0/24 is learned via BGP (distance=200)",
          "Lower administrative distance = more preferred route"
        ],
        validationType: "manual"
      },
      {
        id: "3-4",
        title: "CLI: View Full Routing Table",
        description: "Use the CLI command to display the complete routing table with route codes.",
        hints: [
          "Open CLI terminal",
          "Type: get router info routing-table all",
          "Route codes: S=static, C=connected, O=OSPF, B=BGP, >*=selected FIB route"
        ],
        validationType: "cli",
        validationData: { command: "get router info routing-table all" }
      },
    ],
  },

  // ============= INTERMEDIATE — NSE 4.1 Core Topics =============
  {
    id: "lab-4",
    title: "Firewall Policy Configuration",
    description: "Create, modify, and manage firewall policies. Understand policy ordering, UTM profiles, and NAT settings. Aligns with NSE 4.1 Module 2: Firewall Policies.",
    difficulty: "intermediate",
    category: "Firewall",
    estimatedMinutes: 15,
    tags: ["firewall", "policy", "utm", "NAT", "NSE4.1"],
    nseAlignment: "NSE 4.1 — Module 2: Firewall Policies",
    objectives: [
      {
        id: "4-1",
        title: "Navigate to Policy Editor",
        description: "Go to the Firewall Policy configuration page and review existing policies.",
        hints: [
          "Click 'Firewall Policies' under Configuration in the sidebar",
          "Notice policies are processed top-to-bottom — order matters!",
          "Policy 7 (Block-All-Default) should always be last"
        ],
        validationType: "navigation",
        validationData: { path: "/config/policies" }
      },
      {
        id: "4-2",
        title: "Create HTTPS-Only LAN Policy",
        description: "Create a new policy: Source Interface=port3, Dest Interface=port1, Service=HTTPS, Action=ACCEPT with NAT enabled.",
        hints: [
          "Click 'Create New' button",
          "Set Name to 'LAN-HTTPS-Only'",
          "Source Interface: port3, Dest Interface: port1",
          "Service: HTTPS (not ALL), Action: ACCEPT, enable NAT"
        ],
        validationType: "config",
        validationData: { check: "policy-exists", srcintf: "port3", dstintf: "port1" }
      },
      {
        id: "4-3",
        title: "Enable Security Profiles",
        description: "On your new policy, enable Antivirus (default profile), IPS (default sensor), and Web Filter (default profile).",
        hints: [
          "Edit your new policy",
          "In the Security Profiles section, set AV profile to 'default'",
          "Set IPS sensor to 'default' and Web Filter to 'default'",
          "SSL Inspection should be set to handle encrypted traffic inspection"
        ],
        validationType: "manual"
      },
      {
        id: "4-4",
        title: "Verify Policy in CLI",
        description: "Use 'show firewall policy' to verify your new policy appears in the configuration.",
        hints: [
          "Open CLI terminal",
          "Type: show firewall policy",
          "Your new policy should appear with av-profile, ips-sensor, and webfilter-profile set"
        ],
        validationType: "cli",
        validationData: { command: "show firewall policy" }
      },
    ],
  },
  {
    id: "lab-5",
    title: "Web Filtering & Application Control",
    description: "Review web filter categories, application control profiles, and understand how FortiGuard categorization works. Aligns with NSE 4.1 Modules 7-8.",
    difficulty: "intermediate",
    category: "UTM Security",
    estimatedMinutes: 15,
    tags: ["web-filter", "app-control", "utm", "NSE4.1"],
    nseAlignment: "NSE 4.1 — Module 7: Web Filtering / Module 8: Application Control",
    objectives: [
      {
        id: "5-1",
        title: "Review Security Dashboard",
        description: "Navigate to the Security Dashboard and examine the Web Filter categories table.",
        hints: [
          "Click 'Security' in the sidebar",
          "The Web Filter widget shows categories like Social Media (monitored), Gambling (blocked), etc."
        ],
        validationType: "navigation",
        validationData: { path: "/security" }
      },
      {
        id: "5-2",
        title: "Identify Blocked Categories",
        description: "List all web categories that are set to 'block' action.",
        hints: [
          "Look at the Action column in the Web Filter table",
          "Gambling, Malicious, Adult Content, and Phishing are all blocked",
          "Social Media and Streaming are monitored (logged but allowed)"
        ],
        validationType: "manual"
      },
      {
        id: "5-3",
        title: "Check Application Risks",
        description: "Go to FortiView → Applications and identify any high-risk (risk 4-5) applications.",
        hints: [
          "Navigate to the Applications monitor page",
          "BitTorrent has risk level 5 (highest risk P2P application)",
          "Risk levels: 1=minimal, 2=low, 3=moderate, 4=high, 5=critical"
        ],
        validationType: "navigation",
        validationData: { path: "/monitors/applications" }
      },
      {
        id: "5-4",
        title: "Review Blocked Policy",
        description: "Find the 'Block-Gambling' policy in the Policy Editor and verify its web filter profile.",
        hints: [
          "Go to Firewall Policies",
          "Policy 4: Block-Gambling uses web filter profile 'strict'",
          "The action is DENY and it logs all traffic"
        ],
        validationType: "navigation",
        validationData: { path: "/config/policies" }
      },
    ],
  },
  {
    id: "lab-6",
    title: "SSL VPN Configuration",
    description: "Review SSL-VPN setup: portal configuration, user assignments, active sessions, and tunnel types. Aligns with NSE 4.1 Module 11: SSL VPN.",
    difficulty: "intermediate",
    category: "VPN",
    estimatedMinutes: 20,
    tags: ["ssl-vpn", "remote-access", "authentication", "NSE4.1"],
    nseAlignment: "NSE 4.1 — Module 11: SSL VPN",
    objectives: [
      {
        id: "6-1",
        title: "Review SSL-VPN Active Sessions",
        description: "Navigate to the SSL-VPN monitor and count the number of active remote users.",
        hints: [
          "Go to Network → SSL-VPN Monitor in the sidebar",
          "There are 5 active SSL-VPN sessions",
          "Note the different tunnel types: Full Tunnel, Split Tunnel, and Web Mode"
        ],
        validationType: "navigation",
        validationData: { path: "/network/ssl-vpn" }
      },
      {
        id: "6-2",
        title: "Check VPN Interface (ssl.root)",
        description: "Verify the ssl.root virtual interface is up and has the correct IP range assigned for VPN clients.",
        hints: [
          "Go to Network Dashboard — find ssl.root in the interface table",
          "ssl.root IP: 10.212.134.1/24 — this is the gateway IP for VPN clients",
          "Client IPs are assigned from 10.212.134.2 to 10.212.134.254"
        ],
        validationType: "manual"
      },
      {
        id: "6-3",
        title: "Review VPN Firewall Policy",
        description: "Find the 'VPN-Users-Access' policy that allows SSL-VPN users to access the internal LAN.",
        hints: [
          "Go to Firewall Policies",
          "Policy 5: VPN-Users-Access — srcintf=ssl.root, dstintf=port3",
          "This policy allows VPN users to reach the LAN subnet"
        ],
        validationType: "navigation",
        validationData: { path: "/config/policies" }
      },
      {
        id: "6-4",
        title: "CLI: View Interface Details",
        description: "Use CLI to check the ssl.root interface configuration.",
        hints: [
          "Open CLI terminal",
          "Type: get system interface",
          "Find the ssl.root entry and verify its IP and status"
        ],
        validationType: "cli",
        validationData: { command: "get system interface" }
      },
    ],
  },
  {
    id: "lab-7",
    title: "Antivirus & IPS",
    description: "Review antivirus detection logs, IPS signature hits, and sandbox analysis results. Aligns with NSE 4.1 Modules 9-10: Antivirus and IPS.",
    difficulty: "intermediate",
    category: "Threat Prevention",
    estimatedMinutes: 15,
    tags: ["antivirus", "ips", "sandbox", "NSE4.1"],
    nseAlignment: "NSE 4.1 — Module 9: Antivirus / Module 10: IPS",
    objectives: [
      {
        id: "7-1",
        title: "Review IPS Signature Hits",
        description: "Navigate to the Security Dashboard and examine the top IPS signatures that have triggered.",
        hints: [
          "Go to Security Dashboard",
          "The top IPS hit is Apache.Log4j (CVE-2024-21762) with 3,421 drops",
          "MS.SMB.Server.Trans.Peeking.Data is second with 2,890 drops"
        ],
        validationType: "navigation",
        validationData: { path: "/security" }
      },
      {
        id: "7-2",
        title: "Check Sandbox Results",
        description: "Find the FortiSandbox analysis statistics showing clean, suspicious, and malicious file counts.",
        hints: [
          "Look at the Sandbox Analysis widget",
          "4,521 total submissions: 3,892 clean, 412 suspicious, 217 malicious",
          "Malicious files have been automatically blocked"
        ],
        validationType: "manual"
      },
      {
        id: "7-3",
        title: "Investigate Compromised Hosts",
        description: "Go to the Compromised Hosts section and identify the ransomware-infected host.",
        hints: [
          "WS-DEV-12 (10.0.8.201) is infected with Win32/Lockbit ransomware",
          "Status shows 'isolated' — the host has been quarantined",
          "Check its sessions: SMB (445) and NetBIOS (139) indicate lateral movement attempts"
        ],
        validationType: "manual"
      },
      {
        id: "7-4",
        title: "CLI: View DHCP Leases",
        description: "Use CLI to check DHCP server leases and identify reserved versus dynamic addresses.",
        hints: [
          "Open CLI terminal",
          "Type: get system dhcp server",
          "PRINTER-FL2 and AP-CONF-ROOM have 'reserved' status (static DHCP)"
        ],
        validationType: "cli",
        validationData: { command: "get system dhcp server" }
      },
    ],
  },

  // ============= ADVANCED — NSE 4 Practical Scenarios =============
  {
    id: "lab-8",
    title: "Incident Response: Ransomware",
    description: "A ransomware alert (Win32/Lockbit) has been triggered on WS-DEV-12. Follow the incident response workflow: investigate, isolate, assess lateral movement, and create containment policies.",
    difficulty: "advanced",
    category: "Incident Response",
    estimatedMinutes: 25,
    tags: ["incident-response", "ransomware", "security", "forensics"],
    nseAlignment: "NSE 4.1 — Module 5: Logging / Module 9: Antivirus (Advanced)",
    objectives: [
      {
        id: "8-1",
        title: "Identify the Ransomware Alert",
        description: "Find the ransomware detection entry in the Alert Console on the Status Dashboard.",
        hints: [
          "Go to Status Dashboard",
          "Alert Console shows: 'Ransomware detected: Win32/Lockbit from 10.0.8.201'",
          "This is a critical-severity alert from the antivirus engine"
        ],
        validationType: "navigation",
        validationData: { path: "/" }
      },
      {
        id: "8-2",
        title: "Investigate the Compromised Host",
        description: "Go to Security Dashboard and examine WS-DEV-12's threat details, including associated sessions and C&C communication.",
        hints: [
          "Navigate to Security Dashboard",
          "Find WS-DEV-12 (10.0.8.201) in the Compromised Hosts section",
          "Threat: Ransomware (Win32/Lockbit), detected at 14:18:56"
        ],
        validationType: "navigation",
        validationData: { path: "/security" }
      },
      {
        id: "8-3",
        title: "Assess Lateral Movement",
        description: "Review the host's active sessions — check for SMB (port 445) and NetBIOS (port 139) connections indicating lateral spread attempts.",
        hints: [
          "WS-DEV-12 has sessions to 192.168.1.0/24:445 (SMB) and 10.0.8.0/24:139 (NetBIOS)",
          "SMB on port 445 is the primary vector for ransomware lateral movement",
          "Both connections indicate the malware is actively trying to spread"
        ],
        validationType: "manual"
      },
      {
        id: "8-4",
        title: "Create Isolation Policy",
        description: "Create a DENY policy in the Firewall Policy Editor to block all traffic from the compromised host (10.0.8.201).",
        hints: [
          "Go to Firewall Policies → Create New",
          "Name: 'Quarantine-WS-DEV-12', Action: DENY",
          "Source: 10.0.8.201, Destination: all, Service: ALL",
          "Place this policy ABOVE the default allow policies"
        ],
        validationType: "config"
      },
      {
        id: "8-5",
        title: "Diagnose with Packet Flow Trace",
        description: "Use the CLI debug flow command to trace how packets from the compromised host are being processed.",
        hints: [
          "Open CLI terminal",
          "Type: diagnose debug flow",
          "The trace shows packet path: receive → route lookup → policy match → UTM scan → forwarding"
        ],
        validationType: "cli",
        validationData: { command: "diagnose debug flow" }
      },
    ],
  },
  {
    id: "lab-9",
    title: "IPsec VPN Troubleshooting",
    description: "Branch-CHI tunnel is down. Diagnose the Phase 2 failure using dashboard monitors and CLI diagnostic tools. Aligns with NSE 4.2 — Diagnostics module.",
    difficulty: "advanced",
    category: "VPN Troubleshooting",
    estimatedMinutes: 20,
    tags: ["ipsec", "troubleshooting", "vpn", "diagnostics", "NSE4.2"],
    nseAlignment: "NSE 4.2 — Module 5: Diagnostics / IPsec VPN",
    objectives: [
      {
        id: "9-1",
        title: "Identify the Down Tunnel",
        description: "Navigate to the IPsec Monitor and identify which tunnel has a Phase 2 failure.",
        hints: [
          "Go to Network → IPsec Monitor",
          "Branch-CHI shows Phase 1=up, Phase 2=down",
          "Phase 1 up but Phase 2 down typically indicates a mismatch in encryption/authentication proposals"
        ],
        validationType: "navigation",
        validationData: { path: "/network/ipsec" }
      },
      {
        id: "9-2",
        title: "Analyze Phase Status",
        description: "Understand why Phase 1 is up but Phase 2 is down — this narrows the troubleshooting scope.",
        hints: [
          "Phase 1 handles IKE negotiation (pre-shared key, DH group, encryption)",
          "Phase 2 handles IPsec SA (proxy IDs, encryption, PFS)",
          "A Phase 2 failure usually means proxy ID mismatch or PFS group mismatch"
        ],
        validationType: "manual"
      },
      {
        id: "9-3",
        title: "CLI: Get IPsec Tunnel Summary",
        description: "Use the CLI to get a summary of all IPsec tunnels and their status.",
        hints: [
          "Open CLI terminal",
          "Type: get vpn ipsec tunnel summary",
          "Branch-CHI shows 0 B incoming/outgoing and uptime=0"
        ],
        validationType: "cli",
        validationData: { command: "get vpn ipsec tunnel summary" }
      },
      {
        id: "9-4",
        title: "Test Connectivity to Remote Gateway",
        description: "Ping the remote gateway IP (192.0.2.100) to verify basic network connectivity is working.",
        hints: [
          "Open CLI terminal",
          "Type: execute ping 192.0.2.100",
          "If ping succeeds, the issue is in the VPN configuration, not network reachability"
        ],
        validationType: "cli",
        validationData: { command: "execute ping 192.0.2.100" }
      },
    ],
  },
  {
    id: "lab-10",
    title: "Comprehensive Security Audit",
    description: "Conduct a full security audit: review firewall policies for overly permissive rules, check license and certificate expiry, verify IPS signatures, and assess overall system health.",
    difficulty: "advanced",
    category: "Security Audit",
    estimatedMinutes: 30,
    tags: ["audit", "security", "compliance", "best-practices", "NSE4"],
    nseAlignment: "NSE 4.1/4.2 — Comprehensive Review",
    objectives: [
      {
        id: "10-1",
        title: "Audit Firewall Policies",
        description: "Review all policies and identify any overly permissive rules (Service=ALL with Action=ACCEPT) that should be tightened.",
        hints: [
          "Go to Firewall Policies",
          "Policy 1 (LAN-to-Internet) uses Service=ALL — this is overly permissive",
          "Policy 5 (VPN-Users-Access) also uses Service=ALL",
          "Best practice: restrict to specific required services (HTTPS, DNS, etc.)"
        ],
        validationType: "navigation",
        validationData: { path: "/config/policies" }
      },
      {
        id: "10-2",
        title: "Check Certificate Expiry",
        description: "Look for certificate expiry warnings in the Alert Console.",
        hints: [
          "Go to Status Dashboard → Alert Console",
          "Alert: 'Certificate for vpn.example.com expires in 14 days'",
          "Expired certificates will break SSL-VPN and HTTPS management access"
        ],
        validationType: "manual"
      },
      {
        id: "10-3",
        title: "Review IPS Coverage",
        description: "Check the IPS signatures on the Security Dashboard and verify critical vulnerabilities like Log4j are being blocked.",
        hints: [
          "Go to Security Dashboard",
          "Apache.Log4j.Error.Log.Remote.Code.Execution (ID: 51006) — action: drop ✓",
          "All critical and high severity signatures should have action='drop', not just 'alert'"
        ],
        validationType: "navigation",
        validationData: { path: "/security" }
      },
      {
        id: "10-4",
        title: "Verify System Health via CLI",
        description: "Run 'get system performance status' and check CPU, memory, and session counts are within acceptable ranges.",
        hints: [
          "Open CLI terminal",
          "Type: get system performance status",
          "CPU under 80%, Memory under 85% = healthy",
          "Check for virus catches and intrusion detection counts"
        ],
        validationType: "cli",
        validationData: { command: "get system performance status" }
      },
      {
        id: "10-5",
        title: "Check License Compliance",
        description: "Identify any expired or expiring licenses that affect security coverage.",
        hints: [
          "Go to Status Dashboard → Licenses widget",
          "Anti-Spam is EXPIRED — spam filtering is not active",
          "FortiClient EMS shows WARNING — expires 2026-01-15",
          "All other FortiGuard services should be valid"
        ],
        validationType: "manual"
      },
    ],
  },
];
