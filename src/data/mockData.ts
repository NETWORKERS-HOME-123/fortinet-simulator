// System Info
export const systemInfo = {
  hostname: "FGT-DC-PRIMARY",
  serialNumber: "FG5H1E5110004321",
  firmware: "FortiOS v7.4.3 build2573",
  uptime: "142 days, 7 hours, 23 minutes",
  systemTime: new Date().toISOString(),
  haStatus: "Active-Passive",
  haRole: "Primary",
  model: "FortiGate 5001E",
};

export const licenses = [
  { name: "FortiCare Support", status: "valid", expiry: "2026-12-15", type: "Premium" },
  { name: "IPS & IDS", status: "valid", expiry: "2026-12-15", type: "Enterprise" },
  { name: "AntiVirus", status: "valid", expiry: "2026-12-15", type: "Enterprise" },
  { name: "Web Filtering", status: "valid", expiry: "2026-12-15", type: "Enterprise" },
  { name: "FortiSandbox Cloud", status: "valid", expiry: "2026-06-30", type: "Standard" },
  { name: "Anti-Spam", status: "expired", expiry: "2025-11-01", type: "Standard" },
  { name: "Mobile Malware", status: "valid", expiry: "2026-12-15", type: "Enterprise" },
  { name: "FortiClient EMS", status: "warning", expiry: "2026-01-15", type: "Standard" },
];

export const cpuUsage = 34;
export const memoryUsage = 62;

// FortiGuard Info
export const fortiGuardInfo = {
  avVersion: "92.04521",
  ipsVersion: "24.531",
  appDbVersion: "24.531",
  ipsDbVersion: "6.01087",
  lastUpdate: "2026-04-08 14:19:33",
  updateServer: "update.fortiguard.net",
  webFilterDbVersion: "1.00312",
  antiSpamDbVersion: "6.00280",
};

// Admin Users
export const adminUsers = [
  { username: "admin", ip: "10.0.1.100", profile: "super_admin", loginTime: "2026-04-08 06:15:22", method: "SSH" },
  { username: "netops", ip: "10.0.1.105", profile: "prof_admin", loginTime: "2026-04-08 08:30:45", method: "HTTPS" },
  { username: "readonly", ip: "10.0.1.110", profile: "read_only", loginTime: "2026-04-08 09:12:00", method: "HTTPS" },
];

// Virtual Domains
export const virtualDomains = [
  { name: "root", status: "active", interfaces: 6, sessions: 127453, bandwidth: "4.2 Gbps" },
  { name: "guest-vdom", status: "active", interfaces: 2, sessions: 3420, bandwidth: "180 Mbps" },
  { name: "dmz-vdom", status: "active", interfaces: 1, sessions: 890, bandwidth: "312 Mbps" },
];

export const fabricDevices = [
  { name: "FGT-DC-PRIMARY", type: "fortigate", status: "up", ip: "10.0.1.1" },
  { name: "FGT-DC-SECONDARY", type: "fortigate", status: "up", ip: "10.0.1.2" },
  { name: "FAZ-DC-01", type: "fortianalyzer", status: "up", ip: "10.0.1.10" },
  { name: "FMG-DC-01", type: "fortimanager", status: "up", ip: "10.0.1.11" },
  { name: "FSW-CORE-01", type: "fortiswitch", status: "up", ip: "10.0.2.1" },
  { name: "FAP-FLOOR2-01", type: "fortiap", status: "up", ip: "10.0.3.1" },
  { name: "FAP-FLOOR3-02", type: "fortiap", status: "down", ip: "10.0.3.2" },
];

