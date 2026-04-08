// FortiOS CLI command parser — Accurate FortiOS 7.6.6 output formats
// Verified against official Fortinet documentation and community sources

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
      return { output: getHelpOutput() };
    case "exit":
      return { output: "Connection closed." };
    default:
      return { output: "Unknown action 0" };
  }
}

function getHelpOutput(): string {
  return `config      -  Set CLI configuration.
get         -  Get dynamic and system information.
show        -  Show CLI configuration.
diagnose    -  Diagnose facility.
execute     -  Execute static commands.
exit        -  Exit the CLI.
?           -  Display this help.`;
}

function handleGet(parts: string[], ctx: CliContext): CliResult {
  const sub = parts.join(" ").toLowerCase();

  if (sub === "system status") {
    // Verified format from Fortinet Community: Technical Tip - Serial Number via CLI
    const now = new Date();
    const timeStr = now.toString().replace(/\s*\(.*\)/, "");
    return {
      output: `Version: FortiGate-5001E v7.6.6,build2636,260401 (GA)
Security Level: 2
Firmware Signature: certified
Virus-DB: 92.04521(2026-04-08 14:19)
Extended DB: 92.04521(2026-04-08 14:19)
AV AI/ML Model: 2.10912(2026-04-07 12:30)
IPS-DB: 24.00531(2026-04-08 10:15)
IPS-ETDB: 24.00531(2026-04-08 10:15)
APP-DB: 24.00531(2026-04-08 10:15)
FMWP-DB: 24.00111(2026-03-15 08:00)
INDUSTRIAL-DB: 24.00531(2026-04-08 10:15)
IPS Malicious URL Database: 4.00312(2026-04-08 12:00)
IoT-Detect: 2.00045(2026-04-06 16:00)
Serial-Number: ${ctx.systemInfo.serialNumber}
BIOS version: 05000024
System Part-Number: P38082-03
Log hard disk: Available
Hostname: ${ctx.systemInfo.hostname}
Private Encryption: Disable
Operation Mode: NAT
Current virtual domain: root
Max number of virtual domains: 500
Virtual domains status: 3 in NAT mode, 0 in TP mode
Virtual domain configuration: multiple
FIPS-CC mode: disable
Current HA mode: a-p, ${ctx.systemInfo.haRole}
Branch point: 2636
Release Version Information: GA
FortiOS x86-64: Yes
System time: ${timeStr}
Last reboot reason: warm reboot
Uptime: ${ctx.systemInfo.uptime}`
    };
  }

  if (sub === "system interface" || sub === "system interface physical") {
    const lines = ctx.interfaces.map(i =>
      `== [ ${i.name} ]
name: ${i.name}        mode: ${i.mode}          ip: ${i.ip}
status: ${i.status}        netbios-forward: disable    type: physical
netflow-sampler: disable    sflow-sampler: disable
src-check: enable        mtu-override: disable     mtu: ${i.mtu}
wccp: disable           drop-overlapped-fragment: disable
drop-fragment: disable   speed: ${i.speed}
alias: "${i.alias}"
role: ${i.zone === "WAN" ? "wan" : i.zone === "DMZ" ? "dmz" : i.zone === "MGMT" ? "undefined" : "lan"}
allowaccess: ${(i as NetworkInterface).adminAccess?.join(" ").toLowerCase() || "ping"}
snmp-index: ${ctx.interfaces.indexOf(i) + 1}`
    ).join("\n\n");
    return { output: lines };
  }

  if (sub === "system performance status") {
    const cpuStates = Array.from({ length: 8 }, () => Math.floor(ctx.cpuUsage * (0.8 + Math.random() * 0.4))).map(v => `${Math.min(100, v)}%`).join(" ");
    return {
      output: `CPU states: ${ctx.cpuUsage}% user ${Math.floor(ctx.cpuUsage * 0.3)}% system 0% nice ${100 - ctx.cpuUsage - Math.floor(ctx.cpuUsage * 0.3)}% idle 0% iowait 0% irq 0% softirq
CPU0 states: ${cpuStates}
Memory: ${Math.floor(32768 * ctx.memoryUsage / 100)}k total, ${Math.floor(32768 * (100 - ctx.memoryUsage) / 100)}k free, ${Math.floor(32768 * 0.08)}k freeable
Average network usage: 2456 / 10000 kbps in 1 minute, 2234 / 10000 kbps in 10 minutes, 1890 / 10000 kbps in 30 minutes
Average sessions: ${ctx.currentSessions}, setup-rate = ${Math.floor(ctx.currentSessions * 0.01)}
Average session duration: 00:02:34
Average setup rate: ${Math.floor(ctx.currentSessions * 0.01)} sessions/s
Virus caught: 217    Intrusions detected: 3421
Uptime: ${ctx.systemInfo.uptime}`
    };
  }

  if (sub === "router info routing-table all") {
    const header = `Codes: K - kernel, C - connected, S - static, R - RIP, O - OSPF,
       B - BGP, i - IS-IS, e - EGBP, > - selected route, * - FIB route

Routing table for VRF=0
`;
    const lines = ctx.routes.map(r => {
      const code = r.type === "static" ? "S" : r.type === "connected" ? "C" : r.type === "OSPF" ? "O" : r.type === "BGP" ? "B" : "S";
      const selected = ">*";
      if (r.type === "connected") {
        return `${code}${selected}  ${r.destination} is directly connected, ${r.interface}`;
      }
      return `${code}${selected}  ${r.destination} [${r.distance}/${r.priority}] via ${r.gateway}, ${r.interface}`;
    }).join("\n");
    return { output: header + lines };
  }

  if (sub === "vpn ipsec tunnel summary") {
    const header = `'---------- Name ----------', 'Phase1', 'Phase2', '---------- Remote Gateway ----------', '---------- Incoming Data ----------', '---------- Outgoing Data ----------'\n`;
    const lines = ctx.ipsecTunnels.map(t =>
      `'${t.name}'${" ".repeat(Math.max(1, 28 - t.name.length - 2))} '${t.phase1}'${" ".repeat(4)} '${t.phase2}'${" ".repeat(4)} '${t.remote}'${" ".repeat(Math.max(1, 36 - t.remote.length - 2))} '${t.incoming}'${" ".repeat(Math.max(1, 36 - t.incoming.length - 2))} '${t.outgoing}'`
    ).join("\n");
    return { output: header + lines };
  }

  if (sub === "system dhcp server") {
    const lines = ctx.dhcpLeases.map(l =>
      `IP Address       MAC Address          Hostname             Expiry              Interface  Status
${l.ip.padEnd(16)} ${l.mac.padEnd(20)} ${l.hostname.padEnd(20)} ${l.expiry.padEnd(20)} ${l.interface.padEnd(10)} ${l.status}`
    );
    return { output: `DHCP server lease table:\n\n${lines.join("\n")}` };
  }

  if (sub === "system session list") {
    return { output: `Total sessions: ${ctx.currentSessions}\n\nUse 'diagnose sys session list' for detailed session table.` };
  }

  if (sub === "system ha status") {
    return {
      output: `HA Health Status: OK
Model: FortiGate-5001E
Mode: HA A-P
Group: 0
Debug: 0
Cluster Uptime: ${ctx.systemInfo.uptime}
Cluster state change time: 2026-01-15 03:22:14
Master selected using:
  <2026/01/15 03:22:14> FGT5H1E5110004321 is selected as the master because it has the largest value of uptime.
  <2026/01/15 03:22:14> FGT5H1E5110004322 is selected as the slave.
ses_pickup: enable, ses_pickup_delay=enable
override: disable
Configuration Status:
  ${ctx.systemInfo.serialNumber} (updated 1 seconds ago): in-sync
  FGT5H1E5110004322 (updated 1 seconds ago): in-sync
System Usage stats:
  ${ctx.systemInfo.serialNumber} (master): ses_used=${ctx.currentSessions} cpu=${ctx.cpuUsage}% mem=${ctx.memoryUsage}%
  FGT5H1E5110004322 (slave):  ses_used=0 cpu=8% mem=42%`
    };
  }

  return { output: `command parse error before '${parts[parts.length - 1] || "<newline>"}'` };
}

