import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fortiviewApplications } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";

type App = typeof fortiviewApplications[number];
type SortKey = "name" | "sessions" | "risk";

export default function ApplicationsMonitor() {
  const [sortKey, setSortKey] = useState<SortKey>("sessions");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<App | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const sorted = [...fortiviewApplications].sort((a, b) => {
    const va = a[sortKey];
    const vb = b[sortKey];
    const cmp = typeof va === "number" ? (va as number) - (vb as number) : String(va).localeCompare(String(vb));
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <DashboardLayout title="FortiView: Applications" subtitle="Application usage and risk assessment">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{fortiviewApplications.length} Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {([["name", "Application"], ["sessions", "Sessions"], ["risk", "Risk"]] as [SortKey, string][]).map(([key, label]) => (
                  <TableHead key={key} className="text-xs cursor-pointer" onClick={() => handleSort(key)}>
                    <span className="flex items-center gap-1">{label} <ArrowUpDown className="h-3 w-3" /></span>
                  </TableHead>
                ))}
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs">Bandwidth</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((a) => (
                <TableRow key={a.name} className="cursor-pointer" onClick={() => setSelected(a)}>
                  <TableCell className="text-xs font-medium py-2">{a.name}</TableCell>
                  <TableCell className="text-xs py-2">{a.sessions.toLocaleString()}</TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <Progress value={a.risk * 20} className="h-1.5 w-12" />
                      <span className="text-xs">{a.risk}/5</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs py-2">{a.category}</TableCell>
                  <TableCell className="text-xs py-2">{a.bandwidth}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Application Detail — {selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Name:</span> {selected.name}</div>
              <div><span className="text-muted-foreground">Category:</span> {selected.category}</div>
              <div><span className="text-muted-foreground">Sessions:</span> {selected.sessions.toLocaleString()}</div>
              <div><span className="text-muted-foreground">Bandwidth:</span> {selected.bandwidth}</div>
              <div><span className="text-muted-foreground">Risk Level:</span> {selected.risk}/5</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
