// FortiOS CLI command parser
// Returns string output for each command

import type { FirewallPolicy, NetworkInterface, SimulationEvent } from "./simulationContext";

interface CliContext {
  systemInfo: Record<string, string>;
  cpuUsage: number;
  memoryUsage: number;
  interfaces: NetworkInterface[];
  routes: Array<{ destination: string; gateway: string; interface: string; type: string; distance: number; priority: number }>;
  policies: FirewallPolicy[];
  ipsecTunnels: Array<{ name: string; phase1: string; phase2: string; remote: string; incoming: string; outgoing: string; uptime: string }>;
  dhcpLeases: Array<{ ip: string; mac: string; hostname: string; interface: string; expiry: string; status: string }>;
  currentSessions: number;
  alertLogs: Array<{ time: string; severity: string; message: string }>;
  fortiviewSessions: Array<{ sourceIp: string; destIp: string; protocol: string; destPort: number; application: string; bytes: number }>;
}

interface CliResult {
  output: string;
  mutation?: {
    type: string;
    data: Record<string, unknown>;
  };
}

// Simulated config mode state
let configMode: { section: string; editId?: number; buffer: Record<string, string> } | null = null;

export function resetConfigMode() {
  configMode = null;
}

export function parseCommand(input: string, ctx: CliContext): CliResult {
  const trimmed = input.trim();
  if (!trimmed) return { output: "" };

  // Handle config mode
  if (configMode) {
    return handleConfigMode(trimmed, ctx);
  }

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();

  switch (cmd) {
    case "get":
      return handleGet(parts.slice(1), ctx);
    case "show":
      return handleShow(parts.slice(1), ctx);
    case "diagnose":
      return handleDiagnose(parts.slice(1), ctx);
    case "execute":
      return handleExecute(parts.slice(1));
    case "config":
      return handleConfig(parts.slice(1));
    case "?":
    case "help":
      return { output: `Available commands:
  get         - Get dynamic and system information
  show        - Show configuration
  config      - Enter configuration mode
  execute     - Execute static commands
  diagnose    - Diagnose and debug commands
  exit        - Exit CLI
  ?           - Show this help` };
    case "exit":
      return { output: "Connection closed." };
    default:
      return { output: `Unknown action 0\n\nCommand fail. Return code -2` };
  }
}

function handleGet(parts: string[], ctx: CliContext): CliResult {
  const sub = parts.join(" ").toLowerCase();

  if (sub === "system status") {
    return {
      output: `Version: FortiGate-5001E ${ctx.systemInfo.firmware}
Serial-Number: ${ctx.systemInfo.serialNumber}
Hostname: ${ctx.systemInfo.hostname}
Operation Mode: NAT
Current HA mode: ${ctx.systemInfo.haStatus}, ${ctx.systemInfo.haRole}
Uptime: ${ctx.systemInfo.uptime}
System time: ${new Date().toLocaleString()}
CPU: ${ctx.cpuUsage}%
Memory: ${ctx.memoryUsage}%
Current Sessions: ${ctx.currentSessions}`
    };
  }

  if (sub === "system interface" || sub === "system interface physical") {
    const lines = ctx.interfaces.map(i =>
      `== [ ${i.name} ]\n  alias: ${i.alias}\n  ip: ${i.ip}\n  status: ${i.status}\n  speed: ${i.speed}\n  rx: ${i.rxRate}  tx: ${i.txRate}`
    ).join("\n\n");
    return { output: lines };
  }

  if (sub === "system performance status") {
    return {
      output: `CPU states: ${ctx.cpuUsage}% used
Memory states: ${ctx.memoryUsage}% used
Average network usage: 2.4 Gbps / 10 Gbps
Current Sessions: ${ctx.currentSessions}
Virus caught: 217    Intrusions detected: 3421
Uptime: ${ctx.systemInfo.uptime}`
    };
  }

  if (sub === "router info routing-table all") {
    const header = "Codes: S - static, C - connected, O - OSPF, B - BGP\n";
    const lines = ctx.routes.map(r => {
      const code = r.type === "static" ? "S" : r.type === "connected" ? "C" : r.type === "OSPF" ? "O" : "B";
      return `${code}    ${r.destination} [${r.distance}/${r.priority}] via ${r.gateway}, ${r.interface}`;
    }).join("\n");
    return { output: header + lines };
  }

  if (sub === "vpn ipsec tunnel summary") {
    const lines = ctx.ipsecTunnels.map(t =>
      `${t.name.padEnd(20)} ${t.phase1.padEnd(6)} ${t.phase2.padEnd(6)} ${t.remote.padEnd(18)} ${t.incoming.padEnd(10)} ${t.outgoing}`
    ).join("\n");
    return { output: `Name                 P1     P2     Remote Gateway     In         Out\n${"=".repeat(78)}\n${lines}` };
  }

  if (sub === "system dhcp server") {
    const lines = ctx.dhcpLeases.map(l =>
      `${l.ip.padEnd(16)} ${l.mac.padEnd(20)} ${l.hostname.padEnd(20)} ${l.status}`
    ).join("\n");
    return { output: `IP Address       MAC Address          Hostname             Status\n${"=".repeat(74)}\n${lines}` };
  }

  if (sub === "system session list") {
    return { output: `Total sessions: ${ctx.currentSessions}\n\nUse 'diagnose sys session list' for detailed session table.` };
  }

  return { output: `Unknown action 0\n\nCommand fail. Return code -2` };
}

