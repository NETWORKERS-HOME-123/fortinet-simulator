import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/widgets/StatusBadge";
import { activeUsers, deviceInventory } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Monitor, ShieldCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function UsersDevicesDashboard() {
  const totalDevices = deviceInventory.reduce((a, d) => a + d.count, 0);
  const totalNonCompliant = deviceInventory.reduce((a, d) => a + d.nonCompliant, 0);

  return (
    <DashboardLayout title="Users & Devices" subtitle="Authentication & Endpoint Monitoring">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Summary cards */}
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{activeUsers.length}</div>
              <div className="text-xs text-muted-foreground">Active Users</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Monitor className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalDevices}</div>
              <div className="text-xs text-muted-foreground">Total Devices</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-destructive/10">
              <ShieldCheck className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalNonCompliant}</div>
              <div className="text-xs text-muted-foreground">Non-Compliant</div>
            </div>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="md:col-span-2 xl:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Username</TableHead>
                  <TableHead className="text-xs">IP Address</TableHead>
                  <TableHead className="text-xs">Group</TableHead>
                  <TableHead className="text-xs">Auth Method</TableHead>
                  <TableHead className="text-xs">Traffic</TableHead>
                  <TableHead className="text-xs">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeUsers.map((u) => (
                  <TableRow key={u.username}>
                    <TableCell className="text-xs font-medium py-2">{u.username}</TableCell>
                    <TableCell className="text-xs font-mono py-2">{u.ip}</TableCell>
                    <TableCell className="text-xs py-2">{u.group}</TableCell>
                    <TableCell className="py-2"><StatusBadge status={u.authMethod === "SSL-VPN" ? "monitoring" : "active"} /></TableCell>
                    <TableCell className="text-xs py-2">{u.traffic}</TableCell>
                    <TableCell className="text-xs py-2">{u.duration}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Device Inventory */}
        <Card className="md:col-span-2 xl:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Device Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {deviceInventory.map((d) => (
                <div key={d.type} className="p-3 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{d.type}</span>
                    <span className="text-lg font-bold">{d.count}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{d.os}</div>
                  <Progress value={(d.compliant / d.count) * 100} className="h-1.5" />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{d.compliant} compliant</span>
                    {d.nonCompliant > 0 && <span className="text-[hsl(var(--destructive))]">{d.nonCompliant} non-compliant</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
