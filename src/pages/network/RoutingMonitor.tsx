import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/widgets/StatusBadge";
import { routes } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";

type Route = typeof routes[number];
type SortKey = "destination" | "type" | "distance";

export default function RoutingMonitor() {
  const [sortKey, setSortKey] = useState<SortKey>("destination");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sorted = [...routes].sort((a, b) => {
    const va = a[sortKey];
    const vb = b[sortKey];
    const cmp = typeof va === "number" ? (va as number) - (vb as number) : String(va).localeCompare(String(vb));
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <DashboardLayout title="Routing Monitor" subtitle="Static & Dynamic Routing Table">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{routes.length} Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs cursor-pointer" onClick={() => handleSort("destination")}>
                  <span className="flex items-center gap-1">Destination <ArrowUpDown className="h-3 w-3" /></span>
                </TableHead>
                <TableHead className="text-xs">Gateway</TableHead>
                <TableHead className="text-xs">Interface</TableHead>
                <TableHead className="text-xs cursor-pointer" onClick={() => handleSort("type")}>
                  <span className="flex items-center gap-1">Type <ArrowUpDown className="h-3 w-3" /></span>
                </TableHead>
                <TableHead className="text-xs cursor-pointer" onClick={() => handleSort("distance")}>
                  <span className="flex items-center gap-1">Distance <ArrowUpDown className="h-3 w-3" /></span>
                </TableHead>
                <TableHead className="text-xs">Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="text-xs font-mono py-2">{r.destination}</TableCell>
                  <TableCell className="text-xs font-mono py-2">{r.gateway}</TableCell>
                  <TableCell className="text-xs py-2">{r.interface}</TableCell>
                  <TableCell className="py-2">
                    <StatusBadge status={r.type === "static" ? "info" : r.type === "connected" ? "active" : "monitoring"} />
                    <span className="text-xs ml-1">{r.type}</span>
                  </TableCell>
                  <TableCell className="text-xs py-2">{r.distance}</TableCell>
                  <TableCell className="text-xs py-2">{r.priority}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
