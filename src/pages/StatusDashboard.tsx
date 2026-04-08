import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GaugeWidget } from "@/components/widgets/GaugeWidget";
import { StatusBadge } from "@/components/widgets/StatusBadge";
import { TimeRangeSelector } from "@/components/widgets/TimeRangeSelector";
import { AddWidgetDialog } from "@/components/widgets/AddWidgetDialog";
import { systemInfo, licenses, cpuUsage, memoryUsage, fabricDevices, sessionData as initialSessionData, alertLogs, fortiGuardInfo, adminUsers, virtualDomains } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Server, Shield, CheckCircle, AlertTriangle, Wifi, ShieldCheck, UserCog, Layers, Clock, Settings, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

function jitter(val: number, pct = 0.1) {
  return Math.max(0, Math.round(val * (1 + (Math.random() - 0.5) * 2 * pct)));
}

let timeCounter = 0;

const statusWidgets = [
  { id: "sysinfo", name: "System Information", description: "Hostname, serial, firmware, uptime" },
  { id: "cpu", name: "CPU Usage", description: "Real-time CPU utilization gauge" },
  { id: "memory", name: "Memory Usage", description: "Real-time memory utilization gauge" },
  { id: "licenses", name: "Licenses", description: "FortiCare and UTM bundle status" },
  { id: "fortiguard", name: "FortiGuard", description: "AV/IPS database versions" },
  { id: "sessions", name: "Session Rate", description: "IPv4/IPv6 session chart" },
  { id: "admins", name: "Administrators", description: "Logged-in admin users" },
  { id: "vdoms", name: "Virtual Domains", description: "VDOM status overview" },
  { id: "fabric", name: "Security Fabric", description: "Connected Fortinet devices" },
  { id: "ha", name: "HA Status", description: "High availability cluster" },
  { id: "alerts", name: "Alert Console", description: "Recent alerts and logs" },
];

function WidgetHeader({ title, icon, children }: { title: string; icon?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
      <CardTitle className="text-sm font-medium flex items-center gap-2">
        {icon} {title}
      </CardTitle>
      <div className="flex items-center gap-1">
        {children}
        <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground">
          <Settings className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-destructive">
          <X className="h-3 w-3" />
        </Button>
      </div>
    </CardHeader>
  );
}