function handleShow(parts: string[], ctx: CliContext): CliResult {
  const sub = parts.join(" ").toLowerCase();

  if (sub === "firewall policy") {
    const lines = ctx.policies.map(p => {
      let block = `    edit ${p.id}
        set name "${p.name}"
        set uuid ${crypto.randomUUID?.() || `${p.id}a1b2c3d4-e5f6-7890-abcd-ef1234567890`}
        set srcintf "${p.srcintf}"
        set dstintf "${p.dstintf}"
        set srcaddr "${p.srcaddr}"
        set dstaddr "${p.dstaddr}"
        set action ${p.action}
        set schedule "${p.schedule}"
        set service "${p.service}"
        set nat ${p.nat ? "enable" : "disable"}
        set logtraffic ${p.logTraffic ? "all" : "disable"}
        set status ${p.status === "enabled" ? "enable" : "disable"}`;
      if (p.utmProfiles.av !== "none") block += `\n        set av-profile "${p.utmProfiles.av}"`;
      if (p.utmProfiles.ips !== "none") block += `\n        set ips-sensor "${p.utmProfiles.ips}"`;
      if (p.utmProfiles.webFilter !== "none") block += `\n        set webfilter-profile "${p.utmProfiles.webFilter}"`;
      if (p.utmProfiles.appControl !== "none") block += `\n        set application-list "${p.utmProfiles.appControl}"`;
      block += `\n    next`;
      return block;
    }).join("\n");
    return { output: `config firewall policy\n${lines}\nend` };
  }

  if (sub === "system interface") {
    const lines = ctx.interfaces.map(i =>
      `    edit "${i.name}"
        set vdom "root"
        set ip ${i.ip}
        set allowaccess ${(i as NetworkInterface).adminAccess?.join(" ").toLowerCase() || "ping"}
        set type physical
        set alias "${i.alias}"
        set role ${i.zone === "WAN" ? "wan" : i.zone === "DMZ" ? "dmz" : i.zone === "MGMT" ? "undefined" : "lan"}
        set snmp-index ${ctx.interfaces.indexOf(i) + 1}
        set mtu-override ${i.mtu !== 1500 ? "enable" : "disable"}
        ${i.mtu !== 1500 ? `set mtu ${i.mtu}` : ""}
    next`
    ).join("\n");
    return { output: `config system interface\n${lines}\nend` };
  }

  if (sub === "full-configuration" || sub === "full") {
    return { output: `#config-version=${ctx.systemInfo.firmware.replace("FortiOS ", "")}-FW-build2636-260401:opmode=1:vdom=1:user=admin
#conf_file_ver=38274526123
#buildno=2636
#global_vdom=1
# Full configuration is ${ctx.policies.length + ctx.interfaces.length + 250} lines.
# Use 'show firewall policy' or 'show system interface' for specific sections.` };
  }

  return { output: `command parse error before '${parts[parts.length - 1] || "<newline>"}'` };
}

