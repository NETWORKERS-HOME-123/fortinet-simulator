import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { firewallSourceObjects, firewallDestObjects } from "@/data/mockData";

type SortKey = "name" | "hitCount" | "sessions";

function SortableTable({ data }: { data: typeof firewallSourceObjects }) {
  const [sortKey, setSortKey] = useState<SortKey>("hitCount");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const sorted = [...data].sort((a, b) => {
    const va = a[sortKey];
    const vb = b[sortKey];
    const cmp = typeof va === "number" ? (va as number) - (vb as number) : String(va).localeCompare(String(vb));
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs cursor-pointer" onClick={() => handleSort("name")}>
            <span className="flex items-center gap-1">Object Name <ArrowUpDown className="h-3 w-3" /></span>
          </TableHead>
          <TableHead className="text-xs">Type</TableHead>
          <TableHead className="text-xs">Policy</TableHead>
          <TableHead className="text-xs cursor-pointer" onClick={() => handleSort("hitCount")}>
            <span className="flex items-center gap-1">Hit Count <ArrowUpDown className="h-3 w-3" /></span>
          </TableHead>
          <TableHead className="text-xs cursor-pointer" onClick={() => handleSort("sessions")}>
            <span className="flex items-center gap-1">Sessions <ArrowUpDown className="h-3 w-3" /></span>
          </TableHead>
          <TableHead className="text-xs">Bandwidth</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((obj) => (
          <TableRow key={obj.name}>
            <TableCell className="text-xs font-medium py-2">{obj.name}</TableCell>
            <TableCell className="text-xs py-2">{obj.type}</TableCell>
            <TableCell className="text-xs py-2">{obj.policy}</TableCell>
            <TableCell className="text-xs py-2">{obj.hitCount.toLocaleString()}</TableCell>
            <TableCell className="text-xs py-2">{obj.sessions.toLocaleString()}</TableCell>
            <TableCell className="text-xs py-2">{obj.bandwidth}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function FirewallObjectsMonitor() {
  return (
    <DashboardLayout title="FortiView: Firewall Objects" subtitle="Top Source & Destination Firewall Objects">
      <Tabs defaultValue="source" className="space-y-4">
        <TabsList>
          <TabsTrigger value="source">Top Source Objects</TabsTrigger>
          <TabsTrigger value="destination">Top Destination Objects</TabsTrigger>
        </TabsList>
        <TabsContent value="source">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{firewallSourceObjects.length} Source Objects</CardTitle>
            </CardHeader>
            <CardContent>
              <SortableTable data={firewallSourceObjects} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="destination">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{firewallDestObjects.length} Destination Objects</CardTitle>
            </CardHeader>
            <CardContent>
              <SortableTable data={firewallDestObjects} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
