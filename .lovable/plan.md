
# FortiGate Training Simulation — Factual Accuracy Reference & Implementation Plan

## Sources Researched

### Official Documentation (Primary)
| Source | URL | Use |
|--------|-----|-----|
| FortiOS 7.6.6 CLI Reference | https://docs.fortinet.com/document/fortigate/7.6.6/cli-reference/25620 | Exact CLI command syntax & output format |
| FortiOS 7.6.6 Admin Guide — Dashboard Widgets | https://docs.fortinet.com/document/fortigate/7.6.6/administration-guide/882981/dashboard-widgets | Widget list, fields, layout |
| FortiOS 7.6.6 Admin Guide — Using Widgets | https://docs.fortinet.com/document/fortigate/7.6.6/administration-guide/925717/using-widgets | Widget customization, add/remove |
| FortiOS 7.6.6 Admin Guide — Firewall Policy | https://docs.fortinet.com/document/fortigate/7.6.6/administration-guide/826586/configuring-a-firewall-policy | Policy form fields, ordering |
| FortiOS 7.6.6 CLI Reference — execute ping-options | https://docs.fortinet.com/document/fortigate/7.6.6/cli-reference/221756471/execute-ping-options | Ping CLI options |
| FortiOS 7.6.6 CLI Reference — CLI config commands | https://docs.fortinet.com/document/fortigate/7.6.6/cli-reference/708841/cli-configuration-commands | Config mode syntax |

### Community & Blog (Validation)
| Source | URL | Use |
|--------|-----|-----|
| Fortinet Community — Serial Number via CLI | https://community.fortinet.com/t5/FortiGate/Technical-Tip-How-to-get-the-serial-number-via-CLI-and-GUI/ta-p/360003 | Exact `get system status` output |
| Fortinet Community — diagnose sys session list | https://community.fortinet.com/t5/Support-Forum/Trying-to-have-a-better-understanding-of-diagnose-sys-session/td-p/55414 | Session list output format & field meanings |
| TechExpress — FortiGate Step-by-Step | https://techexpress.ca/fortigate-firewall-step-by-step-guide-configuring-network-interface-service-and-policy/ | GUI walkthrough for interfaces & policies |
| Fortinet Community — PING options | https://community.fortinet.com/t5/FortiGate/Troubleshooting-Tip-Using-PING-options-from-the-FortiGate-CLI/ta-p/190774 | Ping output format |

### Training & Certification (Lab Structure)
| Source | URL | Use |
|--------|-----|-----|
| Fortinet NSE 4 Training — FortiGate Security | https://training.fortinet.com/local/staticpage/view.php?page=library_fortigate-security | Official lab topics & structure |
| NSE 4 Lab Guide (Scribd) | https://www.scribd.com/document/767801293/NSE-4-Lab-Guide | 64-page lab guide with exercises |
| CBT Nuggets — NSE 4 | https://www.cbtnuggets.com/it-training/fortinet-training/nse-4 | Lab scenarios and approach |
| 7Eyes Technology — NSE4 Course PDF | https://www.7eyestechnology.com/uploads/lms/course_pdf/1760438458-Fortinet-FortiGate-Firewall-NSE4%20(1).pdf | Lesson plan structure |

### Video References
| Source | URL | Use |
|--------|-----|-----|
| FortiGate Dashboard Walkthrough | https://www.youtube.com/watch?v=a7hhluPGS90 | Visual layout reference |
| FortiGate LAN to WAN Policy | https://www.youtube.com/watch?v=_FogSgl8mkk | Step-by-step policy creation |

---

## Critical Factual Corrections Needed

### 1. `get system status` Output (VERIFIED from Fortinet Community)

The **exact** output format from a real FortiGate-100E v7.2.9:

```
Version: FortiGate-100E v7.2.9,build1688,240813 (GA.M)
Security Level: 2
Firmware Signature: certified
Virus-DB: 1.00000(2018-04-09 18:07)
Extended DB: 1.00000(2018-04-09 18:07)
AV AI/ML Model: 0.00000(2001-01-01 00:00)
IPS-DB: 6.00741(2015-12-01 02:30)
IPS-ETDB: 6.00741(2015-12-01 02:30)
APP-DB: 29.00908(2024-11-21 03:53)
FMWP-DB: 24.00111(2024-11-06 13:21)
INDUSTRIAL-DB: 6.00741(2015-12-01 02:30)
IPS Malicious URL Database: 1.00001(2015-01-01 01:01)
IoT-Detect: 0.00000(2022-08-17 17:31)
Serial-Number: FG100EXXXXXXXXXX
BIOS version: 05000006
System Part-Number: P19082-03
Log hard disk: Not available
Hostname: FGT
Private Encryption: Disable
Operation Mode: NAT
Current virtual domain: root
Max number of virtual domains: 10
Virtual domains status: 1 in NAT mode, 0 in TP mode
Virtual domain configuration: disable
FIPS-CC mode: disable
Current HA mode: standalone
Branch point: 1688
Release Version Information: GA
FortiOS x86-64: Yes
System time: Mon Nov 25 20:08:29 2024
Last reboot reason: power cycle
```

