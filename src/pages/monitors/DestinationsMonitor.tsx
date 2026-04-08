import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/widgets/StatusBadge";
import { fortiviewDestinations } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";

type Dest = typeof fortiviewDestinations[number];
type SortKey = "ip" | "domain" | "sessions";

export default function DestinationsMonitor() {
  const [sortKey, setSortKey] = useState<SortKey>("sessions");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Dest | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const sorted = [...fortiviewDestinations].sort((a, b) => {
    const va = a[sortKey];
    const vb = b[sortKey];
    const cmp = typeof va === "number" ? (va as number) - (vb as number) : String(va).localeCompare(String(vb));
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <DashboardLayout title="FortiView: Destinations" subtitle="Top destination IPs/domains by traffic">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{fortiviewDestinations.length} Destinations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {([["ip", "IP Address"], ["domain", "Domain"], ["sessions", "Sessions"]] as [SortKey, string][]).map(([key, label]) => (
                  <TableHead key={key} className="text-xs cursor-pointer" onClick={() => handleSort(key)}>
                    <span className="flex items-center gap-1">{label} <ArrowUpDown className="h-3 w-3" /></span>
                  </TableHead>
                ))}
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs">Bandwidth</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((d) => (
                <TableRow key={d.ip} className="cursor-pointer" onClick={() => setSelected(d)}>
                  <TableCell className="text-xs font-mono py-2">{d.ip}</TableCell>
                  <TableCell className="text-xs py-2">{d.domain}</TableCell>
                  <TableCell className="text-xs py-2">{d.sessions.toLocaleString()}</TableCell>
                  <TableCell className="py-2">
                    <StatusBadge status={d.category === "Botnet C&C" ? "critical" : "info"} />
                    <span className="text-xs ml-1">{d.category}</span>
                  </TableCell>
                  <TableCell className="text-xs py-2">{d.bandwidth}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Destination Detail — {selected?.domain}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">IP:</span> <span className="font-mono">{selected.ip}</span></div>
              <div><span className="text-muted-foreground">Domain:</span> {selected.domain}</div>
              <div><span className="text-muted-foreground">Category:</span> {selected.category}</div>
              <div><span className="text-muted-foreground">Sessions:</span> {selected.sessions.toLocaleString()}</div>
              <div><span className="text-muted-foreground">Bandwidth:</span> {selected.bandwidth}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
