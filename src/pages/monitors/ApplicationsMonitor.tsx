import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fortiviewApplications } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, BarChart3, Table as TableIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts";

type App = typeof fortiviewApplications[number];
type SortKey = "name" | "sessions" | "risk";

const riskColors: Record<number, string> = {
  1: "hsl(var(--success))",
  2: "hsl(142, 71%, 55%)",
  3: "hsl(var(--warning))",
  4: "hsl(25, 95%, 53%)",
  5: "hsl(var(--destructive))",
};

const riskLabels: Record<number, string> = {
  1: "Minimal",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Critical",
};

export default function ApplicationsMonitor() {
  const [sortKey, setSortKey] = useState<SortKey>("sessions");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<App | null>(null);
  const [view, setView] = useState<"table" | "bubble">("bubble");

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

  const bubbleData = fortiviewApplications.map((a, i) => ({
    x: i + 1,
    y: a.risk,
    z: a.sessions,
    name: a.name,
    bandwidth: a.bandwidth,
    category: a.category,
    risk: a.risk,
  }));

  return (
    <DashboardLayout title="FortiView: Applications" subtitle="Application usage and risk assessment">
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">{fortiviewApplications.length} Applications</CardTitle>
          <div className="flex items-center gap-1">
            <Button variant={view === "bubble" ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setView("bubble")}>
              <BarChart3 className="h-3.5 w-3.5" />
            </Button>
            <Button variant={view === "table" ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setView("table")}>
              <TableIcon className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {view === "bubble" ? (
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" dataKey="x" name="App" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" hide />
                <YAxis type="number" dataKey="y" name="Risk" domain={[0, 6]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" label={{ value: "Risk Level", angle: -90, position: "insideLeft", style: { fontSize: 11 } }} />
                <ZAxis type="number" dataKey="z" range={[100, 2000]} name="Sessions" />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(value: number, name: string) => {
                    if (name === "Sessions") return [value.toLocaleString(), name];
                    if (name === "Risk") return [`${value}/5 (${riskLabels[value] || "Unknown"})`, name];
                    return [value, name];
                  }}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ""}
                />
                <Scatter data={bubbleData} fill="hsl(var(--primary))" />
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
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
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0"
                          style={{ borderColor: riskColors[a.risk], color: riskColors[a.risk] }}
                        >
                          {a.risk}/5 {riskLabels[a.risk]}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs py-2">{a.category}</TableCell>
                    <TableCell className="text-xs py-2">{a.bandwidth}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
              <div>
                <span className="text-muted-foreground">Risk Level:</span>{" "}
                <Badge variant="outline" style={{ borderColor: riskColors[selected.risk], color: riskColors[selected.risk] }}>
                  {selected.risk}/5 {riskLabels[selected.risk]}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