// Session data over time
export const sessionData = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, "0")}:00`,
  ipv4: Math.floor(Math.random() * 50000 + 80000),
  ipv6: Math.floor(Math.random() * 8000 + 5000),
}));

export const currentSessions = 127453;
export const spuPercentage = 12;

export const alertLogs = [
  { id: 1, time: "14:23:05", severity: "critical", message: "IPS signature matched: CVE-2024-21762 attempt from 203.0.113.45", source: "ips" },
  { id: 2, time: "14:22:48", severity: "warning", message: "SSL-VPN login failed for user john.doe from 198.51.100.22", source: "vpn" },
  { id: 3, time: "14:22:31", severity: "info", message: "HA heartbeat synchronized with FGT-DC-SECONDARY", source: "system" },
  { id: 4, time: "14:21:55", severity: "warning", message: "Memory usage exceeded 80% threshold", source: "system" },
  { id: 5, time: "14:21:12", severity: "critical", message: "Botnet C&C communication blocked: 10.0.5.102 → 185.220.101.6", source: "ips" },
  { id: 6, time: "14:20:44", severity: "info", message: "Policy ID 45: new session from 10.0.10.55 to 8.8.8.8", source: "traffic" },
  { id: 7, time: "14:20:01", severity: "warning", message: "Certificate for vpn.example.com expires in 14 days", source: "system" },
  { id: 8, time: "14:19:33", severity: "info", message: "FortiGuard AV database updated to version 92.04521", source: "update" },
  { id: 9, time: "14:18:56", severity: "critical", message: "Ransomware detected: Win32/Lockbit from 10.0.8.201", source: "antivirus" },
  { id: 10, time: "14:18:22", severity: "info", message: "Admin user 'admin' logged in from 10.0.1.100", source: "system" },
];

// Network Dashboard
export const bandwidthData = Array.from({ length: 60 }, (_, i) => ({
  time: `${String(Math.floor(i / 60)).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}`,
  inbound: Math.floor(Math.random() * 800 + 200),
  outbound: Math.floor(Math.random() * 500 + 100),
}));

export const memoryData = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, "0")}:00`,
  usage: Math.floor(Math.random() * 20 + 50),
}));

export const interfaces = [
  { name: "port1", alias: "WAN1", ip: "203.0.113.1/24", status: "up", speed: "10Gbps", rxRate: "2.4 Gbps", txRate: "1.8 Gbps", rxBytes: "14.2 TB", txBytes: "9.8 TB" },
  { name: "port2", alias: "WAN2", ip: "198.51.100.1/24", status: "up", speed: "10Gbps", rxRate: "1.1 Gbps", txRate: "890 Mbps", rxBytes: "6.7 TB", txBytes: "4.2 TB" },
  { name: "port3", alias: "LAN", ip: "10.0.1.1/24", status: "up", speed: "10Gbps", rxRate: "3.2 Gbps", txRate: "2.9 Gbps", rxBytes: "22.1 TB", txBytes: "18.5 TB" },
  { name: "port4", alias: "DMZ", ip: "172.16.0.1/24", status: "up", speed: "1Gbps", rxRate: "245 Mbps", txRate: "312 Mbps", rxBytes: "1.2 TB", txBytes: "1.8 TB" },
  { name: "port5", alias: "MGMT", ip: "10.0.99.1/24", status: "up", speed: "1Gbps", rxRate: "12 Mbps", txRate: "8 Mbps", rxBytes: "45 GB", txBytes: "22 GB" },
  { name: "ssl.root", alias: "SSL-VPN", ip: "10.212.134.1/24", status: "up", speed: "N/A", rxRate: "89 Mbps", txRate: "124 Mbps", rxBytes: "320 GB", txBytes: "580 GB" },
];

export const routes = [
  { destination: "0.0.0.0/0", gateway: "203.0.113.254", interface: "port1", type: "static", distance: 10, priority: 1 },
  { destination: "0.0.0.0/0", gateway: "198.51.100.254", interface: "port2", type: "static", distance: 20, priority: 2 },
  { destination: "10.0.0.0/8", gateway: "10.0.1.254", interface: "port3", type: "connected", distance: 0, priority: 0 },
  { destination: "172.16.0.0/12", gateway: "172.16.0.254", interface: "port4", type: "connected", distance: 0, priority: 0 },
  { destination: "192.168.50.0/24", gateway: "10.0.1.50", interface: "port3", type: "OSPF", distance: 110, priority: 0 },
  { destination: "192.168.60.0/24", gateway: "10.0.1.60", interface: "port3", type: "BGP", distance: 200, priority: 0 },
];

