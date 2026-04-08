import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import * as mockData from "@/data/mockData";

// Types for mutable state
export interface FirewallPolicy {
  id: number;
  name: string;
  srcintf: string;
  dstintf: string;
  srcaddr: string;
  dstaddr: string;
  service: string;
  action: "accept" | "deny" | "ipsec";
  nat: boolean;
  logTraffic: boolean;
  schedule: string;
  status: "enabled" | "disabled";
  utmProfiles: {
    av: string;
    ips: string;
    webFilter: string;
    appControl: string;
    dnsFilter: string;
    fileFilter: string;
    emailFilter: string;
    dlp: string;
    voip: string;
    icap: string;
    sslInspection: string;
  };
  hitCount: number;
}

export interface NetworkInterface {
  name: string;
  alias: string;
  ip: string;
  status: "up" | "down";
  speed: string;
  rxRate: string;
  txRate: string;
  rxBytes: string;
  txBytes: string;
  mode: "static" | "dhcp" | "pppoe";
  mtu: number;
  vlanId?: number;
  zone: string;
  adminAccess: string[];
}

export interface AddressObject {
  id: string;
  name: string;
  type: "subnet" | "iprange" | "fqdn" | "geography" | "wildcard";
  value: string;
  interface: string;
  comment: string;
}

export interface SimulationEvent {
  id: string;
  type: string;
  timestamp: string;
  data: Record<string, unknown>;
}

interface SimulationState {
  // System
  systemInfo: typeof mockData.systemInfo;
  cpuUsage: number;
  memoryUsage: number;
  licenses: typeof mockData.licenses;
  fortiGuardInfo: typeof mockData.fortiGuardInfo;
  adminUsers: typeof mockData.adminUsers;
  virtualDomains: typeof mockData.virtualDomains;
  fabricDevices: typeof mockData.fabricDevices;
  
  // Network
  interfaces: NetworkInterface[];
  routes: typeof mockData.routes;
  dhcpLeases: typeof mockData.dhcpLeases;
  ipsecTunnels: typeof mockData.ipsecTunnels;
  bandwidthData: typeof mockData.bandwidthData;
  sessionData: typeof mockData.sessionData;
  currentSessions: number;
  
  // Security
  alertLogs: typeof mockData.alertLogs;
  topThreats: typeof mockData.topThreats;
  compromisedHosts: typeof mockData.compromisedHosts;
  ipsSignatures: typeof mockData.ipsSignatures;
  webFilterCategories: typeof mockData.webFilterCategories;
  sandboxStats: typeof mockData.sandboxStats;
  avThreats: typeof mockData.avThreats;
  
  // Firewall
  policies: FirewallPolicy[];
  addressObjects: AddressObject[];
  
  // Users
  activeUsers: typeof mockData.activeUsers;
  firewallUsers: typeof mockData.firewallUsers;
  deviceInventory: typeof mockData.deviceInventory;
  
  // WiFi
  fortiApDevices: typeof mockData.fortiApDevices;
  wifiClients: typeof mockData.wifiClients;
  
  // VPN
  sslVpnSessions: typeof mockData.sslVpnSessions;
  sslVpnMonitorSessions: typeof mockData.sslVpnMonitorSessions;
  vpnTrafficData: typeof mockData.vpnTrafficData;
  
  // FortiView
  fortiviewSessions: typeof mockData.fortiviewSessions;
  fortiviewSources: typeof mockData.fortiviewSources;
  fortiviewDestinations: typeof mockData.fortiviewDestinations;
  fortiviewApplications: typeof mockData.fortiviewApplications;
  fortiviewThreats: typeof mockData.fortiviewThreats;
  fortiviewVpn: typeof mockData.fortiviewVpn;
  firewallSourceObjects: typeof mockData.firewallSourceObjects;
  firewallDestObjects: typeof mockData.firewallDestObjects;
  topWebsites: typeof mockData.topWebsites;
  cloudApplications: typeof mockData.cloudApplications;
  
  // Events
  eventLog: SimulationEvent[];
}

