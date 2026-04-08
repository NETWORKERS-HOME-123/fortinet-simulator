import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/widgets/StatusBadge";
import { fortiviewSources } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";

type Source = typeof fortiviewSources[number];
type SortKey = "ip" | "sessions" | "threatScore";

export default function SourcesMonitor() {
  const [sortKey, setSortKey] = useState<SortKey>("sessions");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Source | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const sorted = [...fortiviewSources].sort((a, b) => {
    const va = a[sortKey];
    const vb = b[sortKey];
    const cmp = typeof va === "number" ? (va as number) - (vb as number) : String(va).localeCompare(String(vb));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const threatColor = (score: number) =>
    score > 70 ? "hsl(var(--destructive))" : score > 40 ? "hsl(var(--warning))" : "hsl(var(--success))";

  return (
    <DashboardLayout title="FortiView: Sources" subtitle="Top source IPs by sessions & bandwidth">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{fortiviewSources.length} Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs cursor-pointer" onClick={() => handleSort("ip")}>
                  <span className="flex items-center gap-1">IP Address <ArrowUpDown className="h-3 w-3" /></span>
                </TableHead>
                <TableHead className="text-xs">Hostname</TableHead>
                <TableHead className="text-xs">Country</TableHead>
                <TableHead className="text-xs cursor-pointer" onClick={() => handleSort("sessions")}>
                  <span className="flex items-center gap-1">Sessions <ArrowUpDown className="h-3 w-3" /></span>
                </TableHead>
                <TableHead className="text-xs">Bandwidth</TableHead>
                <TableHead className="text-xs cursor-pointer" onClick={() => handleSort("threatScore")}>
                  <span className="flex items-center gap-1">Threat Score <ArrowUpDown className="h-3 w-3" /></span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((s) => (
                <TableRow key={s.ip} className="cursor-pointer" onClick={() => setSelected(s)}>
                  <TableCell className="text-xs font-mono py-2">{s.ip}</TableCell>
                  <TableCell className="text-xs py-2">{s.hostname}</TableCell>
                  <TableCell className="text-xs py-2">{s.country}</TableCell>
                  <TableCell className="text-xs py-2">{s.sessions.toLocaleString()}</TableCell>
                  <TableCell className="text-xs py-2">{s.bandwidth}</TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <Progress value={s.threatScore} className="h-1.5 w-16" style={{ "--progress-color": threatColor(s.threatScore) } as React.CSSProperties} />
                      <span className="text-xs font-medium" style={{ color: threatColor(s.threatScore) }}>{s.threatScore}</span>
                      {s.threatScore > 70 && <StatusBadge status="critical" />}
                      {s.threatScore > 40 && s.threatScore <= 70 && <StatusBadge status="warning" />}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Source Detail — {selected?.ip}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">IP:</span> <span className="font-mono">{selected.ip}</span></div>
              <div><span className="text-muted-foreground">Hostname:</span> {selected.hostname}</div>
              <div><span className="text-muted-foreground">Country:</span> {selected.country}</div>
              <div><span className="text-muted-foreground">Sessions:</span> {selected.sessions.toLocaleString()}</div>
              <div><span className="text-muted-foreground">Bandwidth:</span> {selected.bandwidth}</div>
              <div><span className="text-muted-foreground">Threat Score:</span> <span style={{ color: threatColor(selected.threatScore) }}>{selected.threatScore}/100</span></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