function handleShow(parts: string[], ctx: CliContext): CliResult {
  const sub = parts.join(" ").toLowerCase();

  if (sub === "firewall policy") {
    const lines = ctx.policies.map(p =>
      `  edit ${p.id}\n    set name "${p.name}"\n    set srcintf "${p.srcintf}"\n    set dstintf "${p.dstintf}"\n    set srcaddr "${p.srcaddr}"\n    set dstaddr "${p.dstaddr}"\n    set service "${p.service}"\n    set action ${p.action}\n    set nat ${p.nat ? "enable" : "disable"}\n    set logtraffic ${p.logTraffic ? "all" : "disable"}\n    set status ${p.status === "enabled" ? "enable" : "disable"}\n  next`
    ).join("\n");
    return { output: `config firewall policy\n${lines}\nend` };
  }

  if (sub === "system interface") {
    const lines = ctx.interfaces.map(i =>
      `  edit "${i.name}"\n    set alias "${i.alias}"\n    set ip ${i.ip}\n    set allowaccess ${(i as NetworkInterface).adminAccess?.join(" ") || "ping"}\n    set status ${i.status}\n  next`
    ).join("\n");
    return { output: `config system interface\n${lines}\nend` };
  }

  if (sub === "full-configuration" || sub === "full") {
    return { output: `# Full configuration is ${ctx.policies.length + ctx.interfaces.length + 50} lines.\n# Use 'show firewall policy' or 'show system interface' for specific sections.` };
  }

  return { output: `Unknown action 0\n\nCommand fail. Return code -2` };
}

function handleDiagnose(parts: string[], ctx: CliContext): CliResult {
  const sub = parts.join(" ").toLowerCase();

  if (sub === "sys session list" || sub === "system session list") {
    const lines = ctx.fortiviewSessions.slice(0, 10).map(s =>
      `session info: proto=${s.protocol} proto_state=01 duration=120 expire=3600\n  src=${s.sourceIp}:${Math.floor(Math.random()*60000+1024)} dst=${s.destIp}:${s.destPort}\n  app=${s.application} bytes=${s.bytes}`
    ).join("\n\n");
    return { output: `session table showing first 10 of ${ctx.currentSessions}:\n\n${lines}` };
  }

  if (sub.startsWith("debug flow")) {
    return {
      output: `id=20085 trace_id=1 func=print_pkt_detail line=5939 msg="vd-root:0 received a packet(proto=6, 10.0.10.55:52134->142.250.80.46:443) tun_id=0.0.0.0 from port3. type=6, code=0, id=0, flag=00000020"
id=20085 trace_id=1 func=init_ip_session_common line=6097 msg="allocate a new session-00127454, tun_id=0.0.0.0"
id=20085 trace_id=1 func=vf_ip_route_input_common line=2621 msg="find a route: flag=04000000 gw-203.0.113.254 via port1"
id=20085 trace_id=1 func=fw_forward_handler line=934 msg="Allowed by Policy-1: LAN-to-Internet"
id=20085 trace_id=1 func=__ip_session_run_ips line=2271 msg="IPS scan started, profile=default"
id=20085 trace_id=1 func=ips_match_rule line=3456 msg="no match found"
id=20085 trace_id=1 func=__ip_session_run_av line=2890 msg="AV scan clean"
id=20085 trace_id=1 func=npu_handle_packet line=1234 msg="SPU offload succeeded"`
    };
  }

  if (sub === "hardware sysinfo memory") {
    return { output: `Total RAM: 32768 MB\nUsed: ${Math.floor(32768 * ctx.memoryUsage / 100)} MB (${ctx.memoryUsage}%)\nFree: ${Math.floor(32768 * (100 - ctx.memoryUsage) / 100)} MB` };
  }

  if (sub === "sys top") {
    return {
      output: `Run Time:  ${ctx.systemInfo.uptime}
CPU:  ${ctx.cpuUsage}%   MEM:  ${ctx.memoryUsage}%

    PID   Name          CPU%   MEM%
      1   init           0.0    0.1
     23   ipsengine     ${Math.floor(ctx.cpuUsage * 0.3)}.0    4.2
     45   wad           ${Math.floor(ctx.cpuUsage * 0.2)}.0    3.8
     67   miglogd        1.0    2.1
     89   httpsd         0.5    1.9`
    };
  }

  return { output: `Unknown action 0\n\nCommand fail. Return code -2` };
}