export const dhcpLeases = [
  { ip: "10.0.10.101", mac: "00:1A:2B:3C:4D:5E", hostname: "DESKTOP-JDO3K2", interface: "port3", expiry: "2026-04-08 18:30:00", status: "active" },
  { ip: "10.0.10.102", mac: "00:1A:2B:3C:4D:5F", hostname: "MacBook-Sarah", interface: "port3", expiry: "2026-04-08 19:15:00", status: "active" },
  { ip: "10.0.10.103", mac: "00:1A:2B:3C:4D:60", hostname: "iPhone-Mike", interface: "port3", expiry: "2026-04-08 17:45:00", status: "active" },
  { ip: "10.0.10.104", mac: "00:1A:2B:3C:4D:61", hostname: "PRINTER-FL2", interface: "port3", expiry: "2026-04-09 10:00:00", status: "reserved" },
  { ip: "10.0.10.105", mac: "00:1A:2B:3C:4D:62", hostname: "AP-CONF-ROOM", interface: "port3", expiry: "2026-04-09 10:00:00", status: "reserved" },
];

export const ipsecTunnels = [
  { name: "Branch-NYC", phase1: "up", phase2: "up", remote: "198.51.100.50", incoming: "1.2 GB", outgoing: "890 MB", uptime: "42 days" },
  { name: "Branch-LAX", phase1: "up", phase2: "up", remote: "203.0.113.80", incoming: "2.4 GB", outgoing: "1.8 GB", uptime: "42 days" },
  { name: "Branch-CHI", phase1: "up", phase2: "down", remote: "192.0.2.100", incoming: "0 B", outgoing: "0 B", uptime: "0" },
  { name: "AWS-VPC", phase1: "up", phase2: "up", remote: "52.14.88.201", incoming: "5.6 GB", outgoing: "3.2 GB", uptime: "120 days" },
  { name: "Azure-VNET", phase1: "up", phase2: "up", remote: "40.76.12.55", incoming: "3.1 GB", outgoing: "2.8 GB", uptime: "90 days" },
];

// SSL-VPN Monitor
export const sslVpnMonitorSessions = [
  { user: "emma.taylor", sourceIp: "73.162.55.12", assignedIp: "10.212.134.5", duration: "7h 55m", bandwidth: "3.1 GB", tunnelType: "Full Tunnel", loginTime: "2026-04-08 06:05:00", os: "Windows 11" },
  { user: "lisa.nguyen", sourceIp: "68.45.123.88", assignedIp: "10.212.134.8", duration: "6h 10m", bandwidth: "1.8 GB", tunnelType: "Full Tunnel", loginTime: "2026-04-08 07:50:00", os: "macOS 15" },
  { user: "robert.kim", sourceIp: "24.56.78.90", assignedIp: "10.212.134.12", duration: "3h 22m", bandwidth: "920 MB", tunnelType: "Split Tunnel", loginTime: "2026-04-08 10:38:00", os: "Windows 10" },
  { user: "alice.wang", sourceIp: "99.132.44.67", assignedIp: "10.212.134.15", duration: "1h 45m", bandwidth: "456 MB", tunnelType: "Web Mode", loginTime: "2026-04-08 12:15:00", os: "Chrome OS" },
  { user: "james.brown", sourceIp: "45.22.88.134", assignedIp: "10.212.134.18", duration: "0h 32m", bandwidth: "89 MB", tunnelType: "Full Tunnel", loginTime: "2026-04-08 13:28:00", os: "Ubuntu 22.04" },
];

// Security Dashboard
export const topThreats = [
  { name: "SQL Injection", count: 14523, severity: "critical" },
  { name: "XSS Attack", count: 8934, severity: "high" },
  { name: "Brute Force SSH", count: 7821, severity: "high" },
  { name: "DNS Tunneling", count: 4562, severity: "medium" },
  { name: "Botnet C&C", count: 3201, severity: "critical" },
  { name: "Buffer Overflow", count: 2145, severity: "high" },
  { name: "DoS SYN Flood", count: 1876, severity: "medium" },
  { name: "Malware Download", count: 1234, severity: "critical" },
];