interface SimulationContextType {
  state: SimulationState;
  // Mutations
  updateCpu: (val: number) => void;
  updateMemory: (val: number) => void;
  addAlert: (alert: typeof mockData.alertLogs[0]) => void;
  setPolicies: (policies: FirewallPolicy[]) => void;
  addPolicy: (policy: FirewallPolicy) => void;
  updatePolicy: (id: number, updates: Partial<FirewallPolicy>) => void;
  deletePolicy: (id: number) => void;
  reorderPolicies: (policies: FirewallPolicy[]) => void;
  setInterfaces: (ifaces: NetworkInterface[]) => void;
  updateInterface: (name: string, updates: Partial<NetworkInterface>) => void;
  addAddressObject: (obj: AddressObject) => void;
  updateAddressObject: (id: string, updates: Partial<AddressObject>) => void;
  deleteAddressObject: (id: string) => void;
  setAddressObjects: (objs: AddressObject[]) => void;
  injectEvent: (event: SimulationEvent) => void;
  setInterfaceStatus: (name: string, status: "up" | "down") => void;
  setTunnelStatus: (name: string, phase2: "up" | "down") => void;
  addCompromisedHost: (host: typeof mockData.compromisedHosts[0]) => void;
  resetState: () => void;
  // CLI tracking
  cliHistory: string[];
  addCliCommand: (cmd: string) => void;
}

const defaultPolicies: FirewallPolicy[] = [
  { id: 1, name: "LAN-to-Internet", srcintf: "port3", dstintf: "port1", srcaddr: "LAN_SUBNET", dstaddr: "all", service: "ALL", action: "accept", nat: true, logTraffic: true, schedule: "always", status: "enabled", utmProfiles: { av: "default", ips: "default", webFilter: "default", appControl: "default" }, hitCount: 245000 },
  { id: 2, name: "DMZ-Web-Server", srcintf: "port1", dstintf: "port4", srcaddr: "all", dstaddr: "DMZ_SERVERS", service: "HTTP HTTPS", action: "accept", nat: false, logTraffic: true, schedule: "always", status: "enabled", utmProfiles: { av: "high-security", ips: "protect_http_server", webFilter: "none", appControl: "none" }, hitCount: 189000 },
  { id: 3, name: "DNS-Allow", srcintf: "port3", dstintf: "port1", srcaddr: "LAN_SUBNET", dstaddr: "DNS_SERVERS", service: "DNS", action: "accept", nat: true, logTraffic: false, schedule: "always", status: "enabled", utmProfiles: { av: "none", ips: "default", webFilter: "none", appControl: "none" }, hitCount: 98000 },
  { id: 4, name: "Block-Gambling", srcintf: "port3", dstintf: "port1", srcaddr: "LAN_SUBNET", dstaddr: "BLOCKED_SITES", service: "ALL", action: "deny", nat: false, logTraffic: true, schedule: "always", status: "enabled", utmProfiles: { av: "none", ips: "none", webFilter: "strict", appControl: "none" }, hitCount: 12000 },
  { id: 5, name: "VPN-Users-Access", srcintf: "ssl.root", dstintf: "port3", srcaddr: "VPN_USERS", dstaddr: "LAN_SUBNET", service: "ALL", action: "accept", nat: false, logTraffic: true, schedule: "always", status: "enabled", utmProfiles: { av: "default", ips: "default", webFilter: "default", appControl: "default" }, hitCount: 134000 },
  { id: 6, name: "Guest-WiFi-Internet", srcintf: "port3", dstintf: "port1", srcaddr: "GUEST_WIFI", dstaddr: "all", service: "HTTP HTTPS DNS", action: "accept", nat: true, logTraffic: true, schedule: "business-hours", status: "enabled", utmProfiles: { av: "default", ips: "default", webFilter: "strict", appControl: "monitor-only" }, hitCount: 78000 },
  { id: 7, name: "Block-All-Default", srcintf: "any", dstintf: "any", srcaddr: "all", dstaddr: "all", service: "ALL", action: "deny", nat: false, logTraffic: true, schedule: "always", status: "enabled", utmProfiles: { av: "none", ips: "none", webFilter: "none", appControl: "none" }, hitCount: 567000 },
];

