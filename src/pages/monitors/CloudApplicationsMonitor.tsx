import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/widgets/StatusBadge";
import { cloudApplications } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cloud, ArrowUpDown } from "lucide-react";
import { useState } from "react";

function RiskBadge({ risk }: { risk: number }) {
  const color = risk <= 1 ? "hsl(var(--success))" : risk <= 2 ? "hsl(142, 71%, 55%)" : risk <= 3 ? "hsl(var(--warning))" : risk <= 4 ? "hsl(25, 95%, 53%)" : "hsl(var(--destructive))";
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: i < risk ? color : "hsl(var(--muted))" }} />
      ))}
      <span className="text-xs ml-1">{risk}/5</span>
    </div>
  );
}

type SortKey = "name" | "sessions" | "risk" | "users";

export default function CloudApplicationsMonitor() {
  const [sortKey, setSortKey] = useState<SortKey>("sessions");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const sorted = [...cloudApplications].sort((a, b) => {
    const va = a[sortKey];
    const vb = b[sortKey];
    const cmp = typeof va === "number" ? (va as number) - (vb as number) : String(va).localeCompare(String(vb));
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <DashboardLayout title="Cloud Applications" subtitle="SaaS Usage & Risk Assessment">
      <div className="grid gap-4">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-[hsl(var(--success))]">{cloudApplications.filter(a => a.saasType === "Sanctioned").length}</div>
              <div className="text-xs text-muted-foreground">Sanctioned</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-[hsl(var(--warning))]">{cloudApplications.filter(a => a.saasType === "Tolerated").length}</div>
              <div className="text-xs text-muted-foreground">Tolerated</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-[hsl(var(--destructive))]">{cloudApplications.filter(a => a.saasType === "Unsanctioned").length}</div>
              <div className="text-xs text-muted-foreground">Unsanctioned</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cloud className="h-4 w-4 text-primary" /> Cloud Application Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {(["name", "sessions", "users", "risk"] as SortKey[]).map(key => (
                    <TableHead key={key} className="text-xs cursor-pointer select-none" onClick={() => handleSort(key)}>
                      <span className="flex items-center gap-1 capitalize">
                        {key} <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                  ))}
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">Bandwidth</TableHead>
                  <TableHead className="text-xs">Classification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((a) => (
                  <TableRow key={a.name}>
                    <TableCell className="text-xs font-medium py-2">{a.name}</TableCell>
                    <TableCell className="text-xs py-2">{a.sessions.toLocaleString()}</TableCell>
                    <TableCell className="text-xs py-2">{a.users}</TableCell>
                    <TableCell className="py-2"><RiskBadge risk={a.risk} /></TableCell>
                    <TableCell className="text-xs py-2">{a.category}</TableCell>
                    <TableCell className="text-xs py-2">{a.bandwidth}</TableCell>
                    <TableCell className="py-2">
                      <StatusBadge status={a.saasType === "Sanctioned" ? "active" : a.saasType === "Tolerated" ? "warning" : "critical"} />
                    </TableCell>
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