function handleExecute(parts: string[]): CliResult {
  const sub = parts.join(" ").toLowerCase();

  if (sub.startsWith("ping ")) {
    const target = parts[1] || "8.8.8.8";
    const lines = Array.from({ length: 5 }, (_, i) => {
      const latency = Math.floor(Math.random() * 20 + 1);
      return `${64} bytes from ${target}: icmp_seq=${i} ttl=64 time=${latency}.${Math.floor(Math.random()*9)}ms`;
    }).join("\n");
    return { output: `PING ${target}: 56 data bytes\n${lines}\n\n--- ${target} ping statistics ---\n5 packets transmitted, 5 packets received, 0% packet loss\nround-trip min/avg/max = 2.1/8.4/19.3 ms` };
  }

  if (sub.startsWith("traceroute ")) {
    const target = parts[1] || "8.8.8.8";
    return {
      output: `traceroute to ${target}, 30 hops max, 60 byte packets
 1  203.0.113.254  1.2 ms  0.9 ms  1.1 ms
 2  10.255.0.1     3.4 ms  3.1 ms  3.5 ms
 3  72.14.233.81   8.2 ms  7.9 ms  8.4 ms
 4  142.250.61.149 12.1 ms  11.8 ms  12.3 ms
 5  ${target}      14.5 ms  14.2 ms  14.8 ms`
    };
  }

  if (sub === "reboot") {
    return { output: "This will reboot the system!\nDo you want to continue? (y/n)\n[Simulation: reboot cancelled — this is a training environment]" };
  }

  if (sub === "shutdown") {
    return { output: "This will shut down the system!\n[Simulation: shutdown cancelled — this is a training environment]" };
  }

  return { output: `Unknown action 0\n\nCommand fail. Return code -2` };
}

function handleConfig(parts: string[]): CliResult {
  const sub = parts.join(" ").toLowerCase();
  if (sub === "firewall policy") {
    configMode = { section: "firewall-policy", buffer: {} };
    return { output: "(policy) #" };
  }
  if (sub === "system interface") {
    configMode = { section: "system-interface", buffer: {} };
    return { output: "(interface) #" };
  }
  return { output: `Unknown action 0\n\nCommand fail. Return code -2` };
}

function handleConfigMode(input: string, ctx: CliContext): CliResult {
  if (!configMode) return { output: "" };

  const parts = input.split(/\s+/);
  const cmd = parts[0].toLowerCase();

  if (cmd === "end" || cmd === "abort") {
    const wasEditing = configMode.editId !== undefined;
    const section = configMode.section;
    const editId = configMode.editId;
    const buffer = { ...configMode.buffer };
    configMode = null;

    if (cmd === "end" && wasEditing && section === "firewall-policy") {
      return {
        output: "end",
        mutation: { type: "update-policy", data: { id: editId, ...buffer } }
      };
    }
    return { output: cmd === "abort" ? "Aborted." : "end" };
  }

  if (cmd === "edit") {
    const id = parseInt(parts[1]);
    if (isNaN(id)) return { output: "Invalid ID" };
    configMode.editId = id;
    const existing = ctx.policies.find(p => p.id === id);
    if (existing) {
      return { output: `(${id}) #` };
    }
    return { output: `new entry '${id}' added\n\n(${id}) #` };
  }

  if (cmd === "next") {
    configMode.editId = undefined;
    configMode.buffer = {};
    return { output: `(${configMode.section.split("-")[1]}) #` };
  }

  if (cmd === "set") {
    const key = parts[1];
    const value = parts.slice(2).join(" ").replace(/"/g, "");
    configMode.buffer[key] = value;
    return { output: "" };
  }

  if (cmd === "show") {
    if (configMode.editId) {
      const p = ctx.policies.find(p => p.id === configMode!.editId);
      if (p) {
        return { output: `  set name "${p.name}"\n  set srcintf "${p.srcintf}"\n  set action ${p.action}` };
      }
    }
    return { output: "(no entry selected)" };
  }

  return { output: `Unknown action 0` };
}