**Action**: Update `cliParser.ts` `get system status` handler to match this exact format for our simulated FG-5001E v7.6.6.

### 2. `diagnose sys session list` Output (VERIFIED from Fortinet Community)

Real format per session entry:
```
session info: proto=6 proto_state=01 duration=83 expire=3576 timeout=3600 flags=00000000 sockflag=00000000 sockport=0 av_idx=0 use=4
origin-shaper=
reply-shaper=
per_ip_shaper=
class_id=0 ha_id=1 policy_dir=0 tunnel=/ vlan_cos=0/7
state=log may_dirty f00
statistic(bytes/packets/allow_err): org=3969/32/1 reply=16481/45/1 tuples=2
tx speed(Bps/kbps): 0/0 rx speed(Bps/kbps): 1/0
orgin->sink: org pre->post, reply pre->post dev=37->41/41->37 gwy=172.16.40.19/0.0.0.0
hook=pre dir=org act=dnat 81.63.141.211:53466->191.2.16.148:443(172.16.40.19:443)
hook=post dir=reply act=snat 172.16.40.19:443->81.63.141.211:53466(191.2.16.148:443)
pos/(before,after) 0/(0,0), 0/(0,0)
misc=0 policy_id=7 auth_info=0 chk_client_info=0 vd=2
serial=01e45821 tos=ff/ff app_list=0 app=0 url_cat=0
total session 4
```

**Key fields**: `proto` (6=TCP, 17=UDP, 1=ICMP), `proto_state` (first digit=original direction, second=reply), `policy_id`, `hook` lines showing SNAT/DNAT.

**Action**: Update the `diagnose sys session list` handler to produce this exact multi-line format per session.

### 3. `execute ping` Output Format

Real FortiOS ping output:
```
PING 8.8.8.8 (8.8.8.8): 56 data bytes
64 bytes from 8.8.8.8: icmp_seq=0 ttl=116 time=1.4 ms
64 bytes from 8.8.8.8: icmp_seq=1 ttl=116 time=1.3 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=116 time=1.2 ms
64 bytes from 8.8.8.8: icmp_seq=3 ttl=116 time=1.4 ms
64 bytes from 8.8.8.8: icmp_seq=4 ttl=116 time=1.3 ms

--- 8.8.8.8 ping statistics ---
5 packets transmitted, 5 packets received, 0% packet loss
round-trip min/avg/max = 1.2/1.3/1.4 ms
```

**Action**: Update ping handler to match this exact format (note: FortiOS uses `icmp_seq` not `seq`, shows `time=X.X ms`, summary with `round-trip min/avg/max`).

### 4. `execute traceroute` Output Format

```
traceroute to 8.8.8.8 (8.8.8.8), 30 hops max, 84 byte packets
 1  192.168.1.1 (192.168.1.1)  0.756 ms  0.621 ms  0.503 ms
 2  10.0.0.1 (10.0.0.1)  1.234 ms  1.109 ms  0.987 ms
 3  * * *
 4  8.8.8.8 (8.8.8.8)  4.321 ms  4.210 ms  4.098 ms
```

### 5. Error Messages — Must Match FortiOS Exactly

| Scenario | Real FortiOS Error |
|----------|-------------------|
| Unknown command | `Unknown action 0` |
| Wrong subcommand | `Command fail. Return code -61` |
| Config mode prompt | `(policy)#` not just `#` |
| Incomplete command | `command parse error before '<newline>'` |
| Invalid argument | `value parse error before 'xxx'` |
| Help request (`?`) | Lists available commands with descriptions |

### 6. CLI Prompt Format

Real FortiOS prompts:
- Global: `FortiGate-5001E #`
- In VDOM: `FortiGate-5001E (root) #`
- Config mode: `FortiGate-5001E (policy) #`
- Nested config: `FortiGate-5001E (1) #` (after `edit 1`)

### 7. Dashboard Widget Names (FortiOS 7.6.6 Official)

