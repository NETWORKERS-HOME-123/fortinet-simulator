import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/widgets/StatusBadge";
import { fortiApDevices, wifiClients } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wifi, Signal } from "lucide-react";

export default function WiFiDashboard() {
  const totalClients = fortiApDevices.reduce((a, d) => a + d.clients, 0);
  const onlineAPs = fortiApDevices.filter(d => d.status === "up").length;

  return (
    <DashboardLayout title="WiFi Dashboard" subtitle="FortiAP & Wireless Clients">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Summary Cards */}
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">{fortiApDevices.length}</div>
            <div className="text-xs text-muted-foreground">Total APs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-[hsl(var(--success))]">{onlineAPs}</div>
            <div className="text-xs text-muted-foreground">Online</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-[hsl(var(--destructive))]">{fortiApDevices.length - onlineAPs}</div>
            <div className="text-xs text-muted-foreground">Offline</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">{totalClients}</div>
            <div className="text-xs text-muted-foreground">Connected Clients</div>
          </CardContent>
        </Card>

        {/* FortiAP Status */}
        <Card className="md:col-span-2 xl:col-span-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wifi className="h-4 w-4 text-primary" /> FortiAP Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Model</TableHead>
                  <TableHead className="text-xs">Serial</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Clients</TableHead>
                  <TableHead className="text-xs">Channel</TableHead>
                  <TableHead className="text-xs">Firmware</TableHead>
                  <TableHead className="text-xs">Uptime</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fortiApDevices.map((ap) => (
                  <TableRow key={ap.name}>
                    <TableCell className="text-xs font-medium py-2">{ap.name}</TableCell>
                    <TableCell className="text-xs py-2">{ap.model}</TableCell>
                    <TableCell className="text-xs font-mono py-2">{ap.serial}</TableCell>
                    <TableCell className="py-2"><StatusBadge status={ap.status} /></TableCell>
                    <TableCell className="text-xs py-2">{ap.clients}</TableCell>
                    <TableCell className="text-xs py-2">{ap.channel}</TableCell>
                    <TableCell className="text-xs py-2">{ap.firmware}</TableCell>
                    <TableCell className="text-xs py-2">{ap.uptime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* WiFi Clients */}
        <Card className="md:col-span-2 xl:col-span-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Signal className="h-4 w-4 text-primary" /> Connected Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Hostname</TableHead>
                  <TableHead className="text-xs">MAC</TableHead>
                  <TableHead className="text-xs">AP</TableHead>
                  <TableHead className="text-xs">SSID</TableHead>
                  <TableHead className="text-xs">Band</TableHead>
                  <TableHead className="text-xs">Signal</TableHead>
                  <TableHead className="text-xs">IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wifiClients.map((c) => (
                  <TableRow key={c.mac}>
                    <TableCell className="text-xs font-medium py-2">{c.hostname}</TableCell>
                    <TableCell className="text-xs font-mono py-2">{c.mac}</TableCell>
                    <TableCell className="text-xs py-2">{c.ap}</TableCell>
                    <TableCell className="text-xs py-2">{c.ssid}</TableCell>
                    <TableCell className="text-xs py-2">{c.band}</TableCell>
                    <TableCell className="text-xs py-2">
                      <span className={c.signal > -50 ? "text-[hsl(var(--success))]" : c.signal > -65 ? "text-[hsl(var(--warning))]" : "text-[hsl(var(--destructive))]"}>
                        {c.signal} dBm
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono py-2">{c.ip}</TableCell>
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