const defaultAddressObjects: AddressObject[] = [
  { id: "1", name: "LAN_SUBNET", type: "subnet", value: "10.0.0.0/8", interface: "port3", comment: "Internal LAN network" },
  { id: "2", name: "DMZ_SERVERS", type: "subnet", value: "172.16.0.0/24", interface: "port4", comment: "DMZ server segment" },
  { id: "3", name: "VPN_USERS", type: "subnet", value: "10.212.134.0/24", interface: "ssl.root", comment: "SSL-VPN user pool" },
  { id: "4", name: "GUEST_WIFI", type: "subnet", value: "10.0.20.0/24", interface: "port3", comment: "Guest WiFi network" },
  { id: "5", name: "DNS_SERVERS", type: "subnet", value: "8.8.8.0/24", interface: "", comment: "Google DNS" },
  { id: "6", name: "BLOCKED_SITES", type: "fqdn", value: "*.bet365.com *.gambling.com", interface: "", comment: "Blocked gambling sites" },
  { id: "7", name: "MGMT_HOSTS", type: "subnet", value: "10.0.99.0/24", interface: "port5", comment: "Management hosts" },
  { id: "8", name: "INTERNET_ALL", type: "wildcard", value: "0.0.0.0/0", interface: "", comment: "All internet" },
  { id: "9", name: "MS365_CLOUD", type: "fqdn", value: "*.office365.com *.microsoft.com", interface: "", comment: "Microsoft 365" },
  { id: "10", name: "AWS_VPC", type: "subnet", value: "10.100.0.0/16", interface: "", comment: "AWS VPC CIDR" },
];

function convertInterfaces(ifaces: typeof mockData.interfaces): NetworkInterface[] {
  return ifaces.map(i => ({
    ...i,
    status: i.status as "up" | "down",
    mode: "static" as const,
    mtu: 1500,
    zone: i.alias === "WAN1" || i.alias === "WAN2" ? "WAN" : i.alias === "DMZ" ? "DMZ" : i.alias === "MGMT" ? "MGMT" : "LAN",
    adminAccess: i.alias === "MGMT" ? ["HTTPS", "SSH", "Ping", "SNMP"] : i.alias === "LAN" ? ["HTTPS", "Ping"] : ["Ping"],
  }));
}

function createInitialState(): SimulationState {
  return {
    systemInfo: { ...mockData.systemInfo },
    cpuUsage: mockData.cpuUsage,
    memoryUsage: mockData.memoryUsage,
    licenses: [...mockData.licenses],
    fortiGuardInfo: { ...mockData.fortiGuardInfo },
    adminUsers: [...mockData.adminUsers],
    virtualDomains: [...mockData.virtualDomains],
    fabricDevices: [...mockData.fabricDevices],
    interfaces: convertInterfaces(mockData.interfaces),
    routes: [...mockData.routes],
    dhcpLeases: [...mockData.dhcpLeases],
    ipsecTunnels: [...mockData.ipsecTunnels],
    bandwidthData: [...mockData.bandwidthData],
    sessionData: [...mockData.sessionData],
    currentSessions: mockData.currentSessions,
    alertLogs: [...mockData.alertLogs],
    topThreats: [...mockData.topThreats],
    compromisedHosts: [...mockData.compromisedHosts],
    ipsSignatures: [...mockData.ipsSignatures],
    webFilterCategories: [...mockData.webFilterCategories],
    sandboxStats: { ...mockData.sandboxStats },
    avThreats: [...mockData.avThreats],
    policies: [...defaultPolicies],
    addressObjects: [...defaultAddressObjects],
    activeUsers: [...mockData.activeUsers],
    firewallUsers: [...mockData.firewallUsers],
    deviceInventory: [...mockData.deviceInventory],
    fortiApDevices: [...mockData.fortiApDevices],
    wifiClients: [...mockData.wifiClients],
    sslVpnSessions: [...mockData.sslVpnSessions],
    sslVpnMonitorSessions: [...mockData.sslVpnMonitorSessions],
    vpnTrafficData: [...mockData.vpnTrafficData],
    fortiviewSessions: [...mockData.fortiviewSessions],
    fortiviewSources: [...mockData.fortiviewSources],
    fortiviewDestinations: [...mockData.fortiviewDestinations],
    fortiviewApplications: [...mockData.fortiviewApplications],
    fortiviewThreats: [...mockData.fortiviewThreats],
    fortiviewVpn: [...mockData.fortiviewVpn],
    firewallSourceObjects: [...mockData.firewallSourceObjects],
    firewallDestObjects: [...mockData.firewallDestObjects],
    topWebsites: [...mockData.topWebsites],
    cloudApplications: [...mockData.cloudApplications],
    eventLog: [],
  };
}

