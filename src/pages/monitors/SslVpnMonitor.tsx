import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/widgets/StatusBadge";
import { sslVpnMonitorSessions } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lock } from "lucide-react";

export default function SslVpnMonitor() {
  return (
    <DashboardLayout title="SSL-VPN Monitor" subtitle="Active SSL-VPN Sessions">
      <div className="grid gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">{sslVpnMonitorSessions.length}</div>
              <div className="text-xs text-muted-foreground">Active Sessions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">{sslVpnMonitorSessions.filter(s => s.tunnelType === "Full Tunnel").length}</div>
              <div className="text-xs text-muted-foreground">Full Tunnel</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">{sslVpnMonitorSessions.filter(s => s.tunnelType === "Split Tunnel").length}</div>
              <div className="text-xs text-muted-foreground">Split Tunnel</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">{sslVpnMonitorSessions.filter(s => s.tunnelType === "Web Mode").length}</div>
              <div className="text-xs text-muted-foreground">Web Mode</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" /> SSL-VPN Sessions
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
                  <TableHead className="text-xs">OS</TableHead>
                  <TableHead className="text-xs">Login Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sslVpnMonitorSessions.map((s) => (
                  <TableRow key={s.user}>
                    <TableCell className="text-xs font-medium py-2">{s.user}</TableCell>
                    <TableCell className="text-xs font-mono py-2">{s.sourceIp}</TableCell>
                    <TableCell className="text-xs font-mono py-2">{s.assignedIp}</TableCell>
                    <TableCell className="py-2"><StatusBadge status={s.tunnelType === "Full Tunnel" ? "active" : s.tunnelType === "Split Tunnel" ? "info" : "monitoring"} /></TableCell>
                    <TableCell className="text-xs py-2">{s.duration}</TableCell>
                    <TableCell className="text-xs py-2">{s.bandwidth}</TableCell>
                    <TableCell className="text-xs py-2">{s.os}</TableCell>
                    <TableCell className="text-xs py-2">{s.loginTime}</TableCell>
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
