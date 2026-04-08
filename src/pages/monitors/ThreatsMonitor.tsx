import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/widgets/StatusBadge";
import { fortiviewThreats } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ThreatsMonitor() {
  return (
    <DashboardLayout title="FortiView: Threats" subtitle="Threat detection and response">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{fortiviewThreats.length} Threats Detected</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Threat Name</TableHead>
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs">Severity</TableHead>
                <TableHead className="text-xs">Count</TableHead>
                <TableHead className="text-xs">Source</TableHead>
                <TableHead className="text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fortiviewThreats.map((t) => (
                <TableRow key={t.name}>
                  <TableCell className="text-xs font-medium py-2 max-w-[200px] truncate">{t.name}</TableCell>
                  <TableCell className="text-xs py-2">{t.category}</TableCell>
                  <TableCell className="py-2"><StatusBadge status={t.severity} /></TableCell>
                  <TableCell className="text-xs py-2">{t.count.toLocaleString()}</TableCell>
                  <TableCell className="text-xs font-mono py-2">{t.source}</TableCell>
                  <TableCell className="py-2"><StatusBadge status={t.action} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