export const compromisedHosts = [
  { ip: "10.0.5.102", hostname: "WS-ACCT-04", severity: "critical", threat: "Botnet C&C Communication", detectedAt: "2026-04-08 14:21:12", status: "quarantined",
    sessions: [
      { destIp: "185.220.101.6", destPort: 443, protocol: "TCP", policy: "Policy-12", bytes: 24500, application: "HTTPS" },
      { destIp: "185.220.101.8", destPort: 8443, protocol: "TCP", policy: "Policy-12", bytes: 12300, application: "Unknown" },
    ]
  },
  { ip: "10.0.8.201", hostname: "WS-DEV-12", severity: "critical", threat: "Ransomware (Win32/Lockbit)", detectedAt: "2026-04-08 14:18:56", status: "isolated",
    sessions: [
      { destIp: "192.168.1.0/24", destPort: 445, protocol: "SMB", policy: "Policy-8", bytes: 890000, application: "SMB" },
      { destIp: "10.0.8.0/24", destPort: 139, protocol: "NetBIOS", policy: "Policy-8", bytes: 45000, application: "NetBIOS" },
    ]
  },
  { ip: "10.0.10.55", hostname: "LAPTOP-JSMITH", severity: "high", threat: "Trojan Downloader", detectedAt: "2026-04-08 12:05:33", status: "monitoring",
    sessions: [
      { destIp: "198.51.100.44", destPort: 443, protocol: "TCP", policy: "Policy-15", bytes: 56000, application: "HTTPS" },
    ]
  },
  { ip: "10.0.6.78", hostname: "SRV-DB-02", severity: "medium", threat: "Suspicious DNS queries", detectedAt: "2026-04-08 10:44:21", status: "monitoring",
    sessions: [
      { destIp: "8.8.8.8", destPort: 53, protocol: "UDP", policy: "Policy-3", bytes: 12000, application: "DNS" },
      { destIp: "1.1.1.1", destPort: 53, protocol: "UDP", policy: "Policy-3", bytes: 8900, application: "DNS" },
    ]
  },
];

export const sandboxStats = {
  totalSubmissions: 4521,
  clean: 3892,
  suspicious: 412,
  malicious: 217,
  pending: 0,
};

export const webFilterCategories = [
  { category: "Social Media", count: 45230, action: "monitor" },
  { category: "Streaming", count: 32100, action: "monitor" },
  { category: "Shopping", count: 21450, action: "allow" },
  { category: "News", count: 18900, action: "allow" },
  { category: "Gambling", count: 5430, action: "block" },
  { category: "Malicious", count: 3210, action: "block" },
  { category: "Adult Content", count: 2100, action: "block" },
  { category: "Phishing", count: 1890, action: "block" },
];

export const ipsSignatures = [
  { name: "Apache.Log4j.Error.Log.Remote.Code.Execution", id: 51006, severity: "critical", count: 3421, action: "drop" },
  { name: "MS.SMB.Server.Trans.Peeking.Data", id: 44234, severity: "critical", count: 2890, action: "drop" },
  { name: "SSL.Anonymous.Cipher.Detected", id: 32001, severity: "high", count: 2345, action: "drop" },
  { name: "HTTP.URI.SQL.Injection", id: 18102, severity: "high", count: 1987, action: "drop" },
  { name: "DNS.Tunneling.Detected", id: 50210, severity: "medium", count: 1654, action: "alert" },
  { name: "SSH.Brute.Force.Login", id: 40321, severity: "medium", count: 1432, action: "block" },
];

