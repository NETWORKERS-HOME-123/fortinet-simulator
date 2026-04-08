// Training lab scenario definitions

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
}

export const scenarios: LabScenario[] = [
  // Beginner
  {
    id: "lab-1",
    title: "Dashboard Navigation",
    description: "Explore the FortiGate dashboard interface. Learn to navigate between Status, Network, Security, and monitor views. Identify key system metrics.",
    difficulty: "beginner",
    category: "Navigation",
    estimatedMinutes: 10,
    tags: ["dashboard", "navigation", "basics"],
    objectives: [
      { id: "1-1", title: "Navigate to Status Dashboard", description: "Go to the main Status dashboard and observe CPU/Memory gauges.", hints: ["Click 'Status' in the left sidebar", "The Status page is the home/root page"], validationType: "navigation", validationData: { path: "/" } },
      { id: "1-2", title: "Check Network Dashboard", description: "Navigate to the Network dashboard and find the interface table.", hints: ["Click 'Network' in the sidebar", "Look for the interface status table"], validationType: "navigation", validationData: { path: "/network" } },
      { id: "1-3", title: "Find a Critical Alert", description: "Go to the Status dashboard and identify at least one critical alert in the Alert Console.", hints: ["Look at the Alert Console widget", "Critical alerts are shown in red"], validationType: "manual" },
      { id: "1-4", title: "View Security Dashboard", description: "Navigate to the Security dashboard and identify the top threat.", hints: ["Click 'Security' in the sidebar"], validationType: "navigation", validationData: { path: "/security" } },
    ],
  },
  {
    id: "lab-2",
    title: "View Routing Table",
    description: "Learn to view and understand the routing table. Identify static routes, connected routes, and dynamic routing protocols (OSPF, BGP).",
    difficulty: "beginner",
    category: "Networking",
    estimatedMinutes: 10,
    tags: ["routing", "network", "basics"],
    objectives: [
      { id: "2-1", title: "Navigate to Routing Monitor", description: "Go to Network → Routing Monitor page.", hints: ["Expand 'Network' in the sidebar", "Click 'Routing Monitor'"], validationType: "navigation", validationData: { path: "/network/routing" } },
      { id: "2-2", title: "Identify the Default Gateway", description: "Find the default route (0.0.0.0/0) and identify the gateway IP.", hints: ["Look for destination 0.0.0.0/0", "The gateway is 203.0.113.254"], validationType: "manual" },
      { id: "2-3", title: "Find the OSPF Route", description: "Identify which route was learned via OSPF.", hints: ["Look for type 'OSPF' in the routing table", "192.168.50.0/24 is the OSPF route"], validationType: "manual" },
      { id: "2-4", title: "Use CLI to View Routes", description: "Open the CLI terminal and run: get router info routing-table all", hints: ["Click the '>_' CLI button in the header", "Type: get router info routing-table all"], validationType: "cli", validationData: { command: "get router info routing-table all" } },
    ],
  },
  {
    id: "lab-3",
    title: "Check VPN Status",
    description: "Monitor IPsec and SSL-VPN tunnel status. Identify which tunnels are operational and which are experiencing issues.",
    difficulty: "beginner",
    category: "VPN",
    estimatedMinutes: 10,
    tags: ["vpn", "ipsec", "ssl-vpn"],
    objectives: [
      { id: "3-1", title: "Navigate to VPN Dashboard", description: "Go to the VPN dashboard page.", hints: ["Click 'VPN' in the sidebar"], validationType: "navigation", validationData: { path: "/vpn" } },
      { id: "3-2", title: "Find the Down Tunnel", description: "Identify which IPsec tunnel has Phase 2 down.", hints: ["Look at the IPsec tunnel table", "Branch-CHI has Phase 2 down"], validationType: "manual" },
      { id: "3-3", title: "Check SSL-VPN Users", description: "Navigate to the SSL-VPN monitor and count active users.", hints: ["Go to Network → SSL-VPN monitor in sidebar"], validationType: "navigation", validationData: { path: "/network/ssl-vpn" } },
      { id: "3-4", title: "CLI: Check IPsec Summary", description: "Use CLI command: get vpn ipsec tunnel summary", hints: ["Open CLI terminal", "Type: get vpn ipsec tunnel summary"], validationType: "cli", validationData: { command: "get vpn ipsec tunnel summary" } },
    ],
  },
  // Intermediate
  {
    id: "lab-4",
    title: "Create Firewall Policy",
    description: "Create a new firewall policy to allow LAN users to access the internet on HTTPS only, with antivirus profile enabled.",
    difficulty: "intermediate",
    category: "Firewall",
    estimatedMinutes: 15,
    tags: ["firewall", "policy", "utm"],
    objectives: [
      { id: "4-1", title: "Navigate to Policy Editor", description: "Go to the Firewall Policy configuration page.", hints: ["Click 'Firewall Policies' under Configuration in the sidebar"], validationType: "navigation", validationData: { path: "/config/policies" } },
      { id: "4-2", title: "Create New Policy", description: "Click 'Create New' and fill in: Source Interface = port3, Dest Interface = port1, Service = HTTPS.", hints: ["Click the 'Create New' button", "Set srcintf to port3 (LAN) and dstintf to port1 (WAN1)"], validationType: "config", validationData: { check: "policy-exists", srcintf: "port3", dstintf: "port1" } },
      { id: "4-3", title: "Enable AV Profile", description: "In the UTM section, enable the Antivirus profile.", hints: ["Scroll to UTM Profiles section", "Select 'default' for AV profile"], validationType: "manual" },
      { id: "4-4", title: "Verify Policy in CLI", description: "Use CLI: show firewall policy — verify your new policy appears.", hints: ["Open CLI", "Type: show firewall policy"], validationType: "cli", validationData: { command: "show firewall policy" } },
    ],
  },
  {
    id: "lab-5",
    title: "Block a Compromised Host",
    description: "A botnet-infected host has been detected. Investigate the compromise in the Security dashboard, then create a deny policy to quarantine it.",
    difficulty: "intermediate",
    category: "Incident Response",
    estimatedMinutes: 15,
    tags: ["security", "incident-response", "policy"],
    objectives: [
      { id: "5-1", title: "Find Compromised Host", description: "Go to Security Dashboard and locate the botnet-infected host.", hints: ["Navigate to Security Dashboard", "Look at the Compromised Hosts widget"], validationType: "navigation", validationData: { path: "/security" } },
      { id: "5-2", title: "Identify the Threat", description: "Click on the compromised host to see its associated sessions and C&C server IP.", hints: ["Click the row for 10.0.5.102", "Note the destination IP in sessions"], validationType: "manual" },
      { id: "5-3", title: "Create Blocking Policy", description: "Go to Policy Editor and create a deny policy for the compromised host IP.", hints: ["Navigate to Firewall Policies", "Create a deny policy with srcaddr matching the host"], validationType: "config" },
      { id: "5-4", title: "Verify in Logs", description: "Check the Alert Console for the original botnet detection alert.", hints: ["Go to Status Dashboard", "Look at Alert Console for botnet alerts"], validationType: "manual" },
    ],
  },
  {
    id: "lab-6",
    title: "Configure SSL-VPN",
    description: "Set up SSL-VPN access for remote users. Configure the portal, assign a user group, and verify the connection settings.",
    difficulty: "intermediate",
    category: "VPN",
    estimatedMinutes: 20,
    tags: ["ssl-vpn", "remote-access", "configuration"],
    objectives: [
      { id: "6-1", title: "Review Current SSL-VPN Users", description: "Check the SSL-VPN monitor for current active sessions.", hints: ["Navigate to the SSL-VPN monitor page"], validationType: "navigation", validationData: { path: "/network/ssl-vpn" } },
      { id: "6-2", title: "Check VPN Interface", description: "Verify the ssl.root interface is up and has an IP assigned.", hints: ["Go to Network dashboard or use CLI: get system interface"], validationType: "manual" },
      { id: "6-3", title: "Review VPN Policy", description: "Find the existing VPN-Users-Access policy in the Policy Editor.", hints: ["Navigate to Firewall Policies", "Look for policy named VPN-Users-Access"], validationType: "navigation", validationData: { path: "/config/policies" } },
      { id: "6-4", title: "CLI: Show SSL-VPN Settings", description: "Use CLI to check system settings.", hints: ["Type: get system status", "Review the SSL-VPN related info"], validationType: "cli", validationData: { command: "get system status" } },
    ],
  },
  {
    id: "lab-7",
    title: "DHCP Server Setup",
    description: "Review the DHCP server configuration, check active leases, and understand scope management.",
    difficulty: "intermediate",
    category: "Networking",
    estimatedMinutes: 15,
    tags: ["dhcp", "network", "configuration"],
    objectives: [
      { id: "7-1", title: "Navigate to DHCP Monitor", description: "Go to Network → DHCP Monitor page.", hints: ["Expand Network in sidebar", "Click DHCP Monitor"], validationType: "navigation", validationData: { path: "/network/dhcp" } },
      { id: "7-2", title: "Count Active Leases", description: "Identify how many active (non-reserved) DHCP leases exist.", hints: ["Look at the status column", "Count entries with 'active' status"], validationType: "manual" },
      { id: "7-3", title: "CLI: View DHCP Leases", description: "Use CLI: get system dhcp server to view lease table.", hints: ["Open CLI terminal", "Type: get system dhcp server"], validationType: "cli", validationData: { command: "get system dhcp server" } },
      { id: "7-4", title: "Identify Reserved IPs", description: "Find which IPs are statically reserved (not dynamic).", hints: ["Look for 'reserved' status in the DHCP table", "PRINTER-FL2 and AP-CONF-ROOM are reserved"], validationType: "manual" },
    ],
  },
  // Advanced
  {
    id: "lab-8",
    title: "Incident Response: Ransomware",
    description: "A ransomware alert has been triggered. Follow the incident response workflow: investigate, isolate, assess lateral movement, and create containment policies.",
    difficulty: "advanced",
    category: "Incident Response",
    estimatedMinutes: 25,
    tags: ["incident-response", "ransomware", "security", "advanced"],
    objectives: [
      { id: "8-1", title: "Identify the Ransomware Alert", description: "Find the ransomware detection in the Alert Console.", hints: ["Go to Status dashboard", "Look for 'Ransomware detected' in alerts"], validationType: "navigation", validationData: { path: "/" } },
      { id: "8-2", title: "Investigate the Host", description: "Go to Security Dashboard and examine WS-DEV-12 compromised host details.", hints: ["Navigate to Security Dashboard", "Click on WS-DEV-12 (10.0.8.201)"], validationType: "navigation", validationData: { path: "/security" } },
      { id: "8-3", title: "Check Lateral Movement", description: "Review the host's sessions — is it trying to spread via SMB/NetBIOS?", hints: ["Look at the sessions for WS-DEV-12", "Port 445 (SMB) and 139 (NetBIOS) indicate lateral movement"], validationType: "manual" },
      { id: "8-4", title: "Create Isolation Policy", description: "Create a deny policy to block the compromised host from all network access.", hints: ["Go to Policy Editor", "Create deny policy with source 10.0.8.201"], validationType: "config" },
      { id: "8-5", title: "Diagnose with CLI", description: "Use diagnose debug flow to trace packets from the compromised host.", hints: ["Open CLI", "Type: diagnose debug flow"], validationType: "cli", validationData: { command: "diagnose debug flow" } },
    ],
  },
  {
    id: "lab-9",
    title: "IPsec VPN Troubleshooting",
    description: "Branch-CHI tunnel is down. Diagnose the issue using the dashboard and CLI tools. Identify the Phase 2 failure and understand the configuration.",
    difficulty: "advanced",
    category: "VPN Troubleshooting",
    estimatedMinutes: 20,
    tags: ["ipsec", "troubleshooting", "vpn", "advanced"],
    objectives: [
      { id: "9-1", title: "Identify the Down Tunnel", description: "Navigate to IPsec Monitor and find which tunnel has issues.", hints: ["Go to Network → IPsec Monitor"], validationType: "navigation", validationData: { path: "/network/ipsec" } },
      { id: "9-2", title: "Check Phase Status", description: "Identify that Branch-CHI has Phase 1 up but Phase 2 down.", hints: ["Look at the Phase 1 and Phase 2 columns", "Branch-CHI shows Phase 2 = down"], validationType: "manual" },
      { id: "9-3", title: "CLI: IPsec Summary", description: "Use CLI to get tunnel summary: get vpn ipsec tunnel summary", hints: ["Open CLI", "Type: get vpn ipsec tunnel summary"], validationType: "cli", validationData: { command: "get vpn ipsec tunnel summary" } },
      { id: "9-4", title: "Check Remote Gateway", description: "Note the remote gateway IP (192.0.2.100) and verify connectivity.", hints: ["The remote IP for Branch-CHI is 192.0.2.100", "Use: execute ping 192.0.2.100 in CLI"], validationType: "cli", validationData: { command: "execute ping 192.0.2.100" } },
    ],
  },
  {
    id: "lab-10",
    title: "Full Network Security Audit",
    description: "Conduct a comprehensive security audit: review all firewall policies for overly permissive rules, check certificate expiry, review IPS signatures, and verify system health.",
    difficulty: "advanced",
    category: "Security Audit",
    estimatedMinutes: 30,
    tags: ["audit", "security", "comprehensive", "advanced"],
    objectives: [
      { id: "10-1", title: "Review All Policies", description: "Go to Policy Editor and identify any overly permissive rules (action=accept with service=ALL).", hints: ["Navigate to Firewall Policies", "Look for policies with Service = ALL and Action = Accept"], validationType: "navigation", validationData: { path: "/config/policies" } },
      { id: "10-2", title: "Check Certificate Status", description: "Look for certificate expiry warnings in the Alert Console.", hints: ["Go to Status Dashboard", "Look for certificate-related alerts"], validationType: "manual" },
      { id: "10-3", title: "Review IPS Signatures", description: "Go to Security Dashboard and check the top IPS signature hits.", hints: ["Navigate to Security Dashboard", "Review the IPS signatures table"], validationType: "navigation", validationData: { path: "/security" } },
      { id: "10-4", title: "System Performance Check", description: "Use CLI: get system performance status to verify CPU/Memory are normal.", hints: ["Open CLI", "Type: get system performance status"], validationType: "cli", validationData: { command: "get system performance status" } },
      { id: "10-5", title: "Check Expired Licenses", description: "Find any expired or soon-to-expire licenses.", hints: ["Look at the Licenses widget on Status Dashboard", "Anti-Spam shows as expired"], validationType: "manual" },
    ],
  },
];
