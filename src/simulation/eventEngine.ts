// Event injection engine for simulated attacks, failures, and alerts

export interface EventTemplate {
  id: string;
  name: string;
  category: "attack" | "failure" | "system" | "network";
  description: string;
  severity: "critical" | "warning" | "info";
}

export const eventTemplates: EventTemplate[] = [
  { id: "ips-alert", name: "IPS Attack Detected", category: "attack", description: "Trigger an IPS signature match (CVE-2024-21762)", severity: "critical" },
  { id: "av-detect", name: "Antivirus Detection", category: "attack", description: "Ransomware detected on internal host", severity: "critical" },
  { id: "brute-force", name: "SSH Brute Force", category: "attack", description: "Multiple failed SSH login attempts", severity: "warning" },
  { id: "botnet-cc", name: "Botnet C&C Activity", category: "attack", description: "Internal host communicating with known botnet C&C", severity: "critical" },
  { id: "intf-down", name: "Interface Down", category: "failure", description: "WAN1 interface goes down", severity: "critical" },
  { id: "intf-up", name: "Interface Restored", category: "failure", description: "WAN1 interface comes back up", severity: "info" },
  { id: "tunnel-flap", name: "IPsec Tunnel Flap", category: "network", description: "Branch-CHI tunnel goes down then up", severity: "warning" },
  { id: "cpu-spike", name: "CPU Spike", category: "system", description: "CPU usage spikes to 92%", severity: "warning" },
  { id: "mem-spike", name: "Memory Spike", category: "system", description: "Memory usage spikes to 95%", severity: "critical" },
  { id: "dhcp-exhaust", name: "DHCP Pool Exhaustion", category: "network", description: "DHCP pool at 95% capacity", severity: "warning" },
  { id: "auth-fail", name: "Auth Failure Storm", category: "attack", description: "Multiple authentication failures from external IP", severity: "warning" },
  { id: "cert-expiry", name: "Certificate Expiring", category: "system", description: "SSL certificate expires in 24 hours", severity: "warning" },
];

export interface EventAction {
  type: string;
  data: Record<string, unknown>;
  alertMessage: string;
  alertSeverity: "critical" | "warning" | "info";
  alertSource: string;
}

export function generateEventActions(templateId: string): EventAction[] {
  const now = new Date().toLocaleTimeString("en-US", { hour12: false });
  
  switch (templateId) {
    case "ips-alert":
      return [{
        type: "add-alert",
        data: {},
        alertMessage: `IPS signature matched: CVE-2024-21762 exploit attempt from 203.0.113.${Math.floor(Math.random()*254)+1}`,
        alertSeverity: "critical",
        alertSource: "ips",
      }];
    case "av-detect":
      return [{
        type: "add-alert",
        data: {},
        alertMessage: `Ransomware detected: Win32/Lockbit variant on 10.0.${Math.floor(Math.random()*20)}.${Math.floor(Math.random()*254)+1}`,
        alertSeverity: "critical",
        alertSource: "antivirus",
      }, {
        type: "add-compromised-host",
        data: {
          ip: `10.0.${Math.floor(Math.random()*20)}.${Math.floor(Math.random()*254)+1}`,
          hostname: `WS-NEW-${Math.floor(Math.random()*100)}`,
          severity: "critical",
          threat: "Ransomware (Win32/Lockbit)",
          detectedAt: new Date().toISOString(),
          status: "detected",
          sessions: [],
        },
        alertMessage: "New compromised host detected",
        alertSeverity: "critical",
        alertSource: "antivirus",
      }];
    case "brute-force":
      return [{
        type: "add-alert",
        data: {},
        alertMessage: `SSH brute force: 50 failed attempts from 198.51.100.${Math.floor(Math.random()*254)+1} in last 60 seconds`,
        alertSeverity: "warning",
        alertSource: "ips",
      }];
    case "botnet-cc":
      return [{
        type: "add-alert",
        data: {},
        alertMessage: `Botnet C&C communication detected: 10.0.5.${Math.floor(Math.random()*254)+1} → 185.220.101.${Math.floor(Math.random()*254)+1}`,
        alertSeverity: "critical",
        alertSource: "ips",
      }];
    case "intf-down":
      return [{
        type: "set-interface-status",
        data: { name: "port1", status: "down" },
        alertMessage: "Interface port1 (WAN1) link has gone DOWN",
        alertSeverity: "critical",
        alertSource: "system",
      }];
    case "intf-up":
      return [{
        type: "set-interface-status",
        data: { name: "port1", status: "up" },
        alertMessage: "Interface port1 (WAN1) link is UP",
        alertSeverity: "info",
        alertSource: "system",
      }];
    case "tunnel-flap":
      return [{
        type: "set-tunnel-status",
        data: { name: "Branch-CHI", phase2: "down" },
        alertMessage: "IPsec tunnel Branch-CHI Phase 2 went DOWN",
        alertSeverity: "warning",
        alertSource: "vpn",
      }];
    case "cpu-spike":
      return [{
        type: "set-cpu",
        data: { value: 92 },
        alertMessage: "CPU usage exceeded 90% threshold (92%)",
        alertSeverity: "warning",
        alertSource: "system",
      }];
    case "mem-spike":
      return [{
        type: "set-memory",
        data: { value: 95 },
        alertMessage: "Memory usage critical: 95% — conserve mode may activate",
        alertSeverity: "critical",
        alertSource: "system",
      }];
    case "dhcp-exhaust":
      return [{
        type: "add-alert",
        data: {},
        alertMessage: "DHCP pool on port3 at 95% capacity (238/250 leases used)",
        alertSeverity: "warning",
        alertSource: "system",
      }];
    case "auth-fail":
      return [{
        type: "add-alert",
        data: {},
        alertMessage: `Authentication failure storm: 25 failed LDAP attempts for user 'admin' from 45.33.32.${Math.floor(Math.random()*254)+1}`,
        alertSeverity: "warning",
        alertSource: "system",
      }];
    case "cert-expiry":
      return [{
        type: "add-alert",
        data: {},
        alertMessage: "SSL certificate 'vpn.example.com' expires in 24 hours",
        alertSeverity: "warning",
        alertSource: "system",
      }];
    default:
      return [];
  }
}