export const avThreats = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, "0")}:00`,
  detected: Math.floor(Math.random() * 50 + 10),
  blocked: Math.floor(Math.random() * 45 + 8),
}));

// Users & Devices / Assets & Identities
export const activeUsers = [
  { username: "john.doe", ip: "10.0.10.55", group: "Engineering", traffic: "2.4 GB", duration: "8h 23m", authMethod: "LDAP" },
  { username: "sarah.chen", ip: "10.0.10.102", group: "Finance", traffic: "890 MB", duration: "6h 45m", authMethod: "LDAP" },
  { username: "mike.wilson", ip: "10.0.10.103", group: "Sales", traffic: "1.2 GB", duration: "4h 12m", authMethod: "SAML" },
  { username: "admin", ip: "10.0.1.100", group: "IT Admin", traffic: "456 MB", duration: "2h 05m", authMethod: "Local" },
  { username: "emma.taylor", ip: "10.212.134.5", group: "Remote", traffic: "3.1 GB", duration: "7h 55m", authMethod: "SSL-VPN" },
  { username: "david.park", ip: "10.0.10.110", group: "Marketing", traffic: "678 MB", duration: "5h 30m", authMethod: "LDAP" },
  { username: "lisa.nguyen", ip: "10.212.134.8", group: "Remote", traffic: "1.8 GB", duration: "6h 10m", authMethod: "SSL-VPN" },
];

export const deviceInventory = [
  { type: "Windows PC", count: 145, os: "Windows 11/10", compliant: 138, nonCompliant: 7 },
  { type: "macOS", count: 42, os: "macOS 14/15", compliant: 41, nonCompliant: 1 },
  { type: "Linux Server", count: 23, os: "Ubuntu/CentOS", compliant: 23, nonCompliant: 0 },
  { type: "iPhone", count: 67, os: "iOS 17/18", compliant: 64, nonCompliant: 3 },
  { type: "Android", count: 34, os: "Android 14/15", compliant: 30, nonCompliant: 4 },
  { type: "Printer", count: 12, os: "Embedded", compliant: 12, nonCompliant: 0 },
  { type: "IoT Device", count: 8, os: "Various", compliant: 5, nonCompliant: 3 },
];

// Firewall Users
export const firewallUsers = [
  { username: "john.doe", authMethod: "LDAP", group: "Engineering", trafficUsed: "2.4 GB", timeoutRemaining: "4h 37m", ip: "10.0.10.55", authServer: "DC-LDAP-01" },
  { username: "sarah.chen", authMethod: "LDAP", group: "Finance", trafficUsed: "890 MB", timeoutRemaining: "1h 15m", ip: "10.0.10.102", authServer: "DC-LDAP-01" },
  { username: "mike.wilson", authMethod: "SAML", group: "Sales", trafficUsed: "1.2 GB", timeoutRemaining: "3h 48m", ip: "10.0.10.103", authServer: "Azure-AD" },
  { username: "emma.taylor", authMethod: "SSL-VPN", group: "Remote", trafficUsed: "3.1 GB", timeoutRemaining: "8h 00m", ip: "10.212.134.5", authServer: "Local" },
  { username: "david.park", authMethod: "LDAP", group: "Marketing", trafficUsed: "678 MB", timeoutRemaining: "2h 30m", ip: "10.0.10.110", authServer: "DC-LDAP-01" },
  { username: "lisa.nguyen", authMethod: "SSL-VPN", group: "Remote", trafficUsed: "1.8 GB", timeoutRemaining: "5h 50m", ip: "10.212.134.8", authServer: "Local" },
  { username: "carlos.garcia", authMethod: "RADIUS", group: "Contractors", trafficUsed: "340 MB", timeoutRemaining: "0h 45m", ip: "10.0.10.120", authServer: "NPS-01" },
];

// WiFi Dashboard
export const fortiApDevices = [
  { name: "FAP-FLOOR1-01", serial: "FP221E3920000101", status: "up", clients: 24, channel: "36/149", firmware: "7.4.3-b0083", model: "FAP-231F", txPower: "Auto", uptime: "42d 6h" },
  { name: "FAP-FLOOR2-01", serial: "FP221E3920000102", status: "up", clients: 31, channel: "44/157", firmware: "7.4.3-b0083", model: "FAP-231F", txPower: "Auto", uptime: "42d 6h" },
  { name: "FAP-FLOOR3-01", serial: "FP221E3920000103", status: "up", clients: 18, channel: "52/161", firmware: "7.4.3-b0083", model: "FAP-431F", txPower: "Auto", uptime: "42d 6h" },
  { name: "FAP-FLOOR3-02", serial: "FP221E3920000104", status: "down", clients: 0, channel: "N/A", firmware: "7.4.3-b0083", model: "FAP-231F", txPower: "N/A", uptime: "0" },
  { name: "FAP-CONF-01", serial: "FP221E3920000105", status: "up", clients: 8, channel: "40/153", firmware: "7.4.3-b0083", model: "FAP-231F", txPower: "Auto", uptime: "38d 12h" },
  { name: "FAP-LOBBY-01", serial: "FP221E3920000106", status: "up", clients: 12, channel: "48/165", firmware: "7.4.3-b0083", model: "FAP-221E", txPower: "Auto", uptime: "42d 6h" },
];

export const wifiClients = [
  { mac: "AA:BB:CC:11:22:33", hostname: "MacBook-Sarah", ap: "FAP-FLOOR2-01", ssid: "Corp-WiFi", band: "5GHz", signal: -42, rxRate: "867 Mbps", txRate: "780 Mbps", ip: "10.0.10.102" },
  { mac: "AA:BB:CC:11:22:34", hostname: "iPhone-Mike", ap: "FAP-FLOOR1-01", ssid: "Corp-WiFi", band: "5GHz", signal: -55, rxRate: "573 Mbps", txRate: "520 Mbps", ip: "10.0.10.103" },
  { mac: "AA:BB:CC:11:22:35", hostname: "DESKTOP-ACCT1", ap: "FAP-FLOOR2-01", ssid: "Corp-WiFi", band: "2.4GHz", signal: -62, rxRate: "144 Mbps", txRate: "130 Mbps", ip: "10.0.10.115" },
  { mac: "AA:BB:CC:11:22:36", hostname: "Galaxy-Tab-A", ap: "FAP-CONF-01", ssid: "Guest-WiFi", band: "5GHz", signal: -48, rxRate: "433 Mbps", txRate: "390 Mbps", ip: "10.0.20.15" },
  { mac: "AA:BB:CC:11:22:37", hostname: "Pixel-7", ap: "FAP-LOBBY-01", ssid: "Guest-WiFi", band: "5GHz", signal: -68, rxRate: "286 Mbps", txRate: "260 Mbps", ip: "10.0.20.22" },
];

// Top Websites by Category
export const topWebsites = [
  { domain: "microsoft.com", category: "Business", visits: 45200, bandwidth: "4.5 GB", action: "allow" },
  { domain: "google.com", category: "Search Engine", visits: 38100, bandwidth: "3.2 GB", action: "allow" },
  { domain: "youtube.com", category: "Streaming Media", visits: 12400, bandwidth: "8.9 GB", action: "monitor" },
  { domain: "facebook.com", category: "Social Media", visits: 8900, bandwidth: "1.8 GB", action: "monitor" },
  { domain: "github.com", category: "Information Technology", visits: 7600, bandwidth: "2.1 GB", action: "allow" },
  { domain: "reddit.com", category: "Social Media", visits: 5400, bandwidth: "980 MB", action: "monitor" },
  { domain: "tiktok.com", category: "Social Media", visits: 3200, bandwidth: "2.4 GB", action: "monitor" },
  { domain: "dropbox.com", category: "Cloud Storage", visits: 2100, bandwidth: "5.6 GB", action: "allow" },
  { domain: "bet365.com", category: "Gambling", visits: 890, bandwidth: "120 MB", action: "block" },
  { domain: "torproject.org", category: "Proxy Avoidance", visits: 45, bandwidth: "12 MB", action: "block" },
];

// Cloud Applications
export const cloudApplications = [
  { name: "Microsoft 365", category: "Business", bandwidth: "4.5 GB", sessions: 12400, risk: 1, users: 142, saasType: "Sanctioned" },
  { name: "Google Workspace", category: "Business", bandwidth: "3.2 GB", sessions: 9800, risk: 1, users: 98, saasType: "Sanctioned" },
  { name: "Salesforce", category: "CRM", bandwidth: "1.8 GB", sessions: 5600, risk: 1, users: 45, saasType: "Sanctioned" },
  { name: "Slack", category: "Collaboration", bandwidth: "1.2 GB", sessions: 8900, risk: 1, users: 120, saasType: "Sanctioned" },
  { name: "Zoom", category: "Video Conferencing", bandwidth: "6.7 GB", sessions: 3200, risk: 1, users: 85, saasType: "Sanctioned" },
  { name: "Dropbox", category: "Cloud Storage", bandwidth: "5.6 GB", sessions: 2100, risk: 2, users: 34, saasType: "Tolerated" },
  { name: "WeTransfer", category: "File Sharing", bandwidth: "890 MB", sessions: 450, risk: 3, users: 12, saasType: "Tolerated" },
  { name: "Mega.nz", category: "Cloud Storage", bandwidth: "234 MB", sessions: 89, risk: 4, users: 3, saasType: "Unsanctioned" },
  { name: "AnonFiles", category: "File Sharing", bandwidth: "45 MB", sessions: 12, risk: 5, users: 1, saasType: "Unsanctioned" },
];

// VPN Dashboard
export const sslVpnSessions = [
  { user: "emma.taylor", sourceIp: "73.162.55.12", assignedIp: "10.212.134.5", duration: "7h 55m", bandwidth: "3.1 GB", tunnelType: "Full Tunnel" },
  { user: "lisa.nguyen", sourceIp: "68.45.123.88", assignedIp: "10.212.134.8", duration: "6h 10m", bandwidth: "1.8 GB", tunnelType: "Full Tunnel" },
  { user: "robert.kim", sourceIp: "24.56.78.90", assignedIp: "10.212.134.12", duration: "3h 22m", bandwidth: "920 MB", tunnelType: "Split Tunnel" },
  { user: "alice.wang", sourceIp: "99.132.44.67", assignedIp: "10.212.134.15", duration: "1h 45m", bandwidth: "456 MB", tunnelType: "Web Mode" },
];

export const vpnTrafficData = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, "0")}:00`,
  sslVpn: Math.floor(Math.random() * 500 + 100),
  ipsec: Math.floor(Math.random() * 800 + 200),
}));

