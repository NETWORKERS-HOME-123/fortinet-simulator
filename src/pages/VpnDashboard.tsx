import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/widgets/StatusBadge";
import { TimeRangeSelector } from "@/components/widgets/TimeRangeSelector";
import { sslVpnSessions, ipsecTunnels, vpnTrafficData } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Lock, Globe } from "lucide-react";

export default function VpnDashboard() {
  return (
    <DashboardLayout title="VPN Dashboard" subtitle="SSL-VPN & IPsec Monitoring">
      <div className="grid gap-4 md:grid-cols-2">
        {/* VPN Traffic */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">VPN Traffic</CardTitle>
            <TimeRangeSelector />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={vpnTrafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="sslVpn" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" name="SSL-VPN (Mbps)" />
                <Area type="monotone" dataKey="ipsec" stroke="hsl(var(--success))" fill="hsl(var(--success) / 0.2)" name="IPsec (Mbps)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* SSL-VPN Sessions */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" /> SSL-VPN Active Sessions ({sslVpnSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">User</TableHead>
                  <TableHead className="text-xs">Source IP</TableHead>
                  <TableHead className="text-xs">Assigned IP</TableHead>
                  <TableHead className="text-xs">Tunnel Type</TableHead>
                  <TableHead className="text-xs">Duration</TableHead>
                  <TableHead className="text-xs">Bandwidth</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sslVpnSessions.map((s) => (
                  <TableRow key={s.user}>
                    <TableCell className="text-xs font-medium py-2">{s.user}</TableCell>
                    <TableCell className="text-xs font-mono py-2">{s.sourceIp}</TableCell>
                    <TableCell className="text-xs font-mono py-2">{s.assignedIp}</TableCell>
                    <TableCell className="text-xs py-2">{s.tunnelType}</TableCell>
                    <TableCell className="text-xs py-2">{s.duration}</TableCell>
                    <TableCell className="text-xs py-2">{s.bandwidth}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* IPsec Tunnels */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> IPsec Tunnel Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Remote Gateway</TableHead>
                  <TableHead className="text-xs">Phase 1</TableHead>
                  <TableHead className="text-xs">Phase 2</TableHead>
                  <TableHead className="text-xs">Incoming</TableHead>
                  <TableHead className="text-xs">Outgoing</TableHead>
                  <TableHead className="text-xs">Uptime</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ipsecTunnels.map((t) => (
                  <TableRow key={t.name}>
                    <TableCell className="text-xs font-medium py-2">{t.name}</TableCell>
                    <TableCell className="text-xs font-mono py-2">{t.remote}</TableCell>
                    <TableCell className="py-2"><StatusBadge status={t.phase1} /></TableCell>
                    <TableCell className="py-2"><StatusBadge status={t.phase2} /></TableCell>
                    <TableCell className="text-xs py-2">{t.incoming}</TableCell>
                    <TableCell className="text-xs py-2">{t.outgoing}</TableCell>
                    <TableCell className="text-xs py-2">{t.uptime}</TableCell>
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
