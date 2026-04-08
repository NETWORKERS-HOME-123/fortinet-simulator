import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/widgets/StatusBadge";
import { TimeRangeSelector } from "@/components/widgets/TimeRangeSelector";
import { bandwidthData as initBw, sessionData as initSess, memoryData as initMem, interfaces, currentSessions, spuPercentage } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { useState, useEffect } from "react";

function jitter(val: number, pct = 0.1) {
  return Math.max(0, Math.round(val * (1 + (Math.random() - 0.5) * 2 * pct)));
}

let netTimeCounter = 0;

export default function NetworkDashboard() {
  const [bandwidthData, setBandwidthData] = useState(initBw);
  const [sessionData, setSessionData] = useState(initSess);
  const [memoryData, setMemoryData] = useState(initMem);

  useEffect(() => {
    const interval = setInterval(() => {
      netTimeCounter++;
      const t = `${String(netTimeCounter).padStart(2, '0')}:00`;
      setBandwidthData(prev => {
        const last = prev[prev.length - 1];
        return [...prev.slice(1), { time: t, inbound: jitter(last.inbound), outbound: jitter(last.outbound) }];
      });
      setSessionData(prev => {
        const last = prev[prev.length - 1];
        return [...prev.slice(1), { time: t, ipv4: jitter(last.ipv4), ipv6: jitter(last.ipv6) }];
      });
      setMemoryData(prev => {
        const last = prev[prev.length - 1];
        return [...prev.slice(1), { time: t, usage: Math.max(10, Math.min(95, jitter(last.usage, 0.05))) }];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout title="Network Dashboard" subtitle="Traffic & Interface Monitoring">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Application Bandwidth */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Application Bandwidth</CardTitle>
            <TimeRangeSelector />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={bandwidthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="inbound" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" name="Inbound (Mbps)" />
                <Area type="monotone" dataKey="outbound" stroke="hsl(var(--success))" fill="hsl(var(--success) / 0.2)" name="Outbound (Mbps)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sessions */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium">Sessions</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{currentSessions.toLocaleString()} active | SPU: {spuPercentage}%</p>
            </div>
            <TimeRangeSelector />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sessionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="ipv4" fill="hsl(var(--primary))" name="IPv4" radius={[2, 2, 0, 0]} />
                <Bar dataKey="ipv6" fill="hsl(var(--primary) / 0.5)" name="IPv6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Memory */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <TimeRangeSelector />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={memoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="usage" stroke="hsl(var(--warning))" fill="hsl(var(--warning) / 0.2)" name="Memory %" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Interface Bandwidth */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Interface Bandwidth</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Interface</TableHead>
                  <TableHead className="text-xs">Alias</TableHead>
                  <TableHead className="text-xs">IP</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Speed</TableHead>
                  <TableHead className="text-xs">RX Rate</TableHead>
                  <TableHead className="text-xs">TX Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interfaces.map((iface) => (
                  <TableRow key={iface.name}>
                    <TableCell className="text-xs font-mono py-2">{iface.name}</TableCell>
                    <TableCell className="text-xs py-2">{iface.alias}</TableCell>
                    <TableCell className="text-xs font-mono py-2">{iface.ip}</TableCell>
                    <TableCell className="py-2"><StatusBadge status={iface.status} /></TableCell>
                    <TableCell className="text-xs py-2">{iface.speed}</TableCell>
                    <TableCell className="text-xs py-2">{iface.rxRate}</TableCell>
                    <TableCell className="text-xs py-2">{iface.txRate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