// FortiView monitors
export const fortiviewSessions = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  sourceIp: `10.0.${Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 254) + 1}`,
  destIp: `${Math.floor(Math.random() * 200) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`,
  protocol: ["TCP", "UDP", "ICMP"][Math.floor(Math.random() * 3)],
  sourcePort: Math.floor(Math.random() * 60000 + 1024),
  destPort: [80, 443, 8080, 22, 53, 3389, 25, 993][Math.floor(Math.random() * 8)],
  policy: `Policy-${Math.floor(Math.random() * 20) + 1}`,
  bytes: Math.floor(Math.random() * 100000000),
  duration: Math.floor(Math.random() * 7200),
  application: ["HTTPS", "HTTP", "SSH", "DNS", "RDP", "SMTP", "IMAP"][Math.floor(Math.random() * 7)],
}));

export const fortiviewSources = [
  { ip: "10.0.10.55", hostname: "LAPTOP-JSMITH", sessions: 4521, bandwidth: "2.4 GB", threatScore: 72, country: "Internal" },
  { ip: "10.0.10.102", hostname: "MacBook-Sarah", sessions: 3200, bandwidth: "890 MB", threatScore: 5, country: "Internal" },
  { ip: "203.0.113.45", hostname: "N/A", sessions: 2890, bandwidth: "12 MB", threatScore: 95, country: "CN" },
  { ip: "10.0.8.201", hostname: "WS-DEV-12", sessions: 2100, bandwidth: "1.2 GB", threatScore: 88, country: "Internal" },
  { ip: "10.0.10.103", hostname: "iPhone-Mike", sessions: 1800, bandwidth: "1.2 GB", threatScore: 3, country: "Internal" },
  { ip: "198.51.100.22", hostname: "N/A", sessions: 1500, bandwidth: "5 MB", threatScore: 60, country: "RU" },
];

