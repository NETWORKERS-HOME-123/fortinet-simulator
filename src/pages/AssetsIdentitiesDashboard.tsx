import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/widgets/StatusBadge";
import { activeUsers, deviceInventory, firewallUsers } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Monitor, ShieldCheck, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type User = typeof activeUsers[number];

export default function AssetsIdentitiesDashboard() {
  const [macFilter, setMacFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const totalDevices = deviceInventory.reduce((a, d) => a + d.count, 0);
  const totalNonCompliant = deviceInventory.reduce((a, d) => a + d.nonCompliant, 0);

  const filteredUsers = useMemo(() => {
    if (!macFilter) return activeUsers;
    return activeUsers.filter(u =>
      u.username.toLowerCase().includes(macFilter.toLowerCase()) ||
      u.ip.includes(macFilter)
    );
  }, [macFilter]);

  return (
    <DashboardLayout title="Assets & Identities" subtitle="Devices, Users & Authentication">
      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="firewall-users">Firewall Users</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {/* Summary */}
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold">{totalDevices}</div>
                <div className="text-xs text-muted-foreground">Total Devices</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-[hsl(var(--success))]">{totalDevices - totalNonCompliant}</div>
                <div className="text-xs text-muted-foreground">Compliant</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-[hsl(var(--destructive))]">{totalNonCompliant}</div>
                <div className="text-xs text-muted-foreground">Non-Compliant</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold">{activeUsers.length}</div>
                <div className="text-xs text-muted-foreground">Active Users</div>
              </CardContent>
            </Card>

            {/* Device Inventory Chart */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-primary" /> Device Inventory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={deviceInventory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="type" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="compliant" fill="hsl(var(--success))" name="Compliant" radius={[2, 2, 0, 0]} stackId="a" />
                    <Bar dataKey="nonCompliant" fill="hsl(var(--destructive))" name="Non-Compliant" radius={[2, 2, 0, 0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Active Users with filter */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Active Users
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Filter by user or IP..."
                    className="pl-7 h-8 w-48 text-xs"
                    value={macFilter}
                    onChange={(e) => setMacFilter(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Username</TableHead>
                      <TableHead className="text-xs">IP</TableHead>
                      <TableHead className="text-xs">Group</TableHead>
                      <TableHead className="text-xs">Traffic</TableHead>
                      <TableHead className="text-xs">Auth</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.username} className="cursor-pointer" onClick={() => setSelectedUser(u)}>
                        <TableCell className="text-xs font-medium py-2">{u.username}</TableCell>
                        <TableCell className="text-xs font-mono py-2">{u.ip}</TableCell>
                        <TableCell className="text-xs py-2">{u.group}</TableCell>
                        <TableCell className="text-xs py-2">{u.traffic}</TableCell>
                        <TableCell className="text-xs py-2"><StatusBadge status={u.authMethod === "SSL-VPN" ? "info" : "active"} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="firewall-users">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Authenticated Firewall Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Username</TableHead>
                    <TableHead className="text-xs">IP</TableHead>
                    <TableHead className="text-xs">Auth Method</TableHead>
                    <TableHead className="text-xs">Auth Server</TableHead>
                    <TableHead className="text-xs">Group</TableHead>
                    <TableHead className="text-xs">Traffic Used</TableHead>
                    <TableHead className="text-xs">Timeout</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {firewallUsers.map((u) => (
                    <TableRow key={u.username}>
                      <TableCell className="text-xs font-medium py-2">{u.username}</TableCell>
                      <TableCell className="text-xs font-mono py-2">{u.ip}</TableCell>
                      <TableCell className="text-xs py-2">{u.authMethod}</TableCell>
                      <TableCell className="text-xs py-2">{u.authServer}</TableCell>
                      <TableCell className="text-xs py-2">{u.group}</TableCell>
                      <TableCell className="text-xs py-2">{u.trafficUsed}</TableCell>
                      <TableCell className="text-xs py-2">{u.timeoutRemaining}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Detail Sheet */}
      <Sheet open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="text-sm">{selectedUser?.username}</SheetTitle>
          </SheetHeader>
          {selectedUser && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">IP:</span> <span className="font-mono">{selectedUser.ip}</span></div>
                <div><span className="text-muted-foreground">Group:</span> {selectedUser.group}</div>
                <div><span className="text-muted-foreground">Auth:</span> {selectedUser.authMethod}</div>
                <div><span className="text-muted-foreground">Traffic:</span> {selectedUser.traffic}</div>
                <div><span className="text-muted-foreground">Duration:</span> {selectedUser.duration}</div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