const SimulationContext = createContext<SimulationContextType | null>(null);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SimulationState>(createInitialState);
  const [cliHistory, setCliHistory] = useState<string[]>([]);

  // Load persisted policies from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fg-sim-policies");
      if (saved) setState(s => ({ ...s, policies: JSON.parse(saved) }));
      const savedAddr = localStorage.getItem("fg-sim-addresses");
      if (savedAddr) setState(s => ({ ...s, addressObjects: JSON.parse(savedAddr) }));
    } catch {}
  }, []);

  // Persist policies
  useEffect(() => {
    localStorage.setItem("fg-sim-policies", JSON.stringify(state.policies));
  }, [state.policies]);
  useEffect(() => {
    localStorage.setItem("fg-sim-addresses", JSON.stringify(state.addressObjects));
  }, [state.addressObjects]);

  const updateCpu = useCallback((val: number) => setState(s => ({ ...s, cpuUsage: val })), []);
  const updateMemory = useCallback((val: number) => setState(s => ({ ...s, memoryUsage: val })), []);
  const addAlert = useCallback((alert: typeof mockData.alertLogs[0]) => setState(s => ({ ...s, alertLogs: [alert, ...s.alertLogs].slice(0, 50) })), []);
  const setPolicies = useCallback((policies: FirewallPolicy[]) => setState(s => ({ ...s, policies })), []);
  const addPolicy = useCallback((policy: FirewallPolicy) => setState(s => ({ ...s, policies: [...s.policies, policy] })), []);
  const updatePolicy = useCallback((id: number, updates: Partial<FirewallPolicy>) => setState(s => ({ ...s, policies: s.policies.map(p => p.id === id ? { ...p, ...updates } : p) })), []);
  const deletePolicy = useCallback((id: number) => setState(s => ({ ...s, policies: s.policies.filter(p => p.id !== id) })), []);
  const reorderPolicies = useCallback((policies: FirewallPolicy[]) => setState(s => ({ ...s, policies })), []);
  const setInterfaces = useCallback((ifaces: NetworkInterface[]) => setState(s => ({ ...s, interfaces: ifaces })), []);
  const updateInterface = useCallback((name: string, updates: Partial<NetworkInterface>) => setState(s => ({ ...s, interfaces: s.interfaces.map(i => i.name === name ? { ...i, ...updates } : i) })), []);
  const addAddressObject = useCallback((obj: AddressObject) => setState(s => ({ ...s, addressObjects: [...s.addressObjects, obj] })), []);
  const updateAddressObject = useCallback((id: string, updates: Partial<AddressObject>) => setState(s => ({ ...s, addressObjects: s.addressObjects.map(a => a.id === id ? { ...a, ...updates } : a) })), []);
  const deleteAddressObject = useCallback((id: string) => setState(s => ({ ...s, addressObjects: s.addressObjects.filter(a => a.id !== id) })), []);
  const setAddressObjects = useCallback((objs: AddressObject[]) => setState(s => ({ ...s, addressObjects: objs })), []);
  const injectEvent = useCallback((event: SimulationEvent) => setState(s => ({ ...s, eventLog: [event, ...s.eventLog].slice(0, 100) })), []);
  const setInterfaceStatus = useCallback((name: string, status: "up" | "down") => setState(s => ({ ...s, interfaces: s.interfaces.map(i => i.name === name ? { ...i, status } : i) })), []);
  const setTunnelStatus = useCallback((name: string, phase2: "up" | "down") => setState(s => ({ ...s, ipsecTunnels: s.ipsecTunnels.map(t => t.name === name ? { ...t, phase2 } : t) })), []);
  const addCompromisedHost = useCallback((host: typeof mockData.compromisedHosts[0]) => setState(s => ({ ...s, compromisedHosts: [...s.compromisedHosts, host] })), []);
  const resetState = useCallback(() => {
    setState(createInitialState());
    localStorage.removeItem("fg-sim-policies");
    localStorage.removeItem("fg-sim-addresses");
  }, []);
  const addCliCommand = useCallback((cmd: string) => setCliHistory(h => [...h, cmd]), []);

  return (
    <SimulationContext.Provider value={{
      state, updateCpu, updateMemory, addAlert, setPolicies, addPolicy, updatePolicy, deletePolicy,
      reorderPolicies, setInterfaces, updateInterface, addAddressObject, updateAddressObject,
      deleteAddressObject, setAddressObjects, injectEvent, setInterfaceStatus, setTunnelStatus,
      addCompromisedHost, resetState, cliHistory, addCliCommand,
    }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error("useSimulation must be used within SimulationProvider");
  return ctx;
}