export const fortiviewDestinations = [
  { ip: "13.107.42.14", domain: "microsoft.com", sessions: 12400, bandwidth: "4.5 GB", category: "Business" },
  { ip: "142.250.80.46", domain: "google.com", sessions: 9800, bandwidth: "3.2 GB", category: "Search" },
  { ip: "31.13.65.36", domain: "facebook.com", sessions: 5600, bandwidth: "1.8 GB", category: "Social Media" },
  { ip: "52.14.88.201", domain: "aws.amazon.com", sessions: 4200, bandwidth: "5.6 GB", category: "Cloud" },
  { ip: "104.18.32.68", domain: "cloudflare.com", sessions: 3800, bandwidth: "2.1 GB", category: "CDN" },
  { ip: "185.220.101.6", domain: "N/A", sessions: 45, bandwidth: "2 MB", category: "Botnet C&C" },
];

export const fortiviewApplications = [
  { name: "HTTPS", category: "Web", bandwidth: "8.2 GB", sessions: 45200, risk: 1 },
  { name: "Microsoft.Office365", category: "Business", bandwidth: "4.5 GB", sessions: 12400, risk: 1 },
  { name: "YouTube", category: "Streaming", bandwidth: "3.8 GB", sessions: 2100, risk: 2 },
  { name: "Google.Services", category: "Business", bandwidth: "3.2 GB", sessions: 9800, risk: 1 },
  { name: "Slack", category: "Collaboration", bandwidth: "1.2 GB", sessions: 5600, risk: 1 },
  { name: "SSH", category: "Remote Access", bandwidth: "890 MB", sessions: 340, risk: 3 },
  { name: "BitTorrent", category: "P2P", bandwidth: "456 MB", sessions: 12, risk: 5 },
  { name: "DNS", category: "Network", bandwidth: "234 MB", sessions: 98000, risk: 1 },
];

