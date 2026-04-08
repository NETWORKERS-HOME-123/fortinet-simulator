import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/widgets/StatusBadge";
import { topWebsites } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Globe, ArrowUpDown } from "lucide-react";
import { useState } from "react";

type SortKey = "domain" | "category" | "visits" | "bandwidth";

export default function TopWebsitesMonitor() {
  const [sortKey, setSortKey] = useState<SortKey>("visits");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const sorted = [...topWebsites].sort((a, b) => {
    const va = a[sortKey];
    const vb = b[sortKey];
    const cmp = typeof va === "number" ? (va as number) - (vb as number) : String(va).localeCompare(String(vb));
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <DashboardLayout title="Top Websites" subtitle="By Category & Sessions">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> Top Websites & Sources by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {(["domain", "category", "visits", "bandwidth"] as SortKey[]).map(key => (
                  <TableHead key={key} className="text-xs cursor-pointer select-none" onClick={() => handleSort(key)}>
                    <span className="flex items-center gap-1 capitalize">
                      {key} <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </TableHead>
                ))}
                <TableHead className="text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((w) => (
                <TableRow key={w.domain}>
                  <TableCell className="text-xs font-mono py-2">{w.domain}</TableCell>
                  <TableCell className="text-xs py-2">{w.category}</TableCell>
                  <TableCell className="text-xs py-2">{w.visits.toLocaleString()}</TableCell>
                  <TableCell className="text-xs py-2">{w.bandwidth}</TableCell>
                  <TableCell className="py-2"><StatusBadge status={w.action} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
