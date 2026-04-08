import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/widgets/StatusBadge";
import { TimeRangeSelector } from "@/components/widgets/TimeRangeSelector";
import { topThreats, compromisedHosts, sandboxStats, webFilterCategories, ipsSignatures, avThreats } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";
import { Shield, Bug, FileSearch, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(var(--muted-foreground))",
  "hsl(217, 91%, 70%)",
  "hsl(142, 71%, 65%)",
  "hsl(38, 92%, 70%)",
];

type CompromisedHost = typeof compromisedHosts[number];

export default function SecurityDashboard() {
  const [selectedHost, setSelectedHost] = useState<CompromisedHost | null>(null);

  return (
    <DashboardLayout title="Security Dashboard" subtitle="Threat Intelligence & Protection">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Threats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Top Threats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topThreats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={120} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Web Filter Categories */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" /> Web Filter Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={webFilterCategories} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                  {webFilterCategories.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Compromised Hosts */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bug className="h-4 w-4 text-destructive" /> Compromised Hosts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">IP Address</TableHead>
                  <TableHead className="text-xs">Hostname</TableHead>
                  <TableHead className="text-xs">Severity</TableHead>
                  <TableHead className="text-xs">Threat</TableHead>
                  <TableHead className="text-xs">Detected</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compromisedHosts.map((h) => (
                  <TableRow key={h.ip} className="cursor-pointer" onClick={() => setSelectedHost(h)}>
                    <TableCell className="text-xs font-mono py-2">{h.ip}</TableCell>
                    <TableCell className="text-xs py-2">{h.hostname}</TableCell>
                    <TableCell className="py-2"><StatusBadge status={h.severity} /></TableCell>
                    <TableCell className="text-xs py-2">{h.threat}</TableCell>
                    <TableCell className="text-xs py-2">{h.detectedAt}</TableCell>
                    <TableCell className="py-2"><StatusBadge status={h.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* FortiSandbox */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-primary" /> FortiSandbox Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-md bg-muted/50">
                <div className="text-2xl font-bold">{sandboxStats.totalSubmissions.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Submissions</div>
              </div>
              <div className="text-center p-3 rounded-md bg-muted/50">
                <div className="text-2xl font-bold text-[hsl(var(--success))]">{sandboxStats.clean.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Clean</div>
              </div>
              <div className="text-center p-3 rounded-md bg-muted/50">
                <div className="text-2xl font-bold text-[hsl(var(--warning))]">{sandboxStats.suspicious}</div>
                <div className="text-xs text-muted-foreground">Suspicious</div>
              </div>
              <div className="text-center p-3 rounded-md bg-muted/50">
                <div className="text-2xl font-bold text-[hsl(var(--destructive))]">{sandboxStats.malicious}</div>
                <div className="text-xs text-muted-foreground">Malicious</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* IPS Signatures */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Intrusion Prevention - Top Signatures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ipsSignatures.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-xs p-2 rounded bg-muted/50">
                  <div className="flex items-center gap-2 min-w-0">
                    <StatusBadge status={s.severity} />
                    <span className="truncate">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono">{s.count.toLocaleString()}</span>
                    <StatusBadge status={s.action} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AV Threats Timeline */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Antivirus - Detected Threats</CardTitle>
            <TimeRangeSelector />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={avThreats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="detected" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive) / 0.2)" name="Detected" />
                <Area type="monotone" dataKey="blocked" stroke="hsl(var(--success))" fill="hsl(var(--success) / 0.2)" name="Blocked" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Compromised Host Detail Dialog */}
      <Dialog open={!!selectedHost} onOpenChange={() => setSelectedHost(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Bug className="h-4 w-4 text-destructive" />
              {selectedHost?.hostname} — {selectedHost?.ip}
            </DialogTitle>
          </DialogHeader>
          {selectedHost && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Threat:</span> <span className="font-medium">{selectedHost.threat}</span></div>
                <div><span className="text-muted-foreground">Severity:</span> <StatusBadge status={selectedHost.severity} /></div>
                <div><span className="text-muted-foreground">Detected:</span> <span className="font-medium">{selectedHost.detectedAt}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={selectedHost.status} /></div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Associated Sessions</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Dest IP</TableHead>
                      <TableHead className="text-xs">Port</TableHead>
                      <TableHead className="text-xs">Protocol</TableHead>
                      <TableHead className="text-xs">Policy</TableHead>
                      <TableHead className="text-xs">App</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedHost.sessions.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs font-mono py-1">{s.destIp}</TableCell>
                        <TableCell className="text-xs py-1">{s.destPort}</TableCell>
                        <TableCell className="text-xs py-1">{s.protocol}</TableCell>
                        <TableCell className="text-xs py-1">{s.policy}</TableCell>
                        <TableCell className="text-xs py-1">{s.application}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