export default function StatusDashboard() {
  const [sessionData, setSessionData] = useState(initialSessionData);
  const [systemTime, setSystemTime] = useState(new Date());

  useEffect(() => {
    const clockInterval = setInterval(() => setSystemTime(new Date()), 1000);
    const sessionInterval = setInterval(() => {
      setSessionData(prev => {
        const last = prev[prev.length - 1];
        timeCounter++;
        return [...prev.slice(1), {
          time: `${String(timeCounter).padStart(2, '0')}:00`,
          ipv4: jitter(last.ipv4),
          ipv6: jitter(last.ipv6),
        }];
      });
    }, 5000);
    return () => { clearInterval(clockInterval); clearInterval(sessionInterval); };
  }, []);

  return (
    <DashboardLayout title="Status Dashboard" subtitle={systemInfo.hostname}>
      <div className="flex justify-end mb-4">
        <AddWidgetDialog widgets={statusWidgets} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* System Info */}
        <Card className="md:col-span-2">
          <WidgetHeader title="System Information" icon={<Server className="h-4 w-4 text-primary" />} />
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Hostname:</span> <span className="font-medium">{systemInfo.hostname}</span></div>
              <div><span className="text-muted-foreground">Model:</span> <span className="font-medium">{systemInfo.model}</span></div>
              <div><span className="text-muted-foreground">Serial:</span> <span className="font-mono text-xs">{systemInfo.serialNumber}</span></div>
              <div><span className="text-muted-foreground">Firmware:</span> <span className="font-medium">{systemInfo.firmware}</span></div>
              <div><span className="text-muted-foreground">Uptime:</span> <span className="font-medium">{systemInfo.uptime}</span></div>
              <div><span className="text-muted-foreground">HA Status:</span> <StatusBadge status="active" /> <span className="text-xs ml-1">{systemInfo.haRole}</span></div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">System Time:</span>
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="font-mono text-xs">{systemTime.toLocaleString()}</span>
              </div>
              <div><span className="text-muted-foreground">Operation Mode:</span> <span className="font-medium">NAT</span></div>
            </div>
          </CardContent>
        </Card>

        {/* CPU & Memory */}
        <GaugeWidget title="CPU Usage" value={cpuUsage} />
        <GaugeWidget title="Memory Usage" value={memoryUsage} />

        {/* Licenses */}
        <Card className="md:col-span-2">
          <WidgetHeader title="Licenses" icon={<CheckCircle className="h-4 w-4 text-primary" />} />
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Service</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Expiry</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenses.map((l) => (
                  <TableRow key={l.name}>
                    <TableCell className="text-xs font-medium py-2">{l.name}</TableCell>
                    <TableCell className="text-xs py-2">{l.type}</TableCell>
                    <TableCell className="py-2"><StatusBadge status={l.status} /></TableCell>
                    <TableCell className="text-xs py-2">{l.expiry}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* FortiGuard Info */}
        <Card className="md:col-span-2">
          <WidgetHeader title="FortiGuard Information" icon={<ShieldCheck className="h-4 w-4 text-primary" />} />
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">AV Engine:</span> <span className="font-medium">{fortiGuardInfo.avVersion}</span></div>
              <div><span className="text-muted-foreground">IPS Engine:</span> <span className="font-medium">{fortiGuardInfo.ipsVersion}</span></div>
              <div><span className="text-muted-foreground">App DB:</span> <span className="font-medium">{fortiGuardInfo.appDbVersion}</span></div>
              <div><span className="text-muted-foreground">IPS DB:</span> <span className="font-medium">{fortiGuardInfo.ipsDbVersion}</span></div>
              <div><span className="text-muted-foreground">Last Update:</span> <span className="font-medium">{fortiGuardInfo.lastUpdate}</span></div>
              <div><span className="text-muted-foreground">Update Server:</span> <span className="font-mono text-xs">{fortiGuardInfo.updateServer}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Session Rate */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Session Rate</CardTitle>
            <div className="flex items-center gap-1">
              <TimeRangeSelector />
              <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground"><Settings className="h-3 w-3" /></Button>
              <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground"><X className="h-3 w-3" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={sessionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="ipv4" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                <Area type="monotone" dataKey="ipv6" stroke="hsl(var(--success))" fill="hsl(var(--success) / 0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Administrators */}
        <Card>
          <WidgetHeader title="Administrators" icon={<UserCog className="h-4 w-4 text-primary" />} />
          <CardContent>
            <div className="space-y-2">
              {adminUsers.map((a) => (
                <div key={a.username} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-xs">
                  <div>
                    <div className="font-medium">{a.username}</div>
                    <div className="text-muted-foreground">{a.profile} • {a.ip}</div>
                  </div>
                  <div className="text-muted-foreground text-right">
                    <div>{a.loginTime}</div>
                    <StatusBadge status="active" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Virtual Domains */}
        <Card>
          <WidgetHeader title="Virtual Domains" icon={<Layers className="h-4 w-4 text-primary" />} />
          <CardContent>
            <div className="space-y-2">
              {virtualDomains.map((v) => (
                <div key={v.name} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-xs">
                  <div>
                    <div className="font-medium">{v.name}</div>
                    <div className="text-muted-foreground">{v.interfaces} interfaces</div>
                  </div>
                  <div className="text-right">
                    <div className="text-muted-foreground">{v.sessions.toLocaleString()} sessions</div>
                    <StatusBadge status={v.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Fabric */}
        <Card className="xl:col-span-2">
          <WidgetHeader title="Security Fabric" icon={<Shield className="h-4 w-4 text-primary" />} />
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {fabricDevices.map((d) => (
                <div key={d.name} className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-xs">
                  <Wifi className={`h-3 w-3 ${d.status === "up" ? "text-[hsl(var(--success))]" : "text-[hsl(var(--destructive))]"}`} />
                  <div className="min-w-0">
                    <div className="font-medium truncate">{d.name}</div>
                    <div className="text-muted-foreground">{d.ip}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* HA Status */}
        <Card>
          <WidgetHeader title="HA Status" />
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
              <div className="text-sm font-medium">FGT-DC-PRIMARY</div>
              <StatusBadge status="active" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
              <div className="text-sm font-medium">FGT-DC-SECONDARY</div>
              <StatusBadge status="monitoring" />
            </div>
            <div className="text-xs text-muted-foreground">Mode: Active-Passive | Sync: 100%</div>
          </CardContent>
        </Card>

        {/* Alert Console */}
        <Card className="md:col-span-2 xl:col-span-4">
          <WidgetHeader title="Alert & Log Console" icon={<AlertTriangle className="h-4 w-4 text-primary" />} />
          <CardContent>
            <div className="max-h-64 overflow-auto space-y-1">
              {alertLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-2 rounded text-xs hover:bg-muted/50">
                  <span className="text-muted-foreground font-mono shrink-0">{log.time}</span>
                  <StatusBadge status={log.severity} />
                  <span className="text-muted-foreground">[{log.source}]</span>
                  <span className="flex-1">{log.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