The exact widget names from the admin guide:
- **System Information** — Hostname, Serial Number, Firmware, System Time, Operation Mode, HA Status, VDOM mode
- **License Information** — FortiCare Support, FortiGuard services status (each with expiry)
- **FortiGuard Information** — Update server, AV/IPS/App DB versions with timestamps
- **System Resources** — CPU, Memory, Sessions (gauges + mini line charts)
- **Security Fabric** — Fabric topology visualization
- **Alert Message Console** — Real-time log messages with severity
- **CLI Console** — Embedded CLI terminal
- **Top Sessions** — Active sessions by bandwidth
- **Administrators** — Currently logged-in admins
- **Sensor Information** — Hardware sensor data (temperature, voltage, fan)
- **Log Rate** — Events per second
- **Interface Bandwidth** — Per-interface traffic

### 8. Firewall Policy Fields (FortiOS 7.6.6 Admin Guide)

The policy configuration form in FortiOS 7.6.6 has these exact fields:
- **Name** (text, required in 7.6)
- **Incoming Interface** (dropdown, multi-select)
- **Outgoing Interface** (dropdown, multi-select)
- **Source** (address objects + user/groups, multi-select)
- **Destination** (address objects, multi-select)
- **Service** (service objects, multi-select)
- **Schedule** (always / specific)
- **Action** (ACCEPT / DENY / IPSEC / SSL-VPN)
- **NAT** (toggle + IP Pool options)
- **Security Profiles** section:
  - AntiVirus (profile dropdown)
  - Web Filter (profile dropdown)
  - DNS Filter (profile dropdown)
  - Application Control (profile dropdown)
  - IPS (profile dropdown)
  - File Filter (profile dropdown)
  - Email Filter (profile dropdown)
  - DLP (sensor dropdown)
  - VOIP (profile dropdown)
  - ICAP (profile dropdown)
  - SSL Inspection (profile dropdown)
- **Logging Options**: Log Allowed Traffic (All Sessions / Security Events / Disable), Log Violation Traffic (enable/disable)
- **Enable this policy** toggle
- **Comments** text area

### 9. NSE 4 Lab Structure (Verified from Official Training)

The Fortinet NSE 4 course (FortiGate Security + Infrastructure) has these lab topics:

**FortiGate Security (NSE 4.1):**
1. System and Network Settings
2. Firewall Policies
3. Network Address Translation (NAT)
4. Firewall Authentication
5. Logging and Monitoring
6. Certificate Operations
7. Web Filtering
8. Application Control
9. Antivirus
10. Intrusion Prevention
11. SSL VPN

**FortiGate Infrastructure (NSE 4.2):**
1. Routing
2. SD-WAN
3. Security Fabric
4. High Availability
5. Diagnostics

**Action**: Align our 10 labs to mirror NSE 4 topics for training credibility.

---

## Implementation Priorities for Accuracy

### Phase A: Fix CLI Output Accuracy (cliParser.ts)
1. ✅ Fix `get system status` to match verified output format
2. ✅ Fix `diagnose sys session list` to match real multi-line format
3. ✅ Fix `execute ping` output format (`icmp_seq`, `round-trip min/avg/max`)
4. ✅ Add `execute traceroute` with real format
5. ✅ Fix error messages (`Unknown action 0`, `command parse error`, etc.)
6. ✅ Fix CLI prompt to show config mode context (e.g., `(policy)#`)
7. ✅ Add `diagnose debug flow` with realistic packet trace output
8. ✅ Add `get system interface` with proper table format
9. ✅ Add `show firewall policy` in `config` block format
10. ✅ Add `get router info routing-table all` with real format

### Phase B: Fix Dashboard Widget Accuracy
1. Match exact widget names from FortiOS 7.6.6
2. System Information widget must show: Hostname, Serial Number, Firmware Version, System Time, Operation Mode, HA Status
3. License widget must show FortiCare + FortiGuard service rows with Valid/Expired status and dates
4. FortiGuard widget must show AV/IPS/App DB version numbers with update timestamps

### Phase C: Fix Policy Editor Fields
1. Match the exact field list from FortiOS 7.6.6 (see section 8 above)
2. Ensure Security Profiles section has all 11 UTM profile types
3. Use proper FortiOS field labels (not generic names)

### Phase D: Align Labs with NSE 4 Curriculum
1. Rename/restructure labs to mirror NSE 4 topics
2. Ensure lab instructions use correct FortiOS terminology
3. Validate that all CLI commands in labs produce accurate output