function handleDiagnose(parts: string[], ctx: CliContext): CliResult {
  const sub = parts.join(" ").toLowerCase();

  if (sub === "sys session list" || sub === "system session list") {
    // Verified format from Fortinet Community session list discussion
    const protoMap: Record<string, number> = { "TCP": 6, "UDP": 17, "ICMP": 1 };
    const lines = ctx.fortiviewSessions.slice(0, 5).map((s, i) => {
      const proto = protoMap[s.protocol] || 6;
      const srcPort = Math.floor(Math.random() * 60000 + 1024);
      const duration = Math.floor(Math.random() * 3600);
      const expire = 3600 - (duration % 3600);
      const orgBytes = Math.floor(s.bytes * 0.4);
      const replyBytes = Math.floor(s.bytes * 0.6);
      const orgPkts = Math.floor(orgBytes / 1400);
      const replyPkts = Math.floor(replyBytes / 1400);
      return `session info: proto=${proto} proto_state=${proto === 6 ? "01" : "00"} duration=${duration} expire=${expire} timeout=3600 flags=00000000 sockflag=00000000 sockport=0 av_idx=0 use=4
origin-shaper=
reply-shaper=
per_ip_shaper=
class_id=0 ha_id=0 policy_dir=0 tunnel=/ vlan_cos=0/255
state=log ${proto === 6 ? "may_dirty" : "none"} f00
statistic(bytes/packets/allow_err): org=${orgBytes}/${orgPkts}/1 reply=${replyBytes}/${replyPkts}/1 tuples=2
tx speed(Bps/kbps): ${Math.floor(orgBytes / Math.max(1, duration))}/${Math.floor(orgBytes / Math.max(1, duration) * 8 / 1000)} rx speed(Bps/kbps): ${Math.floor(replyBytes / Math.max(1, duration))}/${Math.floor(replyBytes / Math.max(1, duration) * 8 / 1000)}
orgin->sink: org pre->post, reply pre->post dev=${Math.floor(Math.random() * 10) + 30}->${Math.floor(Math.random() * 10) + 40}/${Math.floor(Math.random() * 10) + 40}->${Math.floor(Math.random() * 10) + 30} gwy=${s.destIp}/0.0.0.0
hook=pre dir=org act=noop ${s.sourceIp}:${srcPort}->${s.destIp}:${s.destPort}(${s.destIp}:${s.destPort})
hook=post dir=reply act=noop ${s.destIp}:${s.destPort}->${s.sourceIp}:${srcPort}(${s.sourceIp}:${srcPort})
pos/(before,after) 0/(0,0), 0/(0,0)
misc=0 policy_id=${Math.floor(Math.random() * 7) + 1} auth_info=0 chk_client_info=0 vd=0
serial=${(0x01000000 + i * 0x1234).toString(16).padStart(8, "0")} tos=ff/ff app_list=0 app=0 url_cat=0
rpdb_link_id = 00000000
dd_type=0 dd_mode=0
npu_state=0x100000 no_offload
no_ofld_reason: iterate-check`;
    }).join("\n\n");
    return { output: `${lines}\ntotal session ${ctx.currentSessions}` };
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
id=20085 trace_id=1 func=__ip_session_run_app_ctrl line=3120 msg="app detected: SSL (id=40568, cat=26)"
id=20085 trace_id=1 func=ip_session_confirm_final line=3890 msg="npu_flag=0x0, iterate-check"
id=20085 trace_id=1 func=npu_handle_packet line=1234 msg="SPU offload succeeded, roles: client=0x02 server=0x04"`
    };
  }

  if (sub === "hardware sysinfo memory") {
    const totalKB = 32768 * 1024;
    const usedKB = Math.floor(totalKB * ctx.memoryUsage / 100);
    return {
      output: `        total(KB)    used(KB)    free(KB)    freeable(KB)
Mem:    ${totalKB}    ${usedKB}    ${totalKB - usedKB}    ${Math.floor(totalKB * 0.08)}
Swap:   0            0           0`
    };
  }

  if (sub === "sys top" || sub === "system top") {
    return {
      output: `Run Time:  ${ctx.systemInfo.uptime}
10U, 0N, 5S, 85I, 0WA, 0HI, 0SI, 0ST; ${ctx.currentSessions} sessions
         ${ctx.cpuUsage}% CPU;  ${ctx.memoryUsage}% MEM

    PID     RSS    CPU%   MEM%    FDS     Name
      1       4M   0.0    0.1      8     init
     23    ${Math.floor(ctx.cpuUsage * 0.3 * 10)}M  ${(ctx.cpuUsage * 0.3).toFixed(1)}    4.2    128     ipsengine
     45    ${Math.floor(ctx.cpuUsage * 0.2 * 10)}M  ${(ctx.cpuUsage * 0.2).toFixed(1)}    3.8     96     wad
     67      12M   1.0    2.1     64     miglogd
     89       8M   0.5    1.9     48     httpsd
    112       6M   0.3    1.2     32     cmdbsvr
    134       4M   0.1    0.8     16     sslvpnd
    156      16M   0.8    2.4     72     scanunitd`
    };
  }

  if (sub === "sys ha status" || sub === "system ha status") {
    return handleGet(["system", "ha", "status"], ctx);
  }

  if (sub.startsWith("sniffer packet")) {
    return {
      output: `interfaces=[any]
filters=[none]
0.000000 10.0.10.55.52134 -> 142.250.80.46.443: syn 1234567890
0.001234 142.250.80.46.443 -> 10.0.10.55.52134: syn, ack 987654321
0.001456 10.0.10.55.52134 -> 142.250.80.46.443: ack 1234567891
3 packets received by filter
0 packets dropped by kernel`
    };
  }

  return { output: "Unknown action 0" };
}

function handleExecute(parts: string[]): CliResult {
  const sub = parts.join(" ").toLowerCase();

  if (sub.startsWith("ping ")) {
    const target = parts[1] || "8.8.8.8";
    // Verified FortiOS ping output format
    const pings = Array.from({ length: 5 }, (_, i) => {
      const latency = (Math.random() * 18 + 1).toFixed(1);
      return `64 bytes from ${target}: icmp_seq=${i} ttl=116 time=${latency} ms`;
    });
    const times = pings.map(p => parseFloat(p.match(/time=(\d+\.\d+)/)?.[1] || "0"));
    const min = Math.min(...times).toFixed(1);
    const max = Math.max(...times).toFixed(1);
    const avg = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1);
    return {
      output: `PING ${target} (${target}): 56 data bytes
${pings.join("\n")}

--- ${target} ping statistics ---
5 packets transmitted, 5 packets received, 0% packet loss
round-trip min/avg/max = ${min}/${avg}/${max} ms`
    };
  }

  if (sub.startsWith("traceroute ")) {
    const target = parts[1] || "8.8.8.8";
    // Verified FortiOS traceroute format
    return {
      output: `traceroute to ${target} (${target}), 30 hops max, 84 byte packets
 1  203.0.113.254 (203.0.113.254)  0.756 ms  0.621 ms  0.503 ms
 2  10.255.0.1 (10.255.0.1)  3.421 ms  3.109 ms  3.512 ms
 3  72.14.233.81 (72.14.233.81)  8.234 ms  7.912 ms  8.401 ms
 4  142.250.61.149 (142.250.61.149)  12.123 ms  11.845 ms  12.334 ms
 5  ${target} (${target})  14.521 ms  14.234 ms  14.812 ms`
    };
  }

  if (sub === "reboot") {
    return { output: "This will reboot the system and interrupt the current session!\nDo you want to continue? (y/n)\n[Simulation: reboot cancelled — this is a training environment]" };
  }

  if (sub === "shutdown") {
    return { output: "This will shut down the system!\nDo you want to continue? (y/n)\n[Simulation: shutdown cancelled — this is a training environment]" };
  }

  if (sub === "factoryreset") {
    return { output: "This will erase the current configuration and revert to factory defaults!\n[Simulation: factory reset cancelled — this is a training environment]" };
  }

  if (sub === "date") {
    const now = new Date();
    return { output: `current date is: ${now.toISOString().split("T")[0]}\ncurrent time is: ${now.toTimeString().split(" ")[0]}\nlast NTP sync:${now.toISOString().split("T")[0]} ${now.toTimeString().split(" ")[0]}` };
  }

  if (sub.startsWith("log filter")) {
    return { output: "Log filter is set." };
  }

  if (sub === "log display") {
    return { output: "10 logs found.\nUse 'execute log filter' to set display filters." };
  }

  return { output: "Unknown action 0" };
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
  if (sub === "firewall address") {
    configMode = { section: "firewall-address", buffer: {} };
    return { output: "(address) #" };
  }
  if (sub === "system global") {
    configMode = { section: "system-global", buffer: {} };
    return { output: "(global) #" };
  }
  if (sub === "system dns") {
    configMode = { section: "system-dns", buffer: {} };
    return { output: "(dns) #" };
  }
  if (sub === "vpn ipsec phase1-interface") {
    configMode = { section: "vpn-phase1", buffer: {} };
    return { output: "(phase1-interface) #" };
  }
  if (sub === "vpn ipsec phase2-interface") {
    configMode = { section: "vpn-phase2", buffer: {} };
    return { output: "(phase2-interface) #" };
  }
  return { output: `command parse error before '${parts[parts.length - 1] || "<newline>"}'` };
}

function handleConfigMode(input: string, ctx: CliContext): CliResult {
  if (!configMode) return { output: "" };

  const parts = input.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const sectionLabel = configMode.section.split("-").pop() || "config";

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
    if (isNaN(id)) return { output: `value parse error before '${parts[1] || "<newline>"}'` };
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
    return { output: `(${sectionLabel}) #` };
  }

  if (cmd === "set") {
    const key = parts[1];
    const value = parts.slice(2).join(" ").replace(/"/g, "");
    if (!key) return { output: `command parse error before '<newline>'` };
    configMode.buffer[key] = value;
    return { output: "" };
  }

  if (cmd === "unset") {
    const key = parts[1];
    if (!key) return { output: `command parse error before '<newline>'` };
    delete configMode.buffer[key];
    return { output: "" };
  }

  if (cmd === "show") {
    if (configMode.editId) {
      const p = ctx.policies.find(p => p.id === configMode!.editId);
      if (p) {
        return {
          output: `config firewall policy
    edit ${p.id}
        set name "${p.name}"
        set srcintf "${p.srcintf}"
        set dstintf "${p.dstintf}"
        set srcaddr "${p.srcaddr}"
        set dstaddr "${p.dstaddr}"
        set action ${p.action}
        set schedule "${p.schedule}"
        set service "${p.service}"
        set nat ${p.nat ? "enable" : "disable"}
        set logtraffic ${p.logTraffic ? "all" : "disable"}
        set status ${p.status === "enabled" ? "enable" : "disable"}
    next
end`
        };
      }
    }
    return { output: "(no entry selected)" };
  }

  if (cmd === "get") {
    if (configMode.editId) {
      const p = ctx.policies.find(p => p.id === configMode!.editId);
      if (p) {
        return {
          output: `name                : ${p.name}
srcintf             : "${p.srcintf}"
dstintf             : "${p.dstintf}"
srcaddr             : "${p.srcaddr}"
dstaddr             : "${p.dstaddr}"
action              : ${p.action}
schedule            : "${p.schedule}"
service             : "${p.service}"
nat                 : ${p.nat ? "enable" : "disable"}
logtraffic          : ${p.logTraffic ? "all" : "disable"}
status              : ${p.status === "enabled" ? "enable" : "disable"}`
        };
      }
    }
    return { output: "(no entry selected)" };
  }

  if (cmd === "delete") {
    const id = parseInt(parts[1]);
    if (isNaN(id)) return { output: `value parse error before '${parts[1] || "<newline>"}'` };
    return {
      output: "",
      mutation: { type: "delete-policy", data: { id } }
    };
  }

  return { output: "Unknown action 0" };
}