export const fortiviewThreats = [
  { name: "Apache.Log4j.Error.Log.Remote.Code.Execution", severity: "critical", count: 3421, source: "203.0.113.45", action: "dropped", category: "Code Execution" },
  { name: "MS.SMB.Server.Trans.Peeking.Data", severity: "critical", count: 2890, source: "198.51.100.22", action: "dropped", category: "Information Disclosure" },
  { name: "SSL.Anonymous.Cipher.Detected", severity: "high", count: 2345, source: "Multiple", action: "dropped", category: "SSL/TLS" },
  { name: "HTTP.URI.SQL.Injection", severity: "high", count: 1987, source: "Multiple", action: "dropped", category: "Injection" },
  { name: "Botnet.C&C.Communication", severity: "critical", count: 1654, source: "10.0.5.102", action: "blocked", category: "Botnet" },
  { name: "SSH.Brute.Force.Login", severity: "medium", count: 1432, source: "Multiple", action: "blocked", category: "Brute Force" },
  { name: "DNS.Tunneling.Detected", severity: "medium", count: 987, source: "10.0.6.78", action: "alert", category: "Evasion" },
];

export const fortiviewVpn = [
  { user: "emma.taylor", tunnelType: "SSL-VPN", sourceIp: "73.162.55.12", duration: "7h 55m", bytesIn: "1.8 GB", bytesOut: "1.3 GB", status: "active" },
  { user: "lisa.nguyen", tunnelType: "SSL-VPN", sourceIp: "68.45.123.88", duration: "6h 10m", bytesIn: "1.0 GB", bytesOut: "800 MB", status: "active" },
  { user: "robert.kim", tunnelType: "SSL-VPN", sourceIp: "24.56.78.90", duration: "3h 22m", bytesIn: "520 MB", bytesOut: "400 MB", status: "active" },
  { user: "Branch-NYC", tunnelType: "IPsec", sourceIp: "198.51.100.50", duration: "42 days", bytesIn: "1.2 GB", bytesOut: "890 MB", status: "active" },
  { user: "Branch-LAX", tunnelType: "IPsec", sourceIp: "203.0.113.80", duration: "42 days", bytesIn: "2.4 GB", bytesOut: "1.8 GB", status: "active" },
  { user: "Branch-CHI", tunnelType: "IPsec", sourceIp: "192.0.2.100", duration: "0", bytesIn: "0", bytesOut: "0", status: "down" },
];

// Firewall Objects
export const firewallSourceObjects = [
  { name: "LAN_SUBNET", type: "Subnet", policy: "Policy-1", hitCount: 245000, sessions: 12400, bandwidth: "8.2 GB" },
  { name: "DMZ_SERVERS", type: "Group", policy: "Policy-3", hitCount: 189000, sessions: 8900, bandwidth: "5.6 GB" },
  { name: "VPN_USERS", type: "Group", policy: "Policy-12", hitCount: 134000, sessions: 5600, bandwidth: "3.1 GB" },
  { name: "GUEST_WIFI", type: "Subnet", policy: "Policy-20", hitCount: 78000, sessions: 3200, bandwidth: "1.8 GB" },
  { name: "MGMT_HOSTS", type: "Address", policy: "Policy-5", hitCount: 45000, sessions: 890, bandwidth: "456 MB" },
  { name: "IOT_DEVICES", type: "Group", policy: "Policy-25", hitCount: 23000, sessions: 450, bandwidth: "234 MB" },
];

export const firewallDestObjects = [
  { name: "INTERNET_ALL", type: "Wildcard", policy: "Policy-1", hitCount: 890000, sessions: 45200, bandwidth: "22.1 GB" },
  { name: "MS365_CLOUD", type: "FQDN Group", policy: "Policy-8", hitCount: 245000, sessions: 12400, bandwidth: "4.5 GB" },
  { name: "AWS_VPC", type: "Subnet", policy: "Policy-15", hitCount: 134000, sessions: 5600, bandwidth: "5.6 GB" },
  { name: "DNS_SERVERS", type: "Address Group", policy: "Policy-3", hitCount: 98000, sessions: 98000, bandwidth: "234 MB" },
  { name: "INTERNAL_SERVERS", type: "Group", policy: "Policy-10", hitCount: 67000, sessions: 4200, bandwidth: "3.2 GB" },
  { name: "BLOCKED_SITES", type: "FQDN Group", policy: "Policy-30", hitCount: 12000, sessions: 0, bandwidth: "0 B" },
];
